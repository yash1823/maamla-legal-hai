import { Link, useNavigate } from "react-router-dom";
import { User, Heart, LogOut, LogIn, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" asChild className="px-2 sm:px-3">
          <Link to="/login">
            <LogIn className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-0 sm:ml-2">Sign In</span>
          </Link>
        </Button>
        <Button size="sm" asChild className="px-2 sm:px-3">
          <Link to="/signup">
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-0 sm:ml-2">Sign Up</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
        >
          <User className="h-4 w-4" />
          <span className="hidden md:inline text-sm truncate max-w-24">
            {user?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium truncate">
          {user?.name}
        </div>
        <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
          {user?.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/bookmarks" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            My Bookmarks
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
