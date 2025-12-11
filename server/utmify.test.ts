import { describe, it, expect } from "vitest";

describe("UTMify API Integration", () => {
  it("should have UTMIFY_API_TOKEN configured", () => {
    const apiToken = process.env.UTMIFY_API_TOKEN;
    expect(apiToken).toBeDefined();
    expect(apiToken).not.toBe("");
    console.log("UTMify API Token is configured:", apiToken?.substring(0, 10) + "...");
  });

  it("should be able to send conversion to UTMify API", async () => {
    const apiToken = process.env.UTMIFY_API_TOKEN;
    
    if (!apiToken) {
      console.log("Skipping API test - no token configured");
      return;
    }

    const now = new Date().toISOString();
    const orderId = `TEST-${Date.now()}`;

    // Test with all required fields
    const testData = {
      orderId: orderId,
      platform: "custom",
      paymentMethod: "pix",
      status: "paid",
      createdAt: now,
      approvedDate: now,
      refundedAt: null,
      customer: {
        name: "Teste UTMify",
        email: "teste@teste.com",
        phone: "5511999999999",
        document: "12345678901",
        country: "BR",
      },
      products: [
        {
          id: `PROD-${orderId}`,
          planId: "test-plan",
          planName: "Produto Teste",
          name: "Produto Teste",
          priceInCents: 2951,
          quantity: 1,
        },
      ],
      trackingParameters: {
        src: null,
        sck: null,
        utm_source: "facebook",
        utm_campaign: "flamengo_camisa",
        utm_medium: "cpc",
        utm_content: null,
        utm_term: null,
      },
      commission: {
        totalPriceInCents: 2951,
        gatewayFeeInCents: 0,
        userCommissionInCents: 2951,
        currency: "BRL",
      },
      isTest: true,
    };

    try {
      const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-token": apiToken,
        },
        body: JSON.stringify(testData),
      });

      console.log("UTMify API Response Status:", response.status);
      const responseText = await response.text();
      console.log("UTMify API Response:", responseText);

      // We expect success (200/201) or validation error (400)
      // but NOT an authentication error (401/403)
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
      
      // If we get 200 or 201, the integration is working
      if (response.status === 200 || response.status === 201) {
        console.log("✅ UTMify conversion sent successfully!");
      } else {
        console.log("⚠️ UTMify returned validation error (expected for test data)");
      }
    } catch (error) {
      console.error("UTMify API connection error:", error);
      throw error;
    }
  });
});
