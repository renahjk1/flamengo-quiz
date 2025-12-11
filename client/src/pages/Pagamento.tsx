import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle, ChevronLeft, Copy, Loader2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";

interface OrderData {
  customer?: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  frete?: {
    type: string;
    name: string;
    time: string;
    value: number;
  };
  camisa?: {
    id: string;
    name: string;
    size: string;
    image: string;
  };
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    src?: string;
    sck?: string;
  };
}

export default function Pagamento() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [pixPayload, setPixPayload] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string>("");
  const [isPaid, setIsPaid] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const hasCreatedPix = useRef(false);

  const createPixMutation = trpc.payment.createPix.useMutation();
  const sendConversionMutation = trpc.payment.sendConversion.useMutation();
  const hasConversionSent = useRef(false);
  
  // Load order data from sessionStorage on mount
  useEffect(() => {
    console.log("Pagamento useEffect started");
    
    try {
      const storedData = sessionStorage.getItem("orderData");
      console.log("Stored data:", storedData);
      
      if (!storedData) {
        setError("Dados do pedido não encontrados. Por favor, refaça o processo.");
        setIsCreating(false);
        return;
      }
      
      let data: OrderData;
      try {
        data = JSON.parse(storedData);
        console.log("Parsed data:", data);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        setError("Erro ao processar dados do pedido.");
        setIsCreating(false);
        return;
      }
      
      setOrderData(data);
      
      // Safe access to all fields
      const customerName = data?.customer?.name;
      const customerEmail = data?.customer?.email;
      const customerPhone = data?.customer?.phone;
      const customerCpf = data?.customer?.cpf;
      
      const addressCep = data?.address?.cep;
      const addressStreet = data?.address?.street;
      const addressNumber = data?.address?.number || "S/N";
      const addressComplement = data?.address?.complement || "";
      const addressNeighborhood = data?.address?.neighborhood || "";
      const addressCity = data?.address?.city || "";
      const addressState = data?.address?.state || "";
      
      const freteType = data?.frete?.type;
      const freteValue = data?.frete?.value;
      
      console.log("Customer:", { customerName, customerEmail, customerPhone, customerCpf });
      console.log("Address:", { addressCep, addressStreet, addressNumber });
      console.log("Frete:", { freteType, freteValue });
      
      // Validate required data
      if (!customerName || !customerEmail || !customerPhone || !customerCpf) {
        setError("Dados do cliente não encontrados. Por favor, refaça o processo.");
        setIsCreating(false);
        return;
      }
      
      if (!freteType || freteValue === undefined || freteValue === null) {
        setError("Dados do frete não encontrados. Por favor, refaça o processo.");
        setIsCreating(false);
        return;
      }
      
      if (!addressCep || !addressStreet) {
        setError("Dados do endereço não encontrados. Por favor, refaça o processo.");
        setIsCreating(false);
        return;
      }
      
      // All data valid, create PIX
      if (!hasCreatedPix.current) {
        hasCreatedPix.current = true;
        console.log("Creating PIX...");
        
        const mutationInput = {
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            cpf: customerCpf,
          },
          address: {
            cep: addressCep,
            street: addressStreet,
            number: addressNumber,
            complement: addressComplement,
            neighborhood: addressNeighborhood,
            city: addressCity,
            state: addressState,
          },
          freteType: freteType as "sedex" | "pac" | "transportadora",
          freteValue: freteValue,
          camisaId: data?.camisa?.id || "1",
          camisaName: data?.camisa?.name || "Camisa Flamengo",
          camisaSize: data?.camisa?.size || "M",
          utm: data?.utm,
        };
        
        console.log("Mutation input:", JSON.stringify(mutationInput, null, 2));
        
        createPixMutation.mutate(mutationInput, {
          onSuccess: (response) => {
            console.log("PIX response:", response);
            if (response.success && response.pixPayload) {
              setPixPayload(response.pixPayload);
              setTransactionId(response.transactionId || "");
              setOrderId(response.orderId || "");
            } else {
              setError(response.error || "Erro ao gerar PIX");
            }
            setIsCreating(false);
          },
          onError: (err) => {
            console.error("PIX error:", err);
            setError(err.message || "Erro ao conectar com o servidor");
            setIsCreating(false);
          },
        });
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      setError(`Erro inesperado: ${e instanceof Error ? e.message : String(e)}`);
      setIsCreating(false);
    }
  }, []);

  const statusQuery = trpc.payment.checkStatus.useQuery(
    { transactionId },
    {
      enabled: !!transactionId && !isPaid,
      refetchInterval: 5000,
    }
  );

  // Check payment status and redirect when paid
  useEffect(() => {
    if (statusQuery.data?.isPaid && !hasConversionSent.current) {
      hasConversionSent.current = true;
      setIsPaid(true);
      
      // Send conversion to UTMify
      if (orderData && transactionId && orderId) {
        sendConversionMutation.mutate({
          orderId: orderId,
          transactionId: transactionId,
          amount: orderData.frete?.value || 0,
          customer: {
            name: orderData.customer?.name || "",
            email: orderData.customer?.email || "",
            phone: orderData.customer?.phone || "",
            cpf: orderData.customer?.cpf || "",
          },
          product: {
            name: orderData.camisa?.name || "Camisa Flamengo",
            price: orderData.frete?.value || 0,
            quantity: 1,
          },
          utm: orderData.utm,
          paymentMethod: "pix",
        });
      }
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        window.location.href = "https://flamengo-quiz-production.up.railway.app/nf1";
      }, 2000);
    }
  }, [statusQuery.data, orderData, transactionId, orderId, sendConversionMutation]);

  const handleCopyPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const freteValue = orderData?.frete?.value ?? 0;

  if (isPaid) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Pagamento Confirmado!</h1>
            <p className="text-gray-600 mb-4">
              Seu pedido foi confirmado com sucesso!
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Número do pedido:</p>
              <p className="font-bold text-[#EE4D2D]">{orderId}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecionando...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <Header />

      <main className="container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-2xl">
        <div className="bg-white md:rounded-lg shadow-sm overflow-hidden">
          {/* Header da Página */}
          <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
            <Link href="/frete">
              <ChevronLeft className="text-[#EE4D2D] cursor-pointer" />
            </Link>
            <h1 className="text-lg font-medium text-gray-800">Pagamento via PIX</h1>
          </div>

          {isCreating ? (
            <div className="text-center py-12 px-6">
              <Loader2 className="w-12 h-12 animate-spin text-[#EE4D2D] mx-auto mb-4" />
              <p className="text-gray-600">Gerando código PIX...</p>
              {orderData?.camisa?.name && (
                <p className="text-sm text-gray-500 mt-2">Itens: {orderData.camisa.name}</p>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => setLocation("/frete")}
                variant="outline"
                className="border-[#EE4D2D] text-[#EE4D2D]"
              >
                Voltar e tentar novamente
              </Button>
            </div>
          ) : (
            <div className="p-6">
              {/* Mensagem de Sucesso */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-800">PIX gerado com sucesso!</p>
                    <p className="text-sm text-green-700">
                      Copie o código ou use a câmera para ler o QR Code e realize o pagamento no app do seu banco.
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-sm">
                  <QRCodeSVG 
                      value={pixPayload} 
                      size={192}
                      level="M"
                      includeMargin={true}
                      className="rounded-lg"
                    />
                </div>
                <p className="text-sm text-gray-500">
                  Escaneie o QR Code ou copie o código abaixo
                </p>
              </div>

              {/* PIX Copia e Cola */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  PIX Copia e Cola
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixPayload}
                    readOnly
                    className="flex-1 p-3 border rounded-lg bg-gray-50 text-sm text-gray-600 truncate"
                  />
                  <Button
                    onClick={handleCopyPix}
                    className={`${
                      copied ? "bg-green-500" : "bg-[#EE4D2D]"
                    } hover:bg-[#D73211] text-white px-4`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} className="mr-1" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-1" /> Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                  <div>
                    <p className="font-medium text-yellow-800">Aguardando pagamento...</p>
                    <p className="text-sm text-yellow-600">
                      O status será atualizado automaticamente
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">Resumo do Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produto</span>
                    <span className="font-medium text-right">{orderData?.camisa?.name || "Camisa Flamengo"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor do Produto</span>
                    <span className="font-medium text-green-600">GRÁTIS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frete</span>
                    <span className="font-medium">R$ {freteValue.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-[#EE4D2D]">
                      R$ {freteValue.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instruções */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold text-gray-800 mb-4">Como pagar com PIX:</h3>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="bg-[#EE4D2D] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>Abra o app do seu banco</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#EE4D2D] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>Escolha pagar com PIX e cole o código</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#EE4D2D] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>Confirme o pagamento</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-xs">
          <p>© 2025 Shopee. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
