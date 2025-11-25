import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing auth state
    const storedAuth = localStorage.getItem("finance_cockpit_auth");
    if (storedAuth) {
      try {
        const { email } = JSON.parse(storedAuth);
        setUserEmail(email);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem("finance_cockpit_auth");
      }
    }
  }, []);

  const login = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    localStorage.setItem(
      "finance_cockpit_auth",
      JSON.stringify({ email })
    );
  };

  const logout = () => {
    setUserEmail(null);
    setIsAuthenticated(false);
    localStorage.removeItem("finance_cockpit_auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
