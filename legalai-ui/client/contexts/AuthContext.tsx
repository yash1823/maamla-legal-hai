import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loginUser, signupUser, getCurrentUser } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await getCurrentUser(token);
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    localStorage.setItem("auth_token", data.token);

    // Fetch user data after login
    const userData = await getCurrentUser(data.token);
    setUser(userData);

    // Show success toast
    toast({
      title: "Successfully logged in!",
      description: `Welcome back, ${userData.name}!`,
      duration: 3000,
    });
  };

  const signup = async (email: string, password: string, name: string) => {
    const data = await signupUser(email, password, name);
    localStorage.setItem("auth_token", data.token);

    // Fetch user data after signup
    const userData = await getCurrentUser(data.token);
    setUser(userData);

    // Show success toast
    toast({
      title: "Account created successfully!",
      description: `Welcome to the platform, ${userData.name}!`,
      duration: 3000,
    });
  };

  const logout = () => {
    const userName = user?.name || "";
    localStorage.removeItem("auth_token");
    setUser(null);

    // Show success toast
    toast({
      title: "You have been logged out",
      description: userName ? `Goodbye, ${userName}!` : "See you next time!",
      duration: 3000,
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
