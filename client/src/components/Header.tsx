import { Search, ShoppingCart, Bell, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="bg-[#EE4D2D] text-white sticky top-0 z-50 shadow-md">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-1 flex justify-between text-xs font-light">
        <div className="flex gap-4">
          <span>Central do Vendedor</span>
          <span>Vender na Shopee</span>
          <span>Baixe o App</span>
          <span className="flex items-center gap-1">Siga-nos no <span className="font-bold">Instagram</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-90">
            <Bell size={14} />
            <span>Notificações</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-90">
            <HelpCircle size={14} />
            <span>Ajuda</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-90">
            <span>Português (BR)</span>
          </div>
          <span className="font-bold cursor-pointer hover:opacity-90">Cadastrar</span>
          <span className="font-bold cursor-pointer hover:opacity-90">Entre</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 flex items-center gap-8">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/images/logo-fla-shopee.png" alt="Shopee + Flamengo" className="h-12 object-contain bg-white rounded p-1" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-2xl">Shopee</span>
              <span className="text-xs tracking-widest">X FLAMENGO</span>
            </div>
          </div>
        </Link>

        <div className="flex-1 relative">
          <div className="bg-white rounded-sm p-1 flex items-center shadow-sm">
            <input 
              type="text" 
              placeholder="Buscar na Shopee" 
              className="flex-1 px-3 py-2 text-black outline-none text-sm"
            />
            <button className="bg-[#EE4D2D] p-2 rounded-sm hover:bg-[#d73211] transition-colors">
              <Search size={16} className="text-white" />
            </button>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-white/80">
            <span className="cursor-pointer hover:text-white">Camisa Flamengo</span>
            <span className="cursor-pointer hover:text-white">Manto Sagrado</span>
            <span className="cursor-pointer hover:text-white">Oferta Relâmpago</span>
            <span className="cursor-pointer hover:text-white">Libertadores</span>
          </div>
        </div>

        <div className="relative cursor-pointer hover:opacity-90">
          <ShoppingCart size={28} />
          <span className="absolute -top-2 -right-2 bg-white text-[#EE4D2D] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#EE4D2D]">
            1
          </span>
        </div>
      </div>
    </header>
  );
}
