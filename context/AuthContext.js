import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken, setUnauthorizedHandler } from "../services/api";
import { loadJSON, removeKey, saveJSON, storageKeys } from "../utils/storage";

const AuthContext = createContext(null);

// Sessão do usuário: login/cadastro na API (JWT) e sessão salva no aparelho.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const startSession = useCallback(async ({ token, user: sessionUser }) => {
    setAuthToken(token);
    setUser(sessionUser);
    await saveJSON(storageKeys.session, { token, user: sessionUser });
    return sessionUser;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    removeKey(storageKeys.session);
  }, []);

  // Ao abrir o app: restaura a sessão salva e confirma o token com a API.
  // Sem internet, mantém os dados salvos; com token expirado (401), sai.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    let isActive = true;
    (async () => {
      const session = await loadJSON(storageKeys.session, null);
      if (session?.token && isActive) {
        setAuthToken(session.token);
        setUser(session.user);
        setIsRestoring(false);
        try {
          const freshUser = await api.me();
          if (isActive) {
            setUser(freshUser);
            saveJSON(storageKeys.session, { token: session.token, user: freshUser });
          }
        } catch {
          // 401 já chamou logout; outros erros (sem rede) mantêm a sessão salva.
        }
        return;
      }
      if (isActive) setIsRestoring(false);
    })();
    return () => {
      isActive = false;
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  // Retornam o usuário logado ou lançam ApiError com a mensagem da API.
  const login = useCallback(async (email, password) => startSession(await api.login(email, password)), [startSession]);
  const register = useCallback(async (data) => startSession(await api.register(data)), [startSession]);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", isRestoring, login, register, logout }),
    [user, isRestoring, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
