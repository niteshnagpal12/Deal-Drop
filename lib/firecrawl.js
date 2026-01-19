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
          prompt: ` Extract the product details from the page.
            1.Productname: full title of the product
            2.currentPrice: Extract only the active, current selling price as a number. CRITICAL: if the price is 0, 0.00 or seems to be loading, do NOT extract it, return null instead. Do not guess or calculate the price from your side
            3. currencyCode: the currency (eg, INR, USD,etc)
            4. productImageURL: the URL of the product image if available
            Ignore any prices from 'Related Products','Similar Products', 'Sponsored' sections or 'You May Also Like' sections
            `,
        },
      ],
      waitFor: 1000,
      timeout: 20000,
      onlyMainContent: false,
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
      "This product cannot be tracked right now, please try a different product or try again later.",
    );
  }
}
