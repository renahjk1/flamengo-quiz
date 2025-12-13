const PAYEVO_API_URL = "https://apiv2.payevo.com.br/functions/v1";

interface PayevoCustomer {
  name: string;
  email: string;
  phone: string;
  document?: {
    number: string;
    type: string;
  };
}

interface PayevoAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PayevoItem {
  title: string;
  quantity: number;
  unitPrice: number;
  externalRef?: string;
}

interface CreateTransactionRequest {
  amount: number;
  paymentMethod: "PIX";
  customer: PayevoCustomer;
  items: PayevoItem[];
  pix: {
    expiresInDays: number;
  };
  metadata?: string;
  postbackUrl?: string;
  ip?: string;
  description?: string;
}

interface PayevoTransactionResponse {
  id: string;
  status: string;
  amount: number;
  pix?: {
    qrcode: string;
    expirationDate: string;
    end2EndId?: string;
    receiptUrl?: string;
  };
  customer?: {
    name: string;
    email: string;
  };
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
}

export async function createPixTransaction(
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  },
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  },
  freteValue: number,
  camisaName: string,
  orderId: string,
  utm?: UTMParams,
  webhookUrl?: string
): Promise<{ success: boolean; transactionId?: string; pixCode?: string; qrCodeUrl?: string; error?: string }> {
  const secretKey = process.env.PAYEVO_SECRET_KEY;
  const companyId = process.env.PAYEVO_COMPANY_ID;

  if (!secretKey || !companyId) {
    console.error("Payevo credentials not configured");
    console.error("PAYEVO_SECRET_KEY:", secretKey ? "SET" : "NOT SET");
    console.error("PAYEVO_COMPANY_ID:", companyId ? "SET" : "NOT SET");
    return { success: false, error: "Payevo credentials not configured" };
  }

  // Convert to centavos (Payevo uses centavos)
  const amountInCentavos = Math.round(freteValue * 100);

  // Clean phone - remove non-numeric characters
  const cleanPhone = (customer?.phone || "11999999999").replace(/\D/g, "");

  // Clean CPF - remove non-numeric characters and validate
  let cleanCpf = (customer?.cpf || "").replace(/\D/g, "");
  
  // If CPF is empty or invalid, use a placeholder
  if (!cleanCpf || cleanCpf.length < 11) {
    console.warn("Invalid CPF provided:", cleanCpf, "length:", cleanCpf.length);
    cleanCpf = "00000000000";
  }
  
  console.log("Payevo Customer CPF (masked):", cleanCpf.substring(0, 3) + "***" + cleanCpf.substring(9));

  const requestBody: any = {
    amount: amountInCentavos,
    paymentMethod: "PIX",
    customer: {
      name: customer?.name || "Cliente",
      email: customer?.email || "cliente@email.com",
      phone: cleanPhone,
      document: {
        number: cleanCpf,
        type: "CPF"
      }
    },
    items: [
      {
        title: `Frete - ${camisaName}`,
        quantity: 1,
        unitPrice: amountInCentavos,
        externalRef: orderId,
        tangible: true,
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    metadata: JSON.stringify({ orderId, ...utm }),
    description: `Pedido ${orderId} - ${camisaName}`,
    ip: "0.0.0.0",
  };

  // Add shipping address if provided
  if (address) {
    requestBody.shipping = {
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.cep,
    };
    console.log("Payevo Shipping address added");
  }

  // Only add postbackUrl if it's a valid production URL
  if (webhookUrl && !webhookUrl.includes('localhost') && webhookUrl.startsWith('https://')) {
    requestBody.postbackUrl = webhookUrl;
    console.log("Payevo Webhook URL configured:", webhookUrl);
  }

  // Log request body with masked sensitive data
  const logBody = JSON.parse(JSON.stringify(requestBody));
  if (logBody.customer?.document?.number) {
    logBody.customer.document.number = logBody.customer.document.number.substring(0, 3) + "***" + logBody.customer.document.number.substring(9);
  }
  console.log("Payevo Request Body:", JSON.stringify(logBody, null, 2));

  try {
    // Payevo uses Basic Auth with secret_key
    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    
    console.log("Payevo Auth Header (masked):", `Basic ${auth.substring(0, 20)}...`);
    console.log("Payevo API URL:", PAYEVO_API_URL);

    const response = await fetch(`${PAYEVO_API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Payevo Response Status:", response.status);
    console.log("Payevo Response Headers:", {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });

    let data;
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    console.log("Payevo Raw Response (first 1000 chars):", responseText.substring(0, 1000));

    try {
      if (contentType && contentType.includes('application/json')) {
        data = JSON.parse(responseText);
        console.log("Payevo Response (parsed):", JSON.stringify(data, null, 2));
      } else {
        console.log("Payevo Response (non-JSON, content-type:", contentType, ")");
        console.log("Response body:", responseText.substring(0, 500));
        
        // Try to parse as JSON anyway
        try {
          data = JSON.parse(responseText);
          console.log("Successfully parsed as JSON despite content-type");
        } catch {
          data = { 
            error: `Invalid response format: ${contentType}`, 
            rawResponse: responseText.substring(0, 200) 
          };
        }
      }
    } catch (parseError) {
      console.error("Error parsing Payevo response:", parseError);
      console.log("Response text:", responseText.substring(0, 500));
      data = { 
        error: "Failed to parse response", 
        details: parseError instanceof Error ? parseError.message : String(parseError) 
      };
    }

    if (!response.ok) {
      console.error("Payevo API Error:", data);
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}: ${data.rawResponse || ''}`
      };
    }

    if (!data.id) {
      return { success: false, error: "Transaction ID not found in response" };
    }

    // Extract PIX QR Code and URL
    const pixQrCode = data.pix?.qrcode || "";
    const pixQrCodeUrl = data.pix?.qrcode || "";

    return {
      success: true,
      transactionId: data.id,
      pixCode: pixQrCode,
      qrCodeUrl: pixQrCodeUrl,
    };
  } catch (error) {
    console.error("Payevo API Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getTransaction(transactionId: string): Promise<{ success: boolean; status?: string; isPaid?: boolean; error?: string }> {
  const secretKey = process.env.PAYEVO_SECRET_KEY;

  if (!secretKey) {
    console.error("Payevo credentials not configured");
    return { success: false, error: "Payevo credentials not configured" };
  }

  try {
    const auth = Buffer.from(`${secretKey}:`).toString("base64");

    console.log("Payevo Get Transaction - ID:", transactionId);

    const response = await fetch(`${PAYEVO_API_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    console.log("Payevo Get Transaction Response Status:", response.status);
    console.log("Payevo Get Transaction Response (first 500 chars):", responseText.substring(0, 500));

    let data;
    try {
      if (contentType && contentType.includes('application/json')) {
        data = JSON.parse(responseText);
      } else {
        try {
          data = JSON.parse(responseText);
        } catch {
          console.error("Failed to parse response as JSON");
          data = { error: `Invalid response format: ${contentType}` };
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      data = { error: "Failed to parse response" };
    }

    console.log("Payevo Get Transaction Response (parsed):", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Payevo API Error:", data);
      return { success: false, error: data.message || "Failed to get transaction" };
    }

    // Payevo status: paid, waiting_payment, refused, refunded, chargedback, etc.
    const isPaid = data.status === "paid";

    return {
      success: true,
      status: data.status,
      isPaid,
    };
  } catch (error) {
    console.error("Payevo Get Transaction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
