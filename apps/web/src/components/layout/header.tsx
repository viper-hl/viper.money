import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/app/swap", label: "Swap" },
  { href: "/app/vault", label: "Vault" },
  { href: "/app/profile", label: "Profile" },
  { href: "/developers", label: "Developers" },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* 로고 */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-viper-green flex items-center justify-center">
              <span className="text-viper-bg-primary font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl viper-text-gradient">Viper</span>
          </div>
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
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 우측 버튼들 */}
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="viper-outline" size="sm">
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
