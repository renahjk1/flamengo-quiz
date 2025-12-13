import { getDb } from "./db";
import { transactions, InsertTransaction, Transaction } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function createTransaction(data: InsertTransaction): Promise<Transaction> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.insert(transactions).values(data);
  const created = await db.query.transactions.findFirst({
    where: eq(transactions.orderId, data.orderId),
  });
  if (!created) {
    throw new Error("Failed to create transaction");
  }
  return created;
}

export async function getTransactionByOrderId(orderId: string): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("Database not available");
    return undefined;
  }
  
  return db.query.transactions.findFirst({
    where: eq(transactions.orderId, orderId),
  });
}

export async function getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("Database not available");
    return undefined;
  }
  
  return db.query.transactions.findFirst({
    where: eq(transactions.transactionId, transactionId),
  });
}

export async function updateTransactionStatus(
  transactionId: string,
  status: "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback",
  paidAt?: Date
): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("Database not available");
    return undefined;
  }
  
  const updateData: any = { status, updatedAt: new Date() };
  if (status === "paid" && paidAt) {
    updateData.paidAt = paidAt;
  }

  await db.update(transactions).set(updateData).where(eq(transactions.transactionId, transactionId));

  return db.query.transactions.findFirst({
    where: eq(transactions.transactionId, transactionId),
  });
}

export async function markUtmifySent(transactionId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("Database not available");
    return;
  }
  
  await db.update(transactions).set({ utmifySent: 1 }).where(eq(transactions.transactionId, transactionId));
}
