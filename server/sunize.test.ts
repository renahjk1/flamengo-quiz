import { describe, expect, it } from "vitest";

describe("Sunize API Credentials", () => {
  it("should have valid API credentials configured", async () => {
    const apiKey = process.env.SUNIZE_API_KEY;
    const apiSecret = process.env.SUNIZE_API_SECRET;

    // Check that credentials are set
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiSecret).toBeDefined();
    expect(apiSecret).not.toBe("");

    // Test API connection by making a simple request
    // We'll try to create a minimal transaction to verify credentials
    const response = await fetch("https://api.sunize.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey!,
        "x-api-secret": apiSecret!,
      },
      body: JSON.stringify({
        external_id: "test-validation-" + Date.now(),
        total_amount: 0.01,
        payment_method: "PIX",
        items: [
          {
            id: "test-item",
            title: "Validation Test",
            description: "Testing API credentials",
            price: 0.01,
            quantity: 1,
            is_physical: false,
          },
        ],
        ip: "127.0.0.1",
        customer: {
          name: "Test User",
          email: "test@test.com",
          phone: "11999999999",
          document_type: "CPF",
          document: "12345678909",
        },
      }),
    });

    // If we get 401, credentials are invalid
    // If we get 200 or 400 (validation error), credentials are valid
    expect(response.status).not.toBe(401);
    
    console.log("Sunize API Response Status:", response.status);
    const data = await response.json();
    console.log("Sunize API Response:", JSON.stringify(data, null, 2));
  });
});
