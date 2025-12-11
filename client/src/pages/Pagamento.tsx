import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle, ChevronLeft, Copy, Loader2, QrCode, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [orderData, setOrderData] = useState<OrderData>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load order data from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = JSON.parse(sessionStorage.getItem("orderData") || "{}");
      setOrderData(data);
      setDataLoaded(true);
    }
  }, []);

  const createPixMutation = trpc.payment.createPix.useMutation();
  const statusQuery = trpc.payment.checkStatus.useQuery(
    { transactionId },
    {
      enabled: !!transactionId && !isPaid,
      refetchInterval: 5000,
    }
  );

  // Create PIX when data is loaded
  useEffect(() => {
    if (!dataLoaded) return;
    
    if (!orderData.customer || !orderData.frete || !orderData.address) {
      setError("Dados do pedido não encontrados. Por favor, refaça o processo.");
      setIsCreating(false);
      return;
    }

    createPixMutation.mutate(
      {
        customer: orderData.customer,
        address: {
          cep: orderData.address.cep || "",
          street: orderData.address.street || "",
          number: orderData.address.number || "",
          complement: orderData.address.complement || "",
          neighborhood: orderData.address.neighborhood || "",
          city: orderData.address.city || "",
          state: orderData.address.state || "",
        },
        freteType: orderData.frete.type as "sedex" | "pac" | "transportadora",
        freteValue: orderData.frete.value || 0,
        camisaId: orderData.camisa?.id || "1",
        camisaName: orderData.camisa?.name || "Camisa Flamengo",
        camisaSize: orderData.camisa?.size || "M",
      },
      {
        onSuccess: (data) => {
          if (data.success && data.pixPayload) {
            setPixPayload(data.pixPayload);
            setTransactionId(data.transactionId || "");
            setOrderId(data.orderId || "");
          } else {
            setError(data.error || "Erro ao gerar PIX");
          }
          setIsCreating(false);
        },
        onError: (err) => {
          setError(err.message || "Erro ao conectar com o servidor");
          setIsCreating(false);
        },
      }
    );
  }, [dataLoaded, orderData]);

  // Check payment status
  useEffect(() => {
    if (statusQuery.data?.isPaid) {
      setIsPaid(true);
    }
  }, [statusQuery.data]);

  const handleCopyPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const freteValue = orderData.frete?.value || 0;

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
            <p className="text-gray-600 mb-6">
              Seu pedido foi confirmado com sucesso. Você receberá um e-mail com os detalhes do envio.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500">Número do pedido:</p>
              <p className="font-bold text-[#EE4D2D]">{orderId}</p>
            </div>
            <Button
              onClick={() => setLocation("/")}
              className="w-full bg-[#EE4D2D] hover:bg-[#D73211] text-white"
            >
              Voltar ao Início
            </Button>
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
              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-sm">
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-600" />
                  </div>
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
                    <span className="font-medium">R$ 0,00</span>
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
