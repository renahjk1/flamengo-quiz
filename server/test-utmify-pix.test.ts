import { describe, it, expect } from 'vitest';
import { sendConversionToUtmify } from './utmify';

describe('UTMify PIX Gerado', () => {
  it('deve enviar PIX gerado com status waiting_payment', async () => {
    const result = await sendConversionToUtmify({
      orderId: `TEST-PIX-${Date.now()}`,
      transactionId: '123456789',
      amount: 29.51,
      customer: {
        name: 'Teste PIX Gerado',
        email: 'teste@pix.com',
        phone: '11999999999',
        cpf: '12345678901',
      },
      product: {
        name: 'Camisa Flamengo Adidas I 2025',
        price: 29.51,
        quantity: 1,
      },
      utm: {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'flamengo_camisa_2025',
      },
      paymentMethod: 'pix',
      status: 'waiting_payment',
    });

    console.log('Resultado:', result);
    expect(result.success).toBe(true);
  });
});
