import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

// Lista de nomes e sobrenomes brasileiros comuns
const nomes = [
  "Maria", "Ana", "Juliana", "Fernanda", "Camila", "Larissa", "Beatriz", "Amanda",
  "João", "Pedro", "Lucas", "Gabriel", "Rafael", "Bruno", "Felipe", "Matheus",
  "Carlos", "Paulo", "Marcos", "Roberto", "André", "Ricardo", "Eduardo", "Thiago",
  "Patricia", "Adriana", "Renata", "Vanessa", "Cristiane", "Luciana", "Mariana", "Daniela"
];

const sobrenomes = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira",
  "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes",
  "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade",
  "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas", "Cardoso", "Ramos"
];

const estados = [
  "SP", "RJ", "MG", "BA", "RS", "PR", "SC", "PE", "CE", "GO",
  "PA", "MA", "PB", "RN", "PI", "AL", "SE", "ES", "MT", "MS",
  "DF", "AM", "RO", "AC", "AP", "RR", "TO"
];

interface SocialProofPopupProps {
  // Intervalo mínimo entre pop-ups em ms (padrão: 8 segundos)
  minInterval?: number;
  // Intervalo máximo entre pop-ups em ms (padrão: 15 segundos)
  maxInterval?: number;
}

export function SocialProofPopup({ minInterval = 8000, maxInterval = 15000 }: SocialProofPopupProps) {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({
    numero: 2943,
    nome: "Maria",
    sobrenome: "Ferreira",
    estado: "SC"
  });

  const generateNotification = () => {
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const numero = Math.floor(Math.random() * 50) + 2900; // Entre 2900 e 2950

    return { numero, nome, sobrenome, estado };
  };

  useEffect(() => {
    // Mostrar primeiro pop-up após 5 segundos
    const initialTimeout = setTimeout(() => {
      setNotification(generateNotification());
      setVisible(true);
    }, 5000);

    return () => clearTimeout(initialTimeout);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Esconder após 4 segundos
    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, 4000);

    // Mostrar próximo após intervalo aleatório
    const nextInterval = Math.random() * (maxInterval - minInterval) + minInterval;
    const showTimeout = setTimeout(() => {
      setNotification(generateNotification());
      setVisible(true);
    }, nextInterval + 4000); // Adiciona 4s do tempo que fica visível

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
    };
  }, [visible, minInterval, maxInterval]);

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all duration-500 transform ${
        visible 
          ? "translate-x-0 opacity-100" 
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-[320px] flex items-start gap-3">
        <div className="bg-green-100 p-2 rounded-full shrink-0">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-tight">
            Ganhador <span className="font-bold text-[#EE4D2D]">#{notification.numero} {notification.nome} {notification.sobrenome}</span> de <span className="font-bold">{notification.estado}</span> acabou de resgatar seu prêmio.
          </p>
          <p className="text-xs text-gray-500 mt-1">Agora mesmo</p>
        </div>
      </div>
    </div>
  );
}
