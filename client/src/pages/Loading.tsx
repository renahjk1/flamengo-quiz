import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Loading() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Verificando respostas...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1; // Progresso suave
      });
    }, 50); // 5 segundos total (100 * 50ms)

    // Mensagens dinâmicas durante o loading
    setTimeout(() => setMessage("Analisando gabarito..."), 1500);
    setTimeout(() => setMessage("Confirmando estoque..."), 3000);
    setTimeout(() => setMessage("Gerando seu prêmio..."), 4500);

    // Redirecionamento final
    setTimeout(() => {
      setLocation("/home"); // Vai para a Home (vitrine)
    }, 5500);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
      {/* Logo Animada */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-[#EE4D2D]/20 rounded-full blur-xl animate-pulse"></div>
        <img 
          src="/images/logo-fla-shopee.png" 
          alt="Shopee X Flamengo" 
          className="h-20 object-contain relative z-10 animate-bounce-slow"
        />
      </div>

      {/* Spinner Customizado */}
      <div className="relative w-24 h-24 mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle 
            className="text-gray-200 stroke-current" 
            strokeWidth="8" 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent"
          ></circle>
          <circle 
            className="text-[#EE4D2D] progress-ring__circle stroke-current" 
            strokeWidth="8" 
            strokeLinecap="round" 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent" 
            strokeDasharray="251.2" 
            strokeDashoffset={251.2 - (251.2 * progress) / 100}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
            transform="rotate(-90 50 50)"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#EE4D2D]">
          {progress}%
        </div>
      </div>

      {/* Texto de Status */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center animate-pulse">
        {message}
      </h2>
      <p className="text-gray-500 text-center max-w-xs">
        Por favor, não feche esta página enquanto preparamos sua recompensa.
      </p>

      {/* Elementos Decorativos */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#EE4D2D] via-orange-400 to-[#EE4D2D] animate-shimmer"></div>
    </div>
  );
}
