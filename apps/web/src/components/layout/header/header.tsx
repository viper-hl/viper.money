import { Link } from "react-router";
import { HeaderConnectButton } from "./header-connect-button";

export function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#4EF08A] to-green-400 rounded-full flex items-center justify-center">
            🐍
          </div>
          <span className="text-xl font-bold text-white">viper</span>
        </Link>
        <HeaderConnectButton />
      </div>
    </header>
  );
}
