
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Home, PlusSquare, MessageSquare, User, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNavbar() {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItemClass = "flex flex-col items-center justify-center text-xs space-y-1";
  const activeClass = "text-primary";
  const inactiveClass = "text-muted-foreground";

  // Determine which navigation to show based on user role
  if (!user) return null;

  const isAdmin = user.isAdmin;

  return (
    <nav className="bottom-navigation">
      {/* Home - for both admin and creators */}
      <Link
        to="/"
        className={cn(navItemClass, isActive("/") ? activeClass : inactiveClass)}
      >
        <Home size={20} />
        <span>Home</span>
      </Link>

      {/* Add Post - admin only */}
      {isAdmin && (
        <Link
          to="/add-post"
          className={cn(
            navItemClass,
            isActive("/add-post") ? activeClass : inactiveClass
          )}
        >
          <PlusSquare size={20} />
          <span>Add Post</span>
        </Link>
      )}

      {/* Messages - for both admin and creators */}
      <Link
        to="/messages"
        className={cn(
          navItemClass,
          isActive("/messages") ? activeClass : inactiveClass
        )}
      >
        <MessageSquare size={20} />
        <span>Messages</span>
      </Link>

      {/* Profile - for both admin and creators */}
      <Link
        to="/profile"
        className={cn(
          navItemClass,
          isActive("/profile") ? activeClass : inactiveClass
        )}
      >
        <User size={20} />
        <span>Profile</span>
      </Link>

      {/* Settings - creator only */}
      {!isAdmin && (
        <Link
          to="/settings"
          className={cn(
            navItemClass,
            isActive("/settings") ? activeClass : inactiveClass
          )}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      )}
    </nav>
  );
}
