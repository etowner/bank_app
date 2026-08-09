import { createContext, use } from "react";
import type { User } from "../lib/types";

interface UserContextType {
  username: string | null;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = () => {
    const context = use(UserContext);
    if (!context) throw new Error('useUserContext must be used within UserContextProvider');
    return context;
};