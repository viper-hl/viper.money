import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { AppLayout } from "@/components/layout/app-layout";

// 페이지 컴포넌트들 (Lazy Loading)
import LandingPage from "@/pages/landing";
import NotFoundPage from "@/pages/notFound";
const SwapPage = lazy(() => import("@/pages/app/swap"));
const VaultPage = lazy(() => import("@/pages/app/vault"));
const ProfilePage = lazy(() => import("@/pages/app/profile"));
const DevelopersPage = lazy(() => import("@/pages/developers"));

// 라우터 설정
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "developers",
        element: <DevelopersPage />,
      },
      {
        path: "app",
        children: [
          {
            path: "swap",
            element: <SwapPage />,
          },
          {
            path: "vault",
            element: <VaultPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
