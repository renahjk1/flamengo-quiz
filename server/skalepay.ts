const SKALEPAY_API_URL = "https://api.conta.skalepay.com.br/v1";

// Function to generate a valid CPF
function generateValidCPF(): string {
  const randomDigit = () => Math.floor(Math.random() * 10);
  
  // Generate first 9 digits
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(randomDigit());
  }
  
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit1);
  
  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit2);
  
  const cpf = digits.join('');
  
  // Check for invalid patterns
  const invalidPatterns = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];
  
  if (invalidPatterns.includes(cpf)) {
    return generateValidCPF();
  }
  
  return cpf;
}

interface SkalePayCustomer {
  name: string;
  email: string;
  document: {
    number: string;
    type: "cpf" | "cnpj";
  };
  phone: string;
}

interface SkalePayItem {
  title: string;
  quantity: number;
  unitPrice: number;
  tangible: boolean;
}

interface CreateTransactionRequest {
  amount: number;
  paymentMethod: "pix";
  customer: SkalePayCustomer;
  items: SkalePayItem[];
  pix: {
    expiresInDays: number;
  };
  metadata?: string;
}

interface SkalePayTransactionResponse {
  id: string;
  status: string;
  amount: number;
  pix?: {
    qrCode: string;
    qrCodeUrl: string;
    expirationDate: string;
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
  freteValue: number,
  camisaName: string,
  orderId: string,
  utm?: UTMParams,
  webhookUrl?: string
): Promise<{ success: boolean; transactionId?: string; pixCode?: string; secureUrl?: string; error?: string }> {
  const secretKey = process.env.SKALEPAY_SECRET_KEY;

  if (!secretKey) {
    console.error("SkalePay secret key not configured");
    return { success: false, error: "SkalePay credentials not configured" };
  }

  // Convert to centavos (SkalePay uses centavos)
  const amountInCentavos = Math.round(freteValue * 100);

  // Clean phone - remove non-numeric characters
  const cleanPhone = (customer?.phone || "11999999999").replace(/\D/g, "");
  
  // Generate a valid CPF for the transaction (SkalePay validates CPF)
  const validCpf = generateValidCPF();

  const requestBody: CreateTransactionRequest = {
    amount: amountInCentavos,
    paymentMethod: "pix",
    customer: {
      name: customer?.name || "Cliente",
      email: customer?.email || "cliente@email.com",
      document: {
        number: validCpf,
        type: "cpf",
      },
      phone: cleanPhone,
    },
    items: [
      {
        title: `Frete - ${camisaName}`,
        quantity: 1,
        unitPrice: amountInCentavos,
        tangible: true,
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    metadata: JSON.stringify({ orderId, ...utm }),
    postbackUrl: webhookUrl,
  }

  console.log("SkalePay Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    // SkalePay uses Basic Auth with secret_key:x
    const auth = Buffer.from(`${secretKey}:x`).toString("base64");

    const response = await fetch(`${SKALEPAY_API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log("SkalePay Response Status:", response.status);
    console.log("SkalePay Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("SkalePay API Error:", data);
      return { 
        success: false, 
        error: data.message || data.error || `HTTP ${response.status}` 
      };
    }

    if (!data.id) {
      return { success: false, error: "Transaction ID not found in response" };
    }

    return {
      success: true,
      transactionId: data.id,
      pixCode: data.pix?.qrcode || "",
      secureUrl: data.secureUrl || "",
    };
  } catch (error) {
    console.error("SkalePay API Request Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function getTransaction(transactionId: string): Promise<{ success: boolean; status?: string; isPaid?: boolean; error?: string }> {
  const secretKey = process.env.SKALEPAY_SECRET_KEY;

  if (!secretKey) {
    return { success: false, error: "SkalePay credentials not configured" };
  }

  try {
    const auth = Buffer.from(`${secretKey}:x`).toString("base64");

    const response = await fetch(`${SKALEPAY_API_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    console.log("SkalePay Get Transaction Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("SkalePay API Error:", data);
      return { success: false, error: data.message || "Failed to get transaction" };
    }

    // SkalePay status: paid, waiting_payment, refused, refunded, etc.
    const isPaid = data.status === "paid";

    return {
      success: true,
      status: data.status,
      isPaid,
    };
  } catch (error) {
    console.error("SkalePay Get Transaction Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
