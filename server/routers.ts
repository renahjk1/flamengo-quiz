import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createPixTransaction, getTransaction } from "./skalepay";
import { sendConversionToUtmify } from "./utmify";
import { createTransaction } from "./transaction-service";

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
          const webhookUrl = process.env.WEBHOOK_URL || process.env.APP_URL ? `${process.env.APP_URL}/api/webhook/skale` : undefined;
          
          const result = await createPixTransaction(
            input.customer,
            input.freteValue,
            input.camisaName,
            orderId,
            input.utm,
            webhookUrl
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Erro ao criar pagamento",
            };
          }

          // Save transaction to database
          try {
            await createTransaction({
              orderId: orderId,
              transactionId: result.transactionId || '',
              status: 'waiting_payment',
              amount: Math.round(input.freteValue * 100),
              customerName: input.customer.name,
              customerEmail: input.customer.email,
              customerPhone: input.customer.phone,
              customerCpf: input.customer.cpf,
              productName: input.camisaName,
              productPrice: Math.round(input.freteValue * 100),
              productQuantity: 1,
              paymentMethod: 'pix',
              utmSource: input.utm?.utm_source,
              utmMedium: input.utm?.utm_medium,
              utmCampaign: input.utm?.utm_campaign,
              utmTerm: input.utm?.utm_term,
              utmContent: input.utm?.utm_content,
              src: input.utm?.src,
              sck: input.utm?.sck,
              utmifySent: 0,
            });
            console.log('Transaction saved to database:', orderId);
          } catch (dbError) {
            console.error('Error saving transaction to database:', dbError);
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
          const webhookUrl = process.env.WEBHOOK_URL || process.env.APP_URL ? `${process.env.APP_URL}/api/webhook/skale` : undefined;
          
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
            input.utm,
            webhookUrl
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Erro ao criar pagamento",
            };
          }

          // Save transaction to database
          try {
            await createTransaction({
              orderId: orderId,
              transactionId: result.transactionId || '',
              status: 'waiting_payment',
              amount: Math.round(input.amount * 100),
              customerName: input.customerName || 'Cliente NF1',
              customerEmail: input.customerEmail || 'cliente@nf1.com',
              customerPhone: input.customerPhone || '11999999999',
              customerCpf: input.customerCpf || '12345678901',
              productName: input.description,
              productPrice: Math.round(input.amount * 100),
              productQuantity: 1,
              paymentMethod: 'pix',
              utmSource: input.utm?.utm_source,
              utmMedium: input.utm?.utm_medium,
              utmCampaign: input.utm?.utm_campaign,
              utmTerm: input.utm?.utm_term,
              utmContent: input.utm?.utm_content,
              src: input.utm?.src,
              sck: input.utm?.sck,
              utmifySent: 0,
            });
            console.log('Transaction saved to database:', orderId);
          } catch (dbError) {
            console.error('Error saving transaction to database:', dbError);
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
