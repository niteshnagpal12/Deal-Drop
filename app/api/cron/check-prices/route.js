import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role to bypass RLS (row level security)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLL_KEY
    );

    // getting  all the prodcuts from the products table
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) throw productsError;

    // local object to store the cron job status
    let results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanged: 0,
      alertSent: 0,
    };

    // iterating through all the products to check their prices
    for (const product of products) {
      try {
        const productData = await scrapeProduct(product.url);

        // if no current price found, skip to next product
        if (!productData.currentPrice) {
          results.failed += 1;
          continue;
        }

        // getting new and old prices
        const newPrice = parseFloat(productData.currentPrice);
        const oldPrice = parseFloat(product.current_price);

        // updating the product price in the products table
        await supabase
          .from("products")
          .update({
            current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageURL || product.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        //   updating the price history table with new price entry
        if (newPrice !== oldPrice) {
          await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          //   updating the results object
          results.priceChanged += 1;

          //   checking if the price has dropped
          if (newPrice < oldPrice) {
            // getting the user details to send alert
            const {
              data: { user },
            } = await supabase.auth.admin.getUserById(product.user_id);

            if (user?.email) {
              const emailResult = await sendPriceDropEmail(
                user.email,
                product,
                oldPrice,
                newPrice
              );

              if (emailResult.success) {
                results.alertSent++;
              }
            }
          }
        }

        results.updated += 1;
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
      }
    }

    // sending the cron job results as response
    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ message: "Price check endpoint" });
}
