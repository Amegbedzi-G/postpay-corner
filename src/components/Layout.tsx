
import { TopNavbar } from "./TopNavbar";
import { BottomNavbar } from "./BottomNavbar";
import { useAuth } from "@/context/AuthContext";
import { Outlet } from "react-router-dom";

export function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <Outlet />
      </main>
      {isAuthenticated && <BottomNavbar />}
    </div>
  );
}
