import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createPixTransaction, getTransaction } from "./skalepay";
import { sendConversionToUtmify } from "./utmify";

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
          utm: z.object({
            utm_source: z.string().optional(),
            utm_medium: z.string().optional(),
            utm_campaign: z.string().optional(),
            utm_term: z.string().optional(),
            utm_content: z.string().optional(),
            src: z.string().optional(),
            sck: z.string().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const orderId = `FLA-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        try {
          const result = await createPixTransaction(
            input.customer,
            input.freteValue,
            input.camisaName,
            orderId,
            input.utm
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Erro ao criar pagamento",
            };
          }

          // Send to UTMify with waiting_payment status
          try {
            await sendConversionToUtmify({
              orderId: orderId,
              transactionId: result.transactionId || '',
              amount: input.freteValue,
              customer: input.customer,
              product: {
                name: input.camisaName,
                price: input.freteValue,
                quantity: 1,
              },
              utm: input.utm,
              paymentMethod: 'pix',
              status: 'waiting_payment',
            });
            console.log('UTMify: PIX gerado enviado com sucesso');
          } catch (utmifyError) {
            console.error('UTMify error (non-blocking):', utmifyError);
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

    // Send conversion to UTMify when payment is confirmed
    // Simplified PIX creation for NF1 (tax payment)
    createPixSimple: publicProcedure
      .input(
        z.object({
          amount: z.number(),
          description: z.string(),
          customerName: z.string().optional(),
          customerEmail: z.string().optional(),
          customerPhone: z.string().optional(),
          customerCpf: z.string().optional(),
          utm: z.object({
            utm_source: z.string().optional(),
            utm_medium: z.string().optional(),
            utm_campaign: z.string().optional(),
            utm_term: z.string().optional(),
            utm_content: z.string().optional(),
            src: z.string().optional(),
            sck: z.string().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const orderId = `NF1-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        try {
          const result = await createPixTransaction(
            {
              name: input.customerName || 'Cliente NF1',
              email: input.customerEmail || 'cliente@nf1.com',
              phone: input.customerPhone || '11999999999',
              cpf: input.customerCpf || '12345678901',
            },
            input.amount,
            input.description,
            orderId,
            input.utm
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Erro ao criar pagamento",
            };
          }

          // Send to UTMify with waiting_payment status for NF1
          try {
            await sendConversionToUtmify({
              orderId: orderId,
              transactionId: result.transactionId || '',
              amount: input.amount,
              customer: {
                name: input.customerName || 'Cliente NF1',
                email: input.customerEmail || 'cliente@nf1.com',
                phone: input.customerPhone || '11999999999',
                cpf: input.customerCpf || '12345678901',
              },
              product: {
                name: input.description,
                price: input.amount,
                quantity: 1,
              },
              utm: input.utm,
              paymentMethod: 'pix',
              status: 'waiting_payment',
            });
            console.log('UTMify: PIX NF1 gerado enviado com sucesso');
          } catch (utmifyError) {
            console.error('UTMify error (non-blocking):', utmifyError);
          }

          return {
            success: true,
            transactionId: result.transactionId,
            orderId: orderId,
            pixCode: result.pixCode || "",
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

    sendConversion: publicProcedure
      .input(
        z.object({
          orderId: z.string(),
          transactionId: z.string(),
          amount: z.number(),
          customer: z.object({
            name: z.string(),
            email: z.string(),
            phone: z.string(),
            cpf: z.string(),
          }),
          product: z.object({
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
          }),
          utm: z.object({
            utm_source: z.string().optional(),
            utm_medium: z.string().optional(),
            utm_campaign: z.string().optional(),
            utm_term: z.string().optional(),
            utm_content: z.string().optional(),
            src: z.string().optional(),
            sck: z.string().optional(),
          }).optional(),
          paymentMethod: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // IMPORTANT: Send with status 'paid' to mark as approved conversion
          const result = await sendConversionToUtmify({
            ...input,
            status: 'paid',
          });
          console.log('UTMify: Conversão PAGA enviada com sucesso para orderId:', input.orderId);
          return result;
        } catch (error) {
          console.error("UTMify conversion error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao enviar conversão",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
