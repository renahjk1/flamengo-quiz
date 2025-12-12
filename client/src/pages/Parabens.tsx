import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Parabens() {
  const [userData, setUserData] = useState<{ nome: string; winnerNumber: number } | null>(null);
  
  useEffect(() => {
    const data = sessionStorage.getItem("userData");
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);
  
  // Pegar primeiro nome
  const firstName = userData?.nome?.split(" ")[0] || "Torcedor";
  const winnerNumber = userData?.winnerNumber || 2956;
  
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Mensagem de Sucesso - Versão mais discreta */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <p className="text-gray-700 text-center text-sm">
            <span className="font-semibold text-[#EE4D2D]">{firstName}</span>, você é o ganhador <span className="font-bold">#{winnerNumber}</span> de 3.000! Escolha seu modelo abaixo.
          </p>
        </div>

        {/* Grid de Produtos */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[#EE4D2D] pl-3 uppercase">
          Escolha seu Prêmio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <Link href="/produto/1">
            <Card className="cursor-pointer hover:border-[#EE4D2D] transition-all hover:shadow-lg group border-transparent h-full flex flex-col">
              <div className="relative">
                <img src="/images/camisa1.webp" alt="Camisa I 2025" className="w-full aspect-square object-contain bg-gray-50 p-4" />
                <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-xs font-bold px-2 py-1">
                  -100%
                </div>
                <div className="absolute top-0 left-0 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                  🔥 3 unid.
                </div>
                <div className="absolute bottom-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                  <Truck size={10} /> ENVIO IMEDIATO
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#EE4D2D]">
                  Camisa Flamengo Adidas I 2025 - Oficial Torcedor
                </h3>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 line-through">R$ 399,90</span>
                    <span className="text-lg font-bold text-[#EE4D2D]">R$ 0,00</span>
                  </div>
                  <Button className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold h-9 text-xs">
                    RESGATAR AGORA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2 */}
          <Link href="/produto/2">
            <Card className="cursor-pointer hover:border-[#EE4D2D] transition-all hover:shadow-lg group border-transparent h-full flex flex-col">
              <div className="relative">
                <img src="/images/camisa2.png" alt="Camisa II 2025" className="w-full aspect-square object-contain bg-gray-50 p-4" />
                <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-xs font-bold px-2 py-1">
                  -100%
                </div>
                <div className="absolute top-0 left-0 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                  🔥 7 unid.
                </div>
                <div className="absolute bottom-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                  <Truck size={10} /> ENVIO IMEDIATO
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#EE4D2D]">
                  Camisa Flamengo Adidas II 2025 - Branca Oficial
                </h3>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 line-through">R$ 399,90</span>
                    <span className="text-lg font-bold text-[#EE4D2D]">R$ 0,00</span>
                  </div>
                  <Button className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold h-9 text-xs">
                    RESGATAR AGORA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 3 */}
          <Link href="/produto/3">
            <Card className="cursor-pointer hover:border-[#EE4D2D] transition-all hover:shadow-lg group border-transparent h-full flex flex-col">
              <div className="relative">
                <img src="/images/camisa3.webp" alt="Camisa III 2025" className="w-full aspect-square object-contain bg-gray-50 p-4" />
                <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-xs font-bold px-2 py-1">
                  -100%
                </div>
                <div className="absolute top-0 left-0 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                  🔥 34 unid.
                </div>
                <div className="absolute bottom-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                  <Truck size={10} /> ENVIO IMEDIATO
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#EE4D2D]">
                  Camisa Flamengo Adidas III 2025 - Edição Especial Dourada
                </h3>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 line-through">R$ 429,90</span>
                    <span className="text-lg font-bold text-[#EE4D2D]">R$ 0,00</span>
                  </div>
                  <Button className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold h-9 text-xs">
                    RESGATAR AGORA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 4 - Esgotado */}
          <div className="relative opacity-60 grayscale cursor-not-allowed h-full flex flex-col">
            <Card className="border-transparent h-full flex flex-col">
              <div className="relative">
                <img src="/images/camisa4.webp" alt="Camisa Mundial 2025" className="w-full aspect-square object-contain bg-gray-50 p-4" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="bg-black/80 text-white px-4 py-2 rounded-full font-bold text-sm border border-white transform -rotate-12">
                    ESGOTADO
                  </div>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2 mb-2">
                  Camisa Flamengo Mundial 2025 - Edição Limitada
                </h3>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 line-through">R$ 599,90</span>
                    <span className="text-lg font-bold text-gray-500">R$ 0,00</span>
                  </div>
                  <Button disabled className="w-full bg-gray-300 text-gray-500 font-bold h-9 text-xs">
                    INDISPONÍVEL
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
