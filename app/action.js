"use server";

import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut(formData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

// handler to trim url
function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s),]+/);
  return match ? match[0] : null;
}

// function to add the scraped product to the database
export async function addProdcut(formData) {
  const url = extractUrl(formData.get("url"));

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    // get the supabase info from server side createClient
    const supabase = await createClient();

    // get the user info
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // check if the user is authenticated
    if (!user) {
      return { error: "User not authenticated" };
    }

    // after user authentication, call the firecrawl api to scrape the product data
    const productData = await scrapeProduct(url);
    // console.log("product data", productData);
    if (!productData.productName || !productData.currentPrice) {
      return { error: "Failed to extract product data from the provided URL" };
    }

    const newPrice = parseFloat(productData.currentPrice);
    const currency = productData.currencyCode || "INR";

    if (!newPrice) {
      throw new Error("Failed to extract price from the provided URL");
    }

    // get the products details from product table of supabase
    // check if the product exists to determine if it's an update
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id,current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    console.log("existing product:", existingProduct);
    console.log("new price:", newPrice);

    const isUpdate = !!existingProduct;

    // update the prodcuct table with new product attributes
    // Upsert product (insert or update based on user_id + url)
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency: currency,
          image_url: productData.productImageURL,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", //unique constraint on user id and url
          ignoreDuplicates: false, //always update the existing record
        },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }
    console.log("***********************");

    // insert this new product to the product history table of supabase
    //  Add to price history if it's a new product OR price changed
    const shouldAddPriceHistory =
      !isUpdate || existingProduct?.current_price !== newPrice;
    console.log("shouldAddPriceHistory:", shouldAddPriceHistory);
    if (shouldAddPriceHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currency,
      });
    }

    // revalidate the home page to show the new product
    revalidatePath("/");

    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated successfully"
        : "Product added successfully",
    };
  } catch (error) {
    console.error("Add product error:", error);
    return { error: error.message || "Failed to add product" };
  }
}

// handler to delete a product
export async function deleteProduct(prodcuctId) {
  try {
    const supabase = await createClient();
    // deleting the product from products table
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", prodcuctId);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// handler to fetch all the products
export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

// handler to fetch price history of a product
export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}
