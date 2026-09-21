import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const savedUser = await AsyncStorage.getItem("currentUser");
      if (savedUser) setUser(JSON.parse(savedUser) as User);
      setLoading(false);
    })();
  }, []);

  const getUsers = async (): Promise<User[]> => {
    const raw = await AsyncStorage.getItem("users");
    return raw ? (JSON.parse(raw) as User[]) : [];
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    const users = await getUsers();
    const exists = users.find((u) => u.email === email);
    if (exists) {
      throw new Error("This email is already registered.");
    }
    const newUser: User = {
      name,
      email,
      password,
      accountId: `ACC-${Date.now().toString().slice(-8)}`,
    };
    users.push(newUser);
    await AsyncStorage.setItem("users", JSON.stringify(users));
    return newUser;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const users = await getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      throw new Error("Invalid email or password");
    }
    setUser(found);
    await AsyncStorage.setItem("currentUser", JSON.stringify(found));
    return found;
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
