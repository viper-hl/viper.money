import { Suspense } from "react";
import { Header } from "./header/header";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

// App 레이아웃 컴포넌트
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-viper-bg-primary via-viper-bg-secondary to-viper-bg-primary">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 text-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-viper-green border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <Toaster />
    </div>
  );
}
