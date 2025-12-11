import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

const quizData = [
  {
    id: 1,
    question: "Em que ano foi fundado o Clube de Regatas do Flamengo?",
    image: "/images/fundacao.webp",
    options: ["1895", "1900", "1881"],
    correct: 0
  },
  {
    id: 2,
    question: "Qual é o estádio onde o Flamengo manda seus jogos principais?",
    image: "/images/estadio1.jpg",
    options: ["Estádio da Gávea", "Maracanã", "São Januário"],
    correct: 1
  },
  {
    id: 3,
    question: "Quem é considerado o maior ídolo da história do Flamengo?",
    image: "/images/jogadores1.jpg",
    options: ["Romário", "Zico", "Adriano"],
    correct: 1
  },
  {
    id: 4,
    question: "Quantas vezes o Flamengo foi campeão da Libertadores?",
    image: "/images/jogadores2.jpg",
    options: ["2 vezes", "4 vezes", "5 vezes"],
    correct: 1
  },
  {
    id: 5,
    question: "Qual é o apelido mais famoso do Flamengo?",
    image: "/images/flamengo-logo.webp",
    options: ["Mengão", "Rubro-Negro", "Urubu"],
    correct: 0
  }
];

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const question = quizData[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const correct = index === question.correct;
    setIsCorrect(correct);

    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setLocation("/loading");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dc2626] to-black flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* Logo */}
        <img 
          src="/images/logo-fla-shopee.png" 
          alt="Shopee X Flamengo" 
          className="h-12 mx-auto mb-6 object-contain"
        />

        {/* Número da Pergunta */}
        <div className="text-[#dc2626] font-bold text-xl mb-4">
          Pergunta #{question.id}
        </div>

        {/* Texto da Pergunta */}
        <h2 className="text-gray-700 text-lg font-medium mb-6 min-h-[3.5rem]">
          {question.question}
        </h2>

        {/* Imagem da Pergunta */}
        <div className="w-full h-48 bg-gray-100 rounded-xl mb-6 overflow-hidden shadow-inner flex items-center justify-center">
           <img 
             src={question.image} 
             alt={`Imagem da pergunta ${question.id}`}
             className="w-full h-full object-cover"
           />
        </div>

        {/* Opções */}
        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`
                w-full p-4 rounded-xl font-medium text-lg transition-all duration-300 transform
                ${selectedAnswer === null 
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:-translate-y-1" 
                  : ""}
                ${selectedAnswer === index && isCorrect 
                  ? "bg-green-500 text-white shadow-lg scale-105" 
                  : ""}
                ${selectedAnswer === index && !isCorrect 
                  ? "bg-red-500 text-white shadow-lg scale-105" 
                  : ""}
                ${selectedAnswer !== null && selectedAnswer !== index
                  ? "bg-gray-100 text-gray-400 opacity-50"
                  : ""}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Mensagem de Erro/Sucesso */}
        {selectedAnswer !== null && (
          <div className={`p-3 rounded-lg font-bold animate-in fade-in zoom-in duration-300 ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isCorrect ? "Resposta Correta! 🎉" : "Resposta Incorreta! ❌"}
          </div>
        )}

        {/* Barra de Progresso */}
        <div className="mt-6">
          <div className="text-gray-500 text-sm mb-2">
            {currentQuestion + 1} de {quizData.length}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#dc2626] transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
