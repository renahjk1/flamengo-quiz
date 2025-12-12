import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { useUTM } from "@/hooks/useUTM";
import { ChevronRight, Gift, Package, Star, Trophy, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  // Capture UTM params on page load
  useUTM();
  
  const [userData, setUserData] = useState<{ nome: string; winnerNumber: number } | null>(null);
  
  useEffect(() => {
    const data = sessionStorage.getItem("userData");
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);
  
  // Pegar primeiro nome
  const firstName = userData?.nome?.split(" ")[0] || "Torcedor";
  const winnerNumber = userData?.winnerNumber || 2971;
  
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Banner de Parabéns - Ganhador */}
        <div className="bg-gradient-to-r from-[#C4161C] to-[#8B0000] rounded-lg p-4 mb-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-full shrink-0">
              <Trophy className="w-6 h-6 text-[#8B0000]" />
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 font-bold text-lg">
                Parabéns, {firstName}! 🎉
              </p>
              <p className="text-white text-sm">
                Você é o ganhador <span className="font-bold text-yellow-400">#{winnerNumber}</span> de <span className="font-bold">3.000</span>
              </p>
            </div>
          </div>
          <div className="mt-3 bg-white/10 rounded p-2 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-xs">Restam apenas <span className="font-bold text-yellow-400">{3000 - winnerNumber}</span> camisetas!</span>
          </div>
        </div>

        {/* Banner Principal */}
        <div className="w-full rounded-lg overflow-hidden shadow-md mb-6 bg-black">
          <img 
            src="/images/banner-loja-novo.png" 
            alt="Loja Oficial do Flamengo na Shopee" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Banner de Frete Grátis - Discreto */}
        <div className="bg-[#00B14F] py-1.5 px-3 rounded mb-3 flex items-center justify-center gap-1.5">
          <Truck className="text-white w-3.5 h-3.5" />
          <span className="text-white text-xs"><span className="font-semibold">Frete grátis</span> em pedidos acima de <span className="font-bold">R$ 39,90</span></span>
        </div>

        {/* Seção de Cupons Compacta */}
        <div className="bg-white p-3 rounded-lg shadow-sm mb-4 flex items-center gap-3 border-l-4 border-[#EE4D2D]">
          <div className="bg-[#EE4D2D]/10 p-2 rounded-full shrink-0">
            <Star className="text-[#EE4D2D] w-5 h-5" fill="#EE4D2D" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-[#EE4D2D] leading-tight">CUPOM TORCEDOR ATIVADO</h3>
            <p className="text-gray-500 text-xs">100% de desconto aplicado</p>
          </div>
        </div>

        {/* Categorias */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 uppercase border-l-4 border-[#EE4D2D] pl-3">
              ESCOLHA SEU MANTO
            </h2>
            <Link href="/parabens" className="text-[#EE4D2D] flex items-center text-sm font-medium hover:underline">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1 */}
            <Link href="/produto/1">
              <Card className="cursor-pointer hover:border-[#EE4D2D] transition-all hover:shadow-lg group border-transparent">
                <div className="relative">
                  <img src="/images/camisa1.webp" alt="Camisa I 2025" className="w-full aspect-square object-contain bg-gray-50 p-2" />
                  <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-xs font-bold px-2 py-1">
                    -100%
                  </div>
                  <div className="absolute bottom-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                    <Truck size={10} /> ENVIO IMEDIATO
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#EE4D2D]">
                    Camisa Flamengo Adidas I 2025 - Oficial Torcedor
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 line-through">R$ 399,90</span>
                    <span className="text-base font-bold text-[#EE4D2D]">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center">
                      <Star size={10} className="text-yellow-400" fill="#facc15" />
                      <span className="ml-1">5.0</span>
                    </div>
                    <span>10mil+ vendidos</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Card 2 */}
            <Link href="/produto/2">
              <Card className="cursor-pointer hover:border-[#EE4D2D] transition-all hover:shadow-lg group border-transparent">
                <div className="relative">
                  <img src="/images/camisa2.png" alt="Camisa II 2025" className="w-full aspect-square object-contain bg-gray-50 p-2" />
                  <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-xs font-bold px-2 py-1">
                    -100%
                  </div>
                  <div className="absolute bottom-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                    <Truck size={10} /> ENVIO IMEDIATO
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#EE4D2D]">
                    Camisa Flamengo Adidas II 2025 - Branca Oficial
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 line-through">R$ 399,90</span>
                    <span className="text-base font-bold text-[#EE4D2D]">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center">
                      <Star size={10} className="text-yellow-400" fill="#facc15" />
                      <span className="ml-1">4.9</span>
                    </div>
                    <span>5mil+ vendidos</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Card 3 */}
            <Link href="/produto/3">
              <Card className="cursor-pointer hover:border-[#EE4D2D] transition-all hover:shadow-lg group border-transparent">
                <div className="relative">
                  <img src="/images/camisa3.webp" alt="Camisa III 2025" className="w-full aspect-square object-contain bg-gray-50 p-2" />
                  <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-xs font-bold px-2 py-1">
                    -100%
                  </div>
                  <div className="absolute bottom-0 left-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                    <Truck size={10} /> ENVIO IMEDIATO
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#EE4D2D]">
                    Camisa Flamengo Adidas III 2025 - Edição Especial Dourada
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 line-through">R$ 429,90</span>
                    <span className="text-base font-bold text-[#EE4D2D]">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center">
                      <Star size={10} className="text-yellow-400" fill="#facc15" />
                      <span className="ml-1">5.0</span>
                    </div>
                    <span>2mil+ vendidos</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Card 4 - Esgotado */}
            <div className="relative opacity-70 grayscale cursor-not-allowed">
              <Card className="border-transparent">
                <div className="relative">
                  <img src="/images/camisa4.webp" alt="Camisa Mundial 2025" className="w-full aspect-square object-contain bg-gray-50 p-2" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-black/80 text-white px-4 py-2 rounded-full font-bold text-sm border border-white">
                      ESGOTADO
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2">
                    Camisa Flamengo Mundial 2025 - Edição Limitada
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 line-through">R$ 599,90</span>
                    <span className="text-base font-bold text-gray-500">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center">
                      <Star size={10} className="text-yellow-400" fill="#facc15" />
                      <span className="ml-1">5.0</span>
                    </div>
                    <span>Esgotado</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>


      </main>

      {/* Footer Simples */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-xs">
          <p className="mb-2">© 2025 Shopee. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-4">
            <span>Política de Privacidade</span>
            <span>Termos de Uso</span>
            <span>Central de Ajuda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
