import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function Pagamento() {
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
            <h1 className="text-lg font-medium text-gray-800">Pagamento</h1>
          </div>

          <div className="p-6 text-center py-12">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode size={40} className="text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gerando PIX...</h2>
            <p className="text-gray-500 mb-8">
              Aguarde enquanto geramos seu código PIX para pagamento do frete.
            </p>

            <div className="bg-gray-50 p-6 rounded border border-gray-200 max-w-sm mx-auto mb-8">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-48 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold h-12">
                <CreditCard className="mr-2" size={18} /> PAGAR COM CARTÃO
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Ambiente seguro e criptografado. Seus dados estão protegidos.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
