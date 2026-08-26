import { createContext, use } from "react";
import type { User } from "../lib/types";

interface UserContextType {
  username: string | null;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = () => {
    const context = use(UserContext);
    if (!context) throw new Error('useUserContext must be used within UserContextProvider');
    return context;
};