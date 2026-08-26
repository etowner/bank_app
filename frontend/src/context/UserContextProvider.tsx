import { useState, useCallback } from "react";
import { getUser } from "../api/userApi";
import { UserContext } from "./UserContext";
import { getAxiosError } from "../api/axiosConfig";
import type { User } from "../lib/types";


export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUser();
      setUser(user);
      // console.log("Fetched user:", user);
    } catch (err) {
  
      console.error("Error getting user:", err, getAxiosError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const username = user?.username ?? null; // Extract username from user object for easier access
  
  return (
    <UserContext value={{ username, user, setUser, fetchUser }}>
      {children}
    </UserContext>
  );
};
