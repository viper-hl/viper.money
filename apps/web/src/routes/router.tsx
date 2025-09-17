import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import Landing from "@/pages/home";
import NotFound from "@/pages/notFound";

const Swap = lazy(() => import("@/pages/app/swap"));
const Vault = lazy(() => import("@/pages/app/vault"));
const Profile = lazy(() => import("@/pages/app/profile"));
const Developers = lazy(() => import("@/pages/developers"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "developers",
    Component: Developers,
  },
  {
    path: "app",
    element: <AppLayout />,
    children: [
      {
        path: "swap",
        Component: Swap,
      },
      {
        path: "vault",
        Component: Vault,
      },
      {
        path: "profile",
        Component: Profile,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
