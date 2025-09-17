import { Link } from "react-router";
import { HeaderConnectButton } from "./header-connect-button";

export function Header() {
  return (
    <header className="border-b border-border backdrop-blur-sm bg-viper-bg-secondary/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-viper-green to-viper-green-light rounded-full flex items-center justify-center animate-viper-pulse snake-wiggle">
            🐍
          </div>
          <span className="text-xl font-bold text-foreground">viper</span>
        </Link>
        <HeaderConnectButton />
      </div>
    </header>
  );
}
