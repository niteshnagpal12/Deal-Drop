import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPriceDropEmail(
  userEmail,
  product,
  oldPrice,
  newPrice
) {
  // calculating price drop and percentage
  const priceDrop = oldPrice - newPrice;
  const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(1);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: userEmail,
      subject: `Price Drop Alert: ${product.name} is now ${newPrice}${product.currency}`,
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Drop Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">    
        <img src="${product.image_url}" alt="${product.name}" style="max-width: 100%; height: auto; margin-bottom: 20px;">
        <h2 style="color: #2c3e50;">Price Drop Alert!</h2>
        <p>The price of the product <strong>${product.name}</strong> has dropped!</p>
        <p><strong>Old Price:</strong> ${oldPrice}${product.currency}</p>
        <p><strong>New Price:</strong> ${newPrice}${product.currency}</p>
        <p><strong>You Save:</strong> ${priceDrop}${product.currency} (${percentageDrop}%)</p>
        <p><strong>Product URL:</strong> <a href="${product.url}">${product.url}</a></p>
        </div>
      </body>
      </html>`,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Send price drop email error:", error);
    return { error: error.message };
  }
}
