import { ENV } from "./_core/env";

const SUNIZE_API_URL = "https://api.sunize.com.br/v1";

interface SunizeCustomer {
  name: string;
  email: string;
  phone: string;
  document_type: "CPF" | "CNPJ";
  document: string;
}

interface SunizeItem {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  is_physical: boolean;
}

interface CreateTransactionRequest {
  external_id: string;
  total_amount: number;
  payment_method: "PIX";
  items: SunizeItem[];
  ip: string;
  customer: SunizeCustomer;
}

interface SunizeTransactionResponse {
  id: string;
  external_id: string;
  status: "AUTHORIZED" | "PENDING" | "CHARGEBACK" | "FAILED" | "IN_DISPUTE";
  total_value: number;
  customer: {
    email: string;
    name: string;
  };
  payment_method: string;
  pix?: {
    payload: string;
  };
  hasError: boolean;
  error?: string;
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
  clientIp: string
): Promise<SunizeTransactionResponse> {
  const apiKey = process.env.SUNIZE_API_KEY;
  const apiSecret = process.env.SUNIZE_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Sunize API credentials not configured");
  }

  const requestBody: CreateTransactionRequest = {
    external_id: orderId,
    total_amount: freteValue,
    payment_method: "PIX",
    items: [
      {
        id: "frete-" + orderId,
        title: "Frete - " + camisaName,
        description: "Taxa de envio para camiseta do Flamengo",
        price: freteValue,
        quantity: 1,
        is_physical: true,
      },
    ],
    ip: clientIp,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone.replace(/\D/g, ""),
      document_type: "CPF",
      document: customer.cpf.replace(/\D/g, ""),
    },
  };

  const response = await fetch(`${SUNIZE_API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-api-secret": apiSecret,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok || data.hasError) {
    console.error("Sunize API Error:", data);
    throw new Error(data.error || "Failed to create transaction");
  }

  return data as SunizeTransactionResponse;
}

export async function getTransaction(transactionId: string): Promise<SunizeTransactionResponse> {
  const apiKey = process.env.SUNIZE_API_KEY;
  const apiSecret = process.env.SUNIZE_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Sunize API credentials not configured");
  }

  const response = await fetch(`${SUNIZE_API_URL}/transactions/${transactionId}`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "x-api-secret": apiSecret,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Sunize API Error:", data);
    throw new Error(data.error || "Failed to get transaction");
  }

  return data as SunizeTransactionResponse;
}
