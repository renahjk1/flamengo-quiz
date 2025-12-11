import { Search, ShoppingCart, Bell, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="bg-[#EE4D2D] text-white sticky top-0 z-50 shadow-md">
      {/* Main Header Mobile Simplificado */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/images/logo-fla-shopee.png" alt="Shopee + Flamengo" className="h-10 object-contain bg-white rounded p-1" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl">Shopee</span>
              <span className="text-[10px] tracking-widest">X FLAMENGO</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer hover:opacity-90">
            <Bell size={24} />
          </div>
          <div className="relative cursor-pointer hover:opacity-90">
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-white text-[#EE4D2D] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#EE4D2D]">
              1
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
