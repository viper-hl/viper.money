import { Link, useLocation } from "react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/swap", label: "Swap" },
  { href: "/app/vault", label: "Vault" },
  { href: "/app/profile", label: "Profile" },
  { href: "/developers", label: "Developers" },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-viper-green to-green-400 rounded-full flex items-center justify-center">
            🐍
          </div>
          <span className="text-xl font-bold text-white">viper</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center space-x-6 ml-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-viper-green",
                location.pathname === item.href
                  ? "text-viper-green"
                  : "text-gray-300"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
}
