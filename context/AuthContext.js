import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// Usuários mockados até existir um backend de verdade.
const mockUsers = [
  { id: "admin", firstName: "Admin", lastName: "", email: "admin@admin.com.br", password: "0000", role: "admin" },
  {
    id: "cliente-demo",
    firstName: "Cliente",
    lastName: "Demo",
    email: "cliente@stylewalk.com.br",
    password: "1234",
    role: "customer",
    address: { zipCode: "01001-000", address: "Praça da Sé", number: "100", complement: "", district: "Sé", city: "São Paulo", state: "SP" },
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(mockUsers);
  const [user, setUser] = useState(null);

  // Retorna o usuário logado ou null se as credenciais forem inválidas.
  const login = useCallback((email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find((candidate) => candidate.email === normalizedEmail && candidate.password === password);
    setUser(foundUser || null);
    return foundUser || null;
  }, [users]);

  // Retorna o novo usuário ou null se o e-mail já estiver cadastrado.
  const register = useCallback((data) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (users.some((candidate) => candidate.email === normalizedEmail)) {
      return null;
    }
    const newUser = { ...data, email: normalizedEmail, id: `user-${Date.now()}`, role: "customer" };
    setUsers((currentUsers) => [...currentUsers, newUser]);
    setUser(newUser);
    return newUser;
  }, [users]);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, isAdmin: user?.role === "admin", login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
