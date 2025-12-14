const DUTTYFY_API_URL = "https://www.pagamentos-seguros.app/api-pix";

interface DuttyfyCustomer {
  name: string;
  document: string; // CPF only, no formatting
  email: string;
  phone: string; // DDD + number, no formatting
}

interface DuttyfyItem {
  title: string;
  price: number; // in centavos
  quantity: number;
}

interface CreatePixRequest {
  amount: number; // in centavos
  description: string;
  customer: DuttyfyCustomer;
  item: DuttyfyItem;
  paymentMethod: "PIX";
  utm?: string;
}

interface DuttyfyTransactionResponse {
  pixCode: string;
  transactionId: string;
  status: "PENDING" | "COMPLETED";
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
  amount: number,
  description: string,
  utm?: UTMParams
): Promise<{ success: boolean; transactionId?: string; pixCode?: string; error?: string }> {
  const apiKey = process.env.DUTTYFY_API_KEY;

  if (!apiKey) {
    console.error("DUTTYFY API key not configured");
    return { success: false, error: "DUTTYFY API key not configured" };
  }

  // Clean CPF - remove non-numeric characters
  let cleanCpf = (customer?.cpf || "").replace(/\D/g, "");

  if (!cleanCpf || cleanCpf.length < 11) {
    console.warn("Invalid CPF provided:", cleanCpf);
    return { success: false, error: "CPF inválido" };
  }

  // Clean phone - remove non-numeric characters
  const cleanPhone = (customer?.phone || "").replace(/\D/g, "");

  if (!cleanPhone || cleanPhone.length < 10) {
    console.warn("Invalid phone provided:", cleanPhone);
    return { success: false, error: "Telefone inválido" };
  }

  // Build UTM string if provided
  let utmString = "";
  if (utm) {
    const utmParts = [];
    if (utm.utm_source) utmParts.push(`utm_source=${encodeURIComponent(utm.utm_source)}`);
    if (utm.utm_medium) utmParts.push(`utm_medium=${encodeURIComponent(utm.utm_medium)}`);
    if (utm.utm_campaign) utmParts.push(`utm_campaign=${encodeURIComponent(utm.utm_campaign)}`);
    if (utm.utm_term) utmParts.push(`utm_term=${encodeURIComponent(utm.utm_term)}`);
    if (utm.utm_content) utmParts.push(`utm_content=${encodeURIComponent(utm.utm_content)}`);
    if (utm.src) utmParts.push(`src=${encodeURIComponent(utm.src)}`);
    if (utm.sck) utmParts.push(`sck=${encodeURIComponent(utm.sck)}`);
    if (utmParts.length > 0) {
      utmString = utmParts.join("&");
    }
  }

  const requestBody: CreatePixRequest = {
    amount: Math.round(amount * 100), // Convert to centavos
    description: description,
    customer: {
      name: customer?.name || "Cliente",
      document: cleanCpf,
      email: customer?.email || "cliente@email.com",
      phone: cleanPhone,
    },
    item: {
      title: description,
      price: Math.round(amount * 100),
      quantity: 1,
    },
    paymentMethod: "PIX",
    ...(utmString && { utm: utmString }),
  };

  console.log("DUTTYFY Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${DUTTYFY_API_URL}/${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("DUTTYFY Response Status:", response.status);

    const data = await response.json();
    console.log("DUTTYFY Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("DUTTYFY API Error:", data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    if (!data.pixCode || !data.transactionId) {
      return { success: false, error: "Invalid response from DUTTYFY" };
    }

    return {
      success: true,
      transactionId: data.transactionId,
      pixCode: data.pixCode,
    };
  } catch (error) {
    console.error("DUTTYFY API Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTransaction(transactionId: string): Promise<{ success: boolean; status?: string; isPaid?: boolean; error?: string }> {
  const apiKey = process.env.DUTTYFY_API_KEY;

  if (!apiKey) {
    console.error("DUTTYFY API key not configured");
    return { success: false, error: "DUTTYFY API key not configured" };
  }

  try {
    console.log("DUTTYFY Get Transaction - ID:", transactionId);

    const response = await fetch(`${DUTTYFY_API_URL}/${apiKey}?transactionId=${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("DUTTYFY Get Transaction Response Status:", response.status);

    const data = await response.json();
    console.log("DUTTYFY Get Transaction Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("DUTTYFY API Error:", data);
      return { success: false, error: data.error || "Failed to get transaction" };
    }

    // DUTTYFY status: PENDING or COMPLETED
    const isPaid = data.status === "COMPLETED";

    return {
      success: true,
      status: data.status,
      isPaid,
    };
  } catch (error) {
    console.error("DUTTYFY Get Transaction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
