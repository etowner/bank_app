import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/axiosConfig";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  // console.log("UserContextProvider user:", user);
  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getUser = async (userID) => {
    try {
      const response = await api.get(`/api/v1/user/${userID}`);
      setUser(response.data);
      console.log("Getting user:", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const login = async (userID, password) => {
    try {
      const response = await api.post(`/api/v1/user/login`, { userID, password });
      console.log(response.data); // response.data is a string 
      await getUser(userID); 
      setError(null); 
      navigate(`/home/${userID}`);
    } catch (err) {
      setError("Either the username or password was incorrect.");
      console.error("Login error:", err);
    }
  };

  const register = async (userID, password) => {
    try {
      const response = await api.post(`/api/v1/user/register`, { userID, password });
      console.log(response.data); // response.data is a string 
      await getUser(userID); 
      setError(null); 
      navigate(`/home/${userID}`);
    } catch (err) {
      setError(err.response.data);
      console.error("Registration error:", err);
    }
  };

  // May have use for this later
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, register, getUser, updateUser, error }}>
      {children}
    </UserContext.Provider>
  );
};
