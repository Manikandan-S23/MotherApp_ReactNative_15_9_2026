import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedUser = await AsyncStorage.getItem("currentUser");
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    })();
  }, []);

  const getUsers = async () => {
    const raw = await AsyncStorage.getItem("users");
    return raw ? JSON.parse(raw) : [];
  };

  const register = async (name, email, password) => {
    const users = await getUsers();
    const exists = users.find((u) => u.email === email);
    if (exists) {
      throw new Error(" This email is already registered.");
    }
    const newUser = { name, email, password };
    users.push(newUser);
    await AsyncStorage.setItem("users", JSON.stringify(users));
    return newUser;
  };

  const login = async (email, password) => {
    const users = await getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      throw new Error(" Invalid email or password");
    }
    setUser(found);
    await AsyncStorage.setItem("currentUser", JSON.stringify(found));
    return found;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
