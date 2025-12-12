import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUTM } from "@/hooks/useUTM";
import { CheckCircle, Shield, User } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Cadastro() {
  useUTM();
  const [, setLocation] = useLocation();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<{ nome?: string; cpf?: string }>({});

  // Formatar CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const validateForm = () => {
    const newErrors: { nome?: string; cpf?: string } = {};
    
    if (!nome.trim() || nome.trim().length < 3) {
      newErrors.nome = "Digite seu nome completo";
    }
    
    const cpfNumbers = cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Número do ganhador fixo em 2956 (sobram exatas 44 camisetas)
    const winnerNumber = 2956;
    
    // Salvar dados no sessionStorage
    sessionStorage.setItem("userData", JSON.stringify({
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, ""),
      winnerNumber: winnerNumber,
    }));

    // Ir para o quiz
    setLocation("/quiz");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B0000] to-[#5C0000] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com logo */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="/images/logo-fla-shopee.png"
            alt="Flamengo x Shopee"
            className="h-16 object-contain"
          />
        </div>

        {/* Card de cadastro */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Título */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EE4D2D]/10 rounded-full mb-4">
              <User className="w-8 h-8 text-[#EE4D2D]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cadastre-se para Participar
            </h1>
            <p className="text-gray-600 text-sm">
              A promoção é válida apenas <span className="font-bold text-[#EE4D2D]">1 camiseta por CPF</span>
            </p>
          </div>

          {/* Aviso de segurança */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800 text-xs">
              Seus dados estão protegidos e serão usados apenas para validar sua participação única.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <Input
                type="text"
                placeholder="Digite seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                className={errors.cpf ? "border-red-500" : ""}
              />
              {errors.cpf && (
                <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C4161C] hover:bg-[#A01218] text-white font-bold py-6 text-lg rounded-xl shadow-lg"
            >
              VALIDAR E PARTICIPAR
            </Button>
          </form>

          {/* Benefícios */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Promoção oficial Flamengo x Shopee</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Limitado a 3.000 camisetas</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Apenas 1 por CPF</span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center text-white/60 text-xs mt-4">
          Ao continuar, você concorda com os termos da promoção.
        </p>
      </div>
    </div>
  );
}
