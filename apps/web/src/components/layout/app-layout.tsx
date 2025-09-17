import { Suspense } from "react";
import { Outlet } from "react-router";
import { LoadingPage } from "@/components/loading/spinner";
import { Header } from "./header/header";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingPage />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
