import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createPixTransaction, getTransaction } from "./sunize";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  payment: router({
    createPix: publicProcedure
      .input(
        z.object({
          customer: z.object({
            name: z.string().min(3),
            email: z.string().email(),
            phone: z.string().min(10),
            cpf: z.string().min(11),
          }),
          address: z.object({
            cep: z.string(),
            street: z.string(),
            number: z.string(),
            complement: z.string().optional(),
            neighborhood: z.string(),
            city: z.string(),
            state: z.string(),
          }),
          freteType: z.enum(["sedex", "pac", "transportadora"]),
          freteValue: z.number(),
          camisaId: z.string(),
          camisaName: z.string(),
          camisaSize: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const orderId = `FLA-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const clientIp = ctx.req.headers["x-forwarded-for"] as string || ctx.req.ip || "127.0.0.1";

        try {
          const transaction = await createPixTransaction(
            input.customer,
            input.freteValue,
            input.camisaName,
            orderId,
            clientIp
          );

          return {
            success: true,
            transactionId: transaction.id,
            orderId: orderId,
            pixPayload: transaction.pix?.payload || "",
            status: transaction.status,
          };
        } catch (error) {
          console.error("Payment creation error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao criar pagamento",
          };
        }
      }),

    checkStatus: publicProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ input }) => {
        try {
          const transaction = await getTransaction(input.transactionId);
          return {
            success: true,
            status: transaction.status,
            isPaid: transaction.status === "AUTHORIZED",
          };
        } catch (error) {
          console.error("Status check error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao verificar status",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
