import { Request, Response } from "express";
import { sendConversionToUtmify } from "./utmify";
import { updateTransactionStatus, getTransactionByTransactionId, markUtmifySent } from "./transaction-service";

interface PayevoWebhookPayload {
  id: string;
  type: "transaction" | "checkout" | "transfer";
  objectId: string;
  data: {
    id: string;
    status: "paid" | "waiting_payment" | "refused" | "refunded" | "chargedback";
    amount: number;
    paidAt?: string;
    metadata?: string;
    customer?: {
      name: string;
      email: string;
      phone: string;
      cpf?: string;
    };
    pix?: {
      qrcode?: string;
      expirationDate?: string;
      end2EndId?: string;
      receiptUrl?: string;
    };
  };
}

export async function handlePayevoWebhook(req: Request, res: Response) {
  try {
    const payload: PayevoWebhookPayload = req.body;

    console.log("Received Payevo webhook:", JSON.stringify(payload, null, 2));

    // Only process transaction webhooks
    if (payload.type !== "transaction") {
      console.log("Ignoring non-transaction webhook");
      return res.status(200).json({ success: true, message: "Non-transaction webhook ignored" });
    }

    const transactionId = String(payload.data.id);
    const status = payload.data.status;

    console.log(`Processing webhook for transaction ${transactionId}, status: ${status}`);

    // Only process paid transactions
    if (status !== "paid") {
      console.log(`Ignoring webhook with status: ${status}. Only processing 'paid' status.`);
      return res.status(200).json({ success: true, message: "Non-paid status ignored" });
    }

    // Try to update transaction status in database (optional)
    try {
      await updateTransactionStatus(transactionId, status, new Date(payload.data.paidAt || new Date()));
      console.log(`Transaction status updated in database: ${transactionId}`);
    } catch (dbError) {
      console.warn(`Database not available for updating transaction: ${transactionId}`);
      // Continue anyway - we'll still send to UTMify
    }

    // Send conversion to Utmify for paid transactions
    // Extract metadata to get orderId and UTM parameters
    let metadata: any = {};
    try {
      if (payload.data.metadata) {
        metadata = JSON.parse(payload.data.metadata);
      }
    } catch (parseError) {
      console.warn("Failed to parse metadata:", parseError);
    }

    const orderId = metadata.orderId || transactionId;

    // Try to get transaction from database for more details
    let transaction = null;
    try {
      transaction = await getTransactionByTransactionId(transactionId);
    } catch (dbError) {
      console.warn(`Database not available for getting transaction details`);
    }

    try {
      console.log(`Sending paid conversion to Utmify for order ${orderId}`);

      // Use database data if available, otherwise use webhook data
      const utmifyData = {
        orderId: orderId,
        transactionId: transactionId,
        amount: transaction?.amount ? transaction.amount / 100 : payload.data.amount / 100,
        customer: {
          name: transaction?.customerName || payload.data.customer?.name || "Cliente",
          email: transaction?.customerEmail || payload.data.customer?.email || "cliente@email.com",
          phone: transaction?.customerPhone || payload.data.customer?.phone || "",
          cpf: transaction?.customerCpf || payload.data.customer?.cpf || "",
        },
        product: {
          name: transaction?.productName || "Produto",
          price: transaction?.productPrice ? transaction.productPrice / 100 : payload.data.amount / 100,
          quantity: transaction?.productQuantity || 1,
        },
        utm: {
          utm_source: transaction?.utmSource || metadata.utm_source || undefined,
          utm_medium: transaction?.utmMedium || metadata.utm_medium || undefined,
          utm_campaign: transaction?.utmCampaign || metadata.utm_campaign || undefined,
          utm_term: transaction?.utmTerm || metadata.utm_term || undefined,
          utm_content: transaction?.utmContent || metadata.utm_content || undefined,
          src: transaction?.src || metadata.src || undefined,
          sck: transaction?.sck || metadata.sck || undefined,
        },
        paymentMethod: transaction?.paymentMethod || "pix",
        status: "paid",
      };

      const result = await sendConversionToUtmify(utmifyData);

      if (result.success) {
        // Try to mark as sent in database (optional)
        try {
          await markUtmifySent(transactionId);
          console.log(`Successfully sent paid conversion to Utmify for order ${orderId}`);
        } catch (dbError) {
          console.warn(`Database not available for marking UTMify as sent, but conversion was sent successfully`);
        }
      } else {
        console.error(`Failed to send conversion to Utmify: ${result.error}`);
      }
    } catch (utmifyError) {
      console.error("Error sending conversion to Utmify:", utmifyError);
      // Don't fail the webhook response, just log the error
    }

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Payevo webhook:", error);
    // Return 200 anyway to prevent Payevo from retrying
    return res.status(200).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
}
