import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, registerUser, loginUser, logoutUser } from "../api/userApi";
import { UserContext } from "./UserContext";
import { getAxiosError } from "../api/axiosConfig";
import type { User } from "../lib/types";


export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await getUser();
      setUser(user);
      // console.log("Fetched user:", user);
    } catch (err) {
      setError(getAxiosError(err));
      console.error("Error getting user:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  const register = async (username: string, password: string) => {
    setError(null);
    try {
      await registerUser(username, password);
    } catch (err) {
      setError(getAxiosError(err));
      console.error("Registration error:", err);
      return; 
    }
    void navigate(`/home`);
  };

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      await loginUser(username, password );
    } catch (err) {
      setError(getAxiosError(err));
      console.error("Login error:", err);
      return; 
    }
    void navigate(`/home`);
  };

  const logout = async() => {
    void await logoutUser();
    setUser(null);
    void navigate('/');
  };

  const username = user?.username ?? null; // Extract username from user object for easier access
  
  return (
    <UserContext.Provider value={{ user, username, setUser, fetchUser,login, register, logout, error, setError }}>
      {children}
    </UserContext.Provider>
  );
};
