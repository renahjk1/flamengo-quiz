import { Request, Response } from "express";
import { sendConversionToUtmify } from "./utmify";
import { updateTransaction } from "./transaction-service";

interface DuttyfyWebhookPayload {
  transactionId: string;
  status: "PENDING" | "COMPLETED";
  paidAt?: string;
  amount?: number;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
  };
  utm?: string;
}

export async function handleDuttyfyWebhook(req: Request, res: Response) {
  try {
    const payload: DuttyfyWebhookPayload = req.body;

    console.log("DUTTYFY Webhook received:", JSON.stringify(payload, null, 2));

    // Only process COMPLETED payments
    if (payload.status !== "COMPLETED") {
      console.log("Webhook status is not COMPLETED, ignoring:", payload.status);
      return res.status(200).json({ received: true });
    }

    if (!payload.transactionId) {
      console.error("No transactionId in webhook payload");
      return res.status(400).json({ error: "Missing transactionId" });
    }

    // Update transaction status in database
    try {
      await updateTransaction(payload.transactionId, {
        status: "paid",
        paidAt: new Date(payload.paidAt || Date.now()),
      });
      console.log("Transaction updated in database:", payload.transactionId);
    } catch (dbError) {
      console.error("Error updating transaction in database:", dbError);
      // Continue anyway - we'll still send to UTMify
    }

    // Parse UTM parameters if present
    let utmParams: any = {};
    if (payload.utm) {
      const utmParts = payload.utm.split("&");
      utmParts.forEach((part) => {
        const [key, value] = part.split("=");
        if (key && value) {
          utmParams[key] = decodeURIComponent(value);
        }
      });
    }

    // Send conversion to UTMify with paid status
    try {
      await sendConversionToUtmify({
        orderId: payload.transactionId,
        transactionId: payload.transactionId,
        amount: payload.amount || 0,
        customer: {
          name: payload.customer?.name || "Cliente",
          email: payload.customer?.email || "cliente@email.com",
          phone: payload.customer?.phone || "11999999999",
          cpf: payload.customer?.document || "00000000000",
        },
        product: {
          name: payload.description || "Produto",
          price: payload.amount || 0,
          quantity: 1,
        },
        utm: utmParams,
        paymentMethod: "pix",
        status: "paid",
      });

      console.log("Conversion sent to UTMify for transaction:", payload.transactionId);
    } catch (utmError) {
      console.error("Error sending conversion to UTMify:", utmError);
      // Still return success - webhook was processed
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling DUTTYFY webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
