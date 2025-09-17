import { Suspense } from "react";
import { Header } from "./header/header";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

// App 레이아웃 컴포넌트
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 text-white">
            Loading...
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <Toaster />
    </div>
  );
}
