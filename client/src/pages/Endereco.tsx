import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Endereco() {
  const [, setLocation] = useLocation();
  const [loadingCep, setLoadingCep] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Máscara simples para CEP
    if (name === "cep") {
      const numericValue = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      
      if (numericValue.length === 8) {
        fetchAddress(numericValue);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const fetchAddress = async (cep: string) => {
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular salvamento e ir para frete
    setLocation("/frete");
  };

  const isFormValid = Object.values(formData).every(val => val.length > 0);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <Header />
      
      <main className="container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-2xl">
        <div className="bg-white md:rounded-lg shadow-sm overflow-hidden">
          {/* Header da Página */}
          <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
            <Link href="/parabens">
              <ChevronLeft className="text-[#EE4D2D] cursor-pointer" />
            </Link>
            <h1 className="text-lg font-medium text-gray-800">Endereço de Entrega</h1>
          </div>

          {/* Barra de Progresso */}
          <div className="bg-[#FFF5F1] p-4 flex items-center justify-center gap-2 text-sm border-b border-[#EE4D2D]/10">
            <MapPin size={16} className="text-[#EE4D2D]" />
            <span className="text-[#EE4D2D]">Por favor, preencha o endereço para envio do seu prêmio.</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Contato</h2>
              
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  name="nome" 
                  placeholder="Ex: João Silva" 
                  value={formData.nome}
                  onChange={handleChange}
                  className="focus-visible:ring-[#EE4D2D]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone Celular</Label>
                <Input 
                  id="telefone" 
                  name="telefone" 
                  placeholder="(00) 00000-0000" 
                  value={formData.telefone}
                  onChange={handleChange}
                  className="focus-visible:ring-[#EE4D2D]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 pt-4 border-t">Endereço</h2>
              
              <div className="grid gap-2 relative">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input 
                    id="cep" 
                    name="cep" 
                    placeholder="00000000" 
                    value={formData.cep}
                    onChange={handleChange}
                    maxLength={8}
                    className="focus-visible:ring-[#EE4D2D] pr-10"
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#EE4D2D]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid gap-2">
                  <Label htmlFor="rua">Rua / Avenida</Label>
                  <Input 
                    id="rua" 
                    name="rua" 
                    placeholder="Nome da rua" 
                    value={formData.rua}
                    onChange={handleChange}
                    className="focus-visible:ring-[#EE4D2D] bg-gray-50"
                    readOnly={loadingCep}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input 
                    id="numero" 
                    name="numero" 
                    placeholder="123" 
                    value={formData.numero}
                    onChange={handleChange}
                    className="focus-visible:ring-[#EE4D2D]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input 
                  id="bairro" 
                  name="bairro" 
                  placeholder="Seu bairro" 
                  value={formData.bairro}
                  onChange={handleChange}
                  className="focus-visible:ring-[#EE4D2D] bg-gray-50"
                  readOnly={loadingCep}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input 
                    id="cidade" 
                    name="cidade" 
                    placeholder="Sua cidade" 
                    value={formData.cidade}
                    onChange={handleChange}
                    className="focus-visible:ring-[#EE4D2D] bg-gray-50"
                    readOnly={loadingCep}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input 
                    id="estado" 
                    name="estado" 
                    placeholder="UF" 
                    value={formData.estado}
                    onChange={handleChange}
                    className="focus-visible:ring-[#EE4D2D] bg-gray-50"
                    readOnly={loadingCep}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className={`w-full h-12 font-bold text-lg ${
                  isFormValid 
                    ? "bg-[#EE4D2D] hover:bg-[#d73211] text-white" 
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
                disabled={!isFormValid}
              >
                CONTINUAR PARA O FRETE
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
