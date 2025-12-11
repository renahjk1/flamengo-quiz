import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Star, Truck } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Banner Principal */}
        <div className="w-full rounded-lg overflow-hidden shadow-md mb-6 bg-black">
          <img 
            src="/images/banner-loja.webp" 
            alt="Loja Oficial do Flamengo na Shopee" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Seção de Cupons */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between border-l-4 border-[#EE4D2D]">
          <div className="flex items-center gap-4">
            <div className="bg-[#EE4D2D]/10 p-3 rounded-full">
              <Star className="text-[#EE4D2D]" fill="#EE4D2D" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#EE4D2D]">CUPOM TORCEDOR ATIVADO</h3>
              <p className="text-gray-500 text-sm">Você ganhou 100% de desconto em 1 item selecionado</p>
            </div>
          </div>
          <Button className="bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold">
            USAR AGORA
          </Button>
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
                  <div className="absolute bottom-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                    <Truck size={10} /> FRETE GRÁTIS
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
                  <div className="absolute bottom-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                    <Truck size={10} /> FRETE GRÁTIS
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
                  <div className="absolute bottom-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1 flex items-center gap-1">
                    <Truck size={10} /> FRETE GRÁTIS
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

        {/* Banner Secundário */}
        <div className="bg-gradient-to-r from-[#C3281E] to-black rounded-lg p-6 text-white text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">PARCERIA OFICIAL FLAMENGO X SHOPEE</h2>
          <p className="mb-4 opacity-90">Resgate seu manto sagrado agora mesmo. Estoque limitado!</p>
          <Link href="/parabens">
            <Button className="bg-white text-[#C3281E] hover:bg-gray-100 font-bold px-8">
              RESGATAR MEU PRÊMIO
            </Button>
          </Link>
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
