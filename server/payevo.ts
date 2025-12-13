const PAYEVO_API_URL = "https://apiv2.payevo.com.br/functions/v1";

interface PayevoCustomer {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
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
    return { success: false, error: "Payevo credentials not configured" };
  }

  // Convert to centavos (Payevo uses centavos)
  const amountInCentavos = Math.round(freteValue * 100);

  // Clean phone - remove non-numeric characters
  const cleanPhone = (customer?.phone || "11999999999").replace(/\D/g, "");

  // Clean CPF - remove non-numeric characters
  const cleanCpf = (customer?.cpf || "00000000000").replace(/\D/g, "");

  const requestBody: any = {
    amount: amountInCentavos,
    paymentMethod: "PIX",
    customer: {
      name: customer?.name || "Cliente",
      email: customer?.email || "cliente@email.com",
      phone: cleanPhone,
      cpf: cleanCpf,
    },
    items: [
      {
        title: `Frete - ${camisaName}`,
        quantity: 1,
        unitPrice: amountInCentavos,
        externalRef: orderId,
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    metadata: JSON.stringify({ orderId, ...utm }),
    description: `Pedido ${orderId} - ${camisaName}`,
    ip: "0.0.0.0", // Will be replaced by actual IP if available
  };

  // Only add postbackUrl if it's a valid production URL
  if (webhookUrl && !webhookUrl.includes('localhost') && webhookUrl.startsWith('https://')) {
    requestBody.postbackUrl = webhookUrl;
  }

  console.log("Payevo Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    // Payevo uses Basic Auth with secret_key
    const auth = Buffer.from(`${secretKey}:`).toString("base64");

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

    let data;
    const contentType = response.headers.get('content-type');

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log("Payevo Response:", JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log("Payevo Response (non-JSON):", text.substring(0, 500));
        data = { error: `Invalid response format: ${contentType}` };
      }
    } catch (parseError) {
      console.error("Error parsing Payevo response:", parseError);
      const text = await response.text();
      console.log("Response text:", text.substring(0, 500));
      data = { error: "Failed to parse response" };
    }

    if (!response.ok) {
      console.error("Payevo API Error:", data);
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`
      };
    }

    if (!data.id) {
      return { success: false, error: "Transaction ID not found in response" };
    }

    // Extract PIX QR Code and URL
    const pixQrCode = data.pix?.qrcode || "";
    const pixQrCodeUrl = data.pix?.qrcode || ""; // Payevo returns the QR code string directly

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
    return { success: false, error: "Payevo credentials not configured" };
  }

  try {
    const auth = Buffer.from(`${secretKey}:`).toString("base64");

    const response = await fetch(`${PAYEVO_API_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    console.log("Payevo Get Transaction Response:", JSON.stringify(data, null, 2));

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
