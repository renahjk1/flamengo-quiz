import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ChevronLeft, Truck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Frete() {
  const [, setLocation] = useLocation();
  const [selectedFrete, setSelectedFrete] = useState<string | null>(null);

  const freteOptions = [
    {
      id: "sedex",
      name: "CORREIOS SEDEX",
      time: "1 a 3 dias úteis",
      price: "34,95",
      icon: "/images/correios-logo.png" // Placeholder, usaremos ícone genérico se não tiver imagem
    },
    {
      id: "pac",
      name: "CORREIOS PAC",
      time: "3 a 7 dias úteis",
      price: "29,51",
      icon: "/images/correios-logo.png"
    },
    {
      id: "transportadora",
      name: "TRANSPORTADORA EXPRESS",
      time: "2 a 4 dias úteis",
      price: "31,05",
      icon: "/images/transportadora-logo.png"
    }
  ];

  const handleSelect = (id: string) => {
    setSelectedFrete(id);
  };

  const handleContinue = () => {
    if (selectedFrete) {
      const selectedOption = freteOptions.find(o => o.id === selectedFrete);
      // Get existing order data and add frete info
      const existingData = JSON.parse(sessionStorage.getItem("orderData") || "{}");
      const orderData = {
        ...existingData,
        frete: {
          type: selectedFrete,
          name: selectedOption?.name,
          time: selectedOption?.time,
          value: parseFloat(selectedOption?.price.replace(",", ".") || "0"),
        },
      };
      sessionStorage.setItem("orderData", JSON.stringify(orderData));
      setLocation("/pagamento");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <Header />
      
      <main className="container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-2xl">
        <div className="bg-white md:rounded-lg shadow-sm overflow-hidden">
          {/* Header da Página */}
          <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
            <Link href="/endereco">
              <ChevronLeft className="text-[#EE4D2D] cursor-pointer" />
            </Link>
            <h1 className="text-lg font-medium text-gray-800">Opções de Envio</h1>
          </div>

          <div className="p-6">
            {/* Aviso de frete não gratuito */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-amber-800">Frete não gratuito</p>
                <p className="text-xs text-amber-700 mt-1">
                  Como seu pedido não atingiu o valor mínimo de <span className="font-bold">R$ 39,90</span>, o frete não será gratuito. 
                  Selecione uma das opções de envio abaixo.
                </p>
              </div>
            </div>

            <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Selecione a modalidade de entrega</h2>
            
            <div className="space-y-3">
              {freteOptions.map((option) => (
                <Card 
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`cursor-pointer transition-all p-4 flex items-center justify-between border-2 ${
                    selectedFrete === option.id 
                      ? "border-[#EE4D2D] bg-[#FFF5F1]" 
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${selectedFrete === option.id ? "bg-[#EE4D2D]/10" : "bg-gray-100"}`}>
                      <Truck size={24} className={selectedFrete === option.id ? "text-[#EE4D2D]" : "text-gray-500"} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{option.name}</h3>
                      <p className="text-sm text-gray-500">Chega em: {option.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-[#EE4D2D]">R$ {option.price}</span>
                    {selectedFrete === option.id && (
                      <span className="text-[10px] text-[#EE4D2D] font-bold">SELECIONADO</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal do Produto</span>
                <span className="font-bold text-gray-800">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Frete</span>
                <span className="font-bold text-[#EE4D2D]">
                  {selectedFrete 
                    ? `R$ ${freteOptions.find(o => o.id === selectedFrete)?.price}` 
                    : "R$ 0,00"}
                </span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Total a Pagar</span>
                <span className="font-bold text-xl text-[#EE4D2D]">
                  {selectedFrete 
                    ? `R$ ${freteOptions.find(o => o.id === selectedFrete)?.price}` 
                    : "R$ 0,00"}
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                onClick={handleContinue}
                className={`w-full h-12 font-bold text-lg ${
                  selectedFrete 
                    ? "bg-[#EE4D2D] hover:bg-[#d73211] text-white" 
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
                disabled={!selectedFrete}
              >
                IR PARA O PAGAMENTO
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
