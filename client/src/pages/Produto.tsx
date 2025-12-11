import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, MessageCircle, Share2, ShoppingCart, Star, Truck } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";

const products = {
  "1": {
    id: "1",
    name: "Camisa Flamengo Adidas I 2025 - Oficial Torcedor",
    price: "399,90",
    image: "/images/camisa1.webp",
    rating: "5.0",
    sold: "10mil+"
  },
  "2": {
    id: "2",
    name: "Camisa Flamengo Adidas II 2025 - Branca Oficial",
    price: "399,90",
    image: "/images/camisa2.png",
    rating: "4.9",
    sold: "5mil+"
  },
  "3": {
    id: "3",
    name: "Camisa Flamengo Adidas III 2025 - Edição Especial Dourada",
    price: "429,90",
    image: "/images/camisa3.webp",
    rating: "5.0",
    sold: "2mil+"
  }
};

export default function Produto() {
  const [match, params] = useRoute("/produto/:id");
  const id = params?.id as keyof typeof products;
  const product = products[id] || products["1"];
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const sizes = ["P", "M", "G", "GG", "XG"];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans pb-20">
      <Header />
      
      <main className="container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-4xl">
        {/* Breadcrumb (Desktop only) */}
        <div className="hidden md:flex items-center text-sm text-gray-500 mb-4 gap-2">
          <Link href="/">Shopee</Link>
          <ChevronRight size={14} />
          <Link href="/parabens">Flamengo</Link>
          <ChevronRight size={14} />
          <span className="truncate">{product.name}</span>
        </div>

        <div className="bg-white md:rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Imagem do Produto */}
            <div className="w-full md:w-1/2 bg-gray-50 relative">
              <img src={product.image} alt={product.name} className="w-full aspect-square object-contain p-8" />
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <div className="bg-white/80 p-2 rounded-full shadow-sm cursor-pointer hover:text-[#EE4D2D]">
                  <Heart size={20} />
                </div>
                <div className="bg-white/80 p-2 rounded-full shadow-sm cursor-pointer hover:text-[#EE4D2D]">
                  <Share2 size={20} />
                </div>
              </div>
              
              {/* Selo de Desconto */}
              <div className="absolute bottom-0 w-full bg-[#EE4D2D]/90 text-white p-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">OFERTA RELÂMPAGO</span>
                  <span className="text-[10px]">Termina em 04:59:59</span>
                </div>
                <div className="bg-yellow-400 text-[#EE4D2D] text-xs font-bold px-2 py-1 rounded">
                  100% OFF
                </div>
              </div>
            </div>

            {/* Detalhes do Produto */}
            <div className="w-full md:w-1/2 p-4 md:p-6">
              <h1 className="text-lg md:text-xl font-medium text-gray-800 mb-2 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center text-[#EE4D2D] border-r pr-4 border-gray-200">
                  <span className="underline font-bold mr-1">{product.rating}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#EE4D2D" />)}
                  </div>
                </div>
                <div className="border-r pr-4 border-gray-200">
                  <span className="font-bold text-gray-800 mr-1">1.2k</span>
                  <span className="text-gray-500">Avaliações</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800 mr-1">{product.sold}</span>
                  <span className="text-gray-500">Vendidos</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-gray-400 line-through text-sm">R$ {product.price}</span>
                  <span className="text-3xl font-bold text-[#EE4D2D]">R$ 0,00</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#EE4D2D] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">
                    CUPOM ATIVADO
                  </span>
                  <span className="text-xs text-[#EE4D2D] font-medium">
                    Desconto de torcedor aplicado com sucesso
                  </span>
                </div>
              </div>

              {/* Seleção de Tamanho */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-3">Tamanho</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2 border rounded-sm text-sm transition-all ${
                        selectedSize === size 
                          ? "border-[#EE4D2D] text-[#EE4D2D] bg-[#EE4D2D]/5 font-bold" 
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tamanho {selectedSize} selecionado (Estoque baixo: apenas 3 unidades)
                  </p>
                )}
              </div>

              {/* Frete */}
              <div className="mb-8">
                <h3 className="text-sm text-gray-500 mb-2">Envio</h3>
                <div className="flex items-start gap-3">
                  <Truck size={20} className="text-gray-500 mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-800">Envio Imediato</span>
                      <span className="bg-[#EE4D2D] text-white text-[10px] font-bold px-1 rounded-sm">
                        RÁPIDO
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Para todo o Brasil via Correios ou Transportadora
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação (Desktop) */}
              <div className="hidden md:flex gap-4">
                <Button variant="outline" className="flex-1 border-[#EE4D2D] text-[#EE4D2D] bg-[#EE4D2D]/10 hover:bg-[#EE4D2D]/20 h-12">
                  <MessageCircle size={18} className="mr-2" /> Conversar Agora
                </Button>
                <Link href={selectedSize ? "/endereco" : "#"} className="flex-1">
                  <Button 
                    className={`w-full h-12 font-bold ${
                      selectedSize 
                        ? "bg-[#EE4D2D] hover:bg-[#d73211] text-white" 
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                    disabled={!selectedSize}
                  >
                    RECEBER MEU PRÊMIO
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição do Produto */}
        <div className="bg-white md:rounded-lg shadow-sm mt-4 p-4 md:p-6">
          <h3 className="bg-gray-50 p-3 text-gray-800 font-medium mb-4 uppercase text-sm">
            Descrição do Produto
          </h3>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
            <p>
              Vista o manto sagrado com orgulho! Esta camisa oficial do Flamengo é produzida com tecnologia de ponta para garantir conforto e estilo dentro e fora dos estádios.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tecnologia AEROREADY para absorção de suor</li>
              <li>Escudo bordado em alta definição</li>
              <li>Tecido 100% poliéster reciclado</li>
              <li>Modelagem padrão para liberdade de movimentos</li>
            </ul>
            <p className="text-[#EE4D2D] font-bold mt-4">
              Produto Oficial Licenciado pelo Clube de Regatas do Flamengo.
            </p>
          </div>
        </div>
      </main>

      {/* Barra Fixa Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex md:hidden z-50 items-center gap-2">
        <div className="flex flex-col items-center justify-center px-3 border-r border-gray-200 text-gray-500">
          <MessageCircle size={20} />
          <span className="text-[10px]">Chat</span>
        </div>
        <div className="flex flex-col items-center justify-center px-3 border-r border-gray-200 text-gray-500">
          <ShoppingCart size={20} />
          <span className="text-[10px]">Add</span>
        </div>
        <Link href={selectedSize ? "/endereco" : "#"} className="flex-1">
          <Button 
            className={`w-full font-bold ${
              selectedSize 
                ? "bg-[#EE4D2D] hover:bg-[#d73211] text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
            disabled={!selectedSize}
          >
            {selectedSize ? "RECEBER MEU PRÊMIO" : "SELECIONE O TAMANHO"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
