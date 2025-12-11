import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Start() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    setLocation("/quiz");
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
        <h1 className="text-2xl font-bold text-[#dc2626] mb-6 drop-shadow-sm">
          🏆 Desafio do Flamengo! 🏆
        </h1>
        
        {/* Imagem da Camisa */}
        <div className="my-8 relative group">
          <div className="absolute inset-0 bg-[#dc2626]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <img 
            src="/images/camisa1.webp" 
            alt="Flamengo Campeão" 
            className="w-64 mx-auto relative z-10 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-xl"
          />
        </div>
        
        {/* Descrição */}
        <div className="text-gray-700 text-base leading-relaxed mb-8 text-justify">
          O <span className="font-bold text-[#dc2626]">Flamengo</span> está fazendo uma super gincana com um jogo de perguntas e respostas sobre a história do clube e os torcedores que acertarem pelo menos <span className="font-bold text-[#dc2626]">3 perguntas</span> vão ganhar como prêmio um <span className="font-bold text-[#dc2626]">manto sagrado oficial</span> de graça.
        </div>
        
        {/* Destaque do Prêmio */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg mb-8 border-l-4 border-[#dc2626] shadow-sm">
          <strong className="text-gray-800 flex items-center justify-center gap-2">
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
