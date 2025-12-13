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

    // Find transaction in database
    const transaction = await getTransactionByTransactionId(transactionId);

    if (!transaction) {
      console.warn(`Transaction ${transactionId} not found in database`);
      // Still return 200 to acknowledge receipt
      return res.status(200).json({ success: true, message: "Transaction not found" });
    }

    console.log(`Processing webhook for transaction ${transactionId}, status: ${status}`);

    // Update transaction status in database
    await updateTransactionStatus(transactionId, status, status === "paid" ? new Date(payload.data.paidAt || new Date()) : undefined);

    // If payment was confirmed, send conversion to Utmify
    if (status === "paid" && !transaction.utmifySent) {
      try {
        console.log(`Sending paid conversion to Utmify for order ${transaction.orderId}`);

        const result = await sendConversionToUtmify({
          orderId: transaction.orderId,
          transactionId: transaction.transactionId,
          amount: transaction.amount / 100, // Convert from cents to reais
          customer: {
            name: transaction.customerName,
            email: transaction.customerEmail,
            phone: transaction.customerPhone,
            cpf: transaction.customerCpf,
          },
          product: {
            name: transaction.productName,
            price: transaction.productPrice / 100, // Convert from cents to reais
            quantity: transaction.productQuantity,
          },
          utm: {
            utm_source: transaction.utmSource || undefined,
            utm_medium: transaction.utmMedium || undefined,
            utm_campaign: transaction.utmCampaign || undefined,
            utm_term: transaction.utmTerm || undefined,
            utm_content: transaction.utmContent || undefined,
            src: transaction.src || undefined,
            sck: transaction.sck || undefined,
          },
          paymentMethod: transaction.paymentMethod,
          status: "paid",
        });

        if (result.success) {
          await markUtmifySent(transactionId);
          console.log(`Successfully sent paid conversion to Utmify for order ${transaction.orderId}`);
        } else {
          console.error(`Failed to send conversion to Utmify: ${result.error}`);
        }
      } catch (utmifyError) {
        console.error("Error sending conversion to Utmify:", utmifyError);
        // Don't fail the webhook response, just log the error
      }
    }

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Payevo webhook:", error);
    // Return 200 anyway to prevent Payevo from retrying
    return res.status(200).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
}
