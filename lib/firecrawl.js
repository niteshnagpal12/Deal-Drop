import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function scrapeProduct(url) {
  try {
    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          schema: {
            type: "object",
            required: ["productName", "currentPrice"],
            properties: {
              productName: {
                type: "string",
              },
              currentPrice: {
                type: "string",
              },
              currencyCode: {
                type: "string",
              },
              productImageURL: {
                type: "string",
              },
            },
          },
          prompt:
            "Extract the product name as 'productName', current price as number as 'currentPrice'. currency Code (USD,EUR,etc) as  'currencyCode' and product image URL as 'productImageURL' if available",
        },
      ],
    });

    const extractedData = result.json;

    if (!extractedData) {
      throw new Error("No data extracted for product");
    }

    if (!extractedData.productName || !extractedData.currentPrice) {
      throw new Error("Product details not found");
    }
    return extractedData;
  } catch (error) {
    console.error("Firecrawl scrape error:", error);
    // throw new Error(`Failed to scrape product data: ${error.message}`);
    throw new Error(
      "This product cannot be tracked right now, please try a different product or try again later."
    );
  }
}
