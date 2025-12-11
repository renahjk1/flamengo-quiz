// UTMify API Integration
// Documentação: https://pt.scribd.com/document/878608978/Documentac-a-o-API-UTMify
// Endpoint: https://api.utmify.com.br/api-credentials/orders

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface ProductData {
  name: string;
  price: number;
  quantity: number;
}

interface ConversionData {
  orderId: string;
  transactionId: string;
  amount: number;
  customer: CustomerData;
  product: ProductData;
  utm?: UTMParams;
  paymentMethod: string;
}

export async function sendConversionToUtmify(data: ConversionData): Promise<{ success: boolean; error?: string }> {
  const apiToken = process.env.UTMIFY_API_TOKEN;

  if (!apiToken) {
    console.error("UTMify API token not configured");
    return { success: false, error: "UTMify API token not configured" };
  }

  // Clean phone - remove non-numeric characters
  const cleanPhone = data.customer.phone.replace(/\D/g, "");
  
  // Format phone with country code if not present
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

  // Amount in cents
  const amountInCents = Math.round(data.amount * 100);
  
  // Current date in ISO format
  const now = new Date().toISOString();

  // Build the request body according to UTMify API documentation
  const requestBody = {
    // Required fields
    orderId: data.orderId,
    platform: "custom",
    paymentMethod: "pix", // credit_card, boleto, pix, paypal, free_price, unknown
    status: "paid", // waiting_payment, paid, refused, refunded, chargedback
    createdAt: now,
    
    // Approval date (now, since payment was just confirmed)
    approvedDate: now,
    refundedAt: null,
    
    // Customer data
    customer: {
      name: data.customer.name,
      email: data.customer.email,
      phone: formattedPhone,
      document: data.customer.cpf.replace(/\D/g, ""),
      country: "BR",
    },
    
    // Product data with required fields
    products: [
      {
        id: `PROD-${data.orderId}`,
        planId: "flamengo-camisa-2025",
        planName: data.product.name,
        name: data.product.name,
        priceInCents: Math.round(data.product.price * 100),
        quantity: data.product.quantity,
      },
    ],
    
    // Tracking parameters (UTMs)
    trackingParameters: {
      src: data.utm?.src || null,
      sck: data.utm?.sck || null,
      utm_source: data.utm?.utm_source || null,
      utm_campaign: data.utm?.utm_campaign || null,
      utm_medium: data.utm?.utm_medium || null,
      utm_content: data.utm?.utm_content || null,
      utm_term: data.utm?.utm_term || null,
    },
    
    // Commission data
    commission: {
      totalPriceInCents: amountInCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: amountInCents,
      currency: "BRL",
    },
    
    // Not a test
    isTest: false,
  };

  console.log("UTMify Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": apiToken,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("UTMify Response Status:", response.status);
    console.log("UTMify Response Body:", responseText);

    if (!response.ok) {
      // Log but don't fail - UTMify errors shouldn't block the user flow
      console.error("UTMify API error:", responseText);
      return {
        success: false,
        error: `UTMify API error: ${response.status} - ${responseText}`,
      };
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log("UTMify conversion sent successfully:", responseData);
    return { success: true };
  } catch (error) {
    console.error("UTMify API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
