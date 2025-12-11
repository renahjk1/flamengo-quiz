import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createPixTransaction, getTransaction } from "./skalepay";

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
      .mutation(async ({ input }) => {
        const orderId = `FLA-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        try {
          const result = await createPixTransaction(
            input.customer,
            input.freteValue,
            input.camisaName,
            orderId
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Erro ao criar pagamento",
            };
          }

          return {
            success: true,
            transactionId: result.transactionId,
            orderId: orderId,
            pixPayload: result.pixCode || "",
            secureUrl: result.secureUrl || "",
            status: "waiting_payment",
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
          const result = await getTransaction(input.transactionId);
          
          if (!result.success) {
            return {
              success: false,
              error: result.error || "Erro ao verificar status",
            };
          }

          return {
            success: true,
            status: result.status,
            isPaid: result.isPaid,
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
