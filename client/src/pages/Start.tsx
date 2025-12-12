import { Button } from "@/components/ui/button";
import { useUTM } from "@/hooks/useUTM";
import { useLocation } from "wouter";

export default function Start() {
  const [, setLocation] = useLocation();
  
  // Capture UTM params on page load
  useUTM();

  const handleStart = () => {
    setLocation("/cadastro");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dc2626] to-black flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Logo */}
        <img 
          src="/images/logo-fla-shopee.png" 
          alt="Shopee X Flamengo" 
          className="h-16 mx-auto mb-6 object-contain"
        />
        
        {/* Título */}
        <h1 className="text-xl md:text-2xl font-bold text-[#dc2626] mb-6 drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis px-2">
          🏆 Desafio do Flamengo! 🏆
        </h1>
        
        {/* Imagem da Campanha */}
        <div className="my-6 relative group">
          <div className="absolute inset-0 bg-[#dc2626]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <img 
            src="/images/campeao-2025.png" 
            alt="Flamengo Campeão" 
            className="w-3/4 max-w-[240px] mx-auto relative z-10 rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Descrição */}
        <div className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 text-justify px-2">
          O <span className="font-bold text-[#dc2626]">Flamengo</span> em parceria com a <span className="font-bold text-[#EE4D2D]">Shopee</span> está distribuindo 3 mil camisetas através de um jogo de perguntas e respostas e os torcedores que acertarem <span className="font-bold text-[#dc2626]">todas as perguntas</span> irá ganhar uma camiseta oficial de graça.
        </div>
        
        {/* Destaque do Prêmio */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg mb-6 border-l-4 border-[#dc2626] shadow-sm overflow-hidden">
          <strong className="text-gray-800 text-xs md:text-sm flex items-center justify-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
            🎁 PRÊMIO: Manto Sagrado Oficial GRÁTIS!
          </strong>
        </div>
        
        {/* Botão de Call to Action */}
        <Button 
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] text-white font-bold text-lg py-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 uppercase tracking-wide"
        >
          Participar da Gincana!
        </Button>
      </div>
    </div>
  );
}
