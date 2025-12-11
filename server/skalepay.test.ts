import { describe, it, expect } from 'vitest';

const SKALEPAY_API_URL = "https://api.conta.skalepay.com.br/v1";

describe('SkalePay API Integration', () => {
  it('should have API credentials configured', () => {
    expect(process.env.SKALEPAY_SECRET_KEY).toBeDefined();
    console.log("SKALEPAY_SECRET_KEY exists:", !!process.env.SKALEPAY_SECRET_KEY);
  });

  it('should create a PIX transaction successfully', async () => {
    const secretKey = process.env.SKALEPAY_SECRET_KEY;
    expect(secretKey).toBeDefined();

    // Test with minimum amount (R$ 5.00 = 500 centavos)
    const requestBody = {
      amount: 500,
      paymentMethod: "pix",
      customer: {
        name: "Teste Integração",
        email: "teste@teste.com",
        document: {
          number: "12345678909", // CPF válido de teste
          type: "cpf",
        },
        phone: "11999999999",
      },
      items: [
        {
          title: "Teste de Integração SkalePay",
          quantity: 1,
          unitPrice: 500,
          tangible: false,
        },
      ],
      pix: {
        expiresInDays: 1,
      },
    };

    console.log("Request Body:", JSON.stringify(requestBody, null, 2));

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
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    // Verify response
    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    
    if (data.pix) {
      console.log("PIX QR Code URL:", data.pix.qrCodeUrl);
      console.log("PIX Code (first 50 chars):", data.pix.qrCode?.substring(0, 50) + "...");
    }
  });
});
