import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { LoginFormData, SignupFormData, User } from "../types/models";

import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
  signup as signupUser,
} from "../services/authService";

import { deleteMyAccount as deleteAccount } from "../services/userService";

interface AuthContextValue {
  user: User | null;
  isAuthLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Checks if the user already has an active session when loading the app
  
  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    void restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthLoading,

      login: async (data) => {
        const authenticatedUser = await loginUser(data);
        setUser(authenticatedUser);
      },

      signup: async (data) => {
        await signupUser(data);
      },

      refreshUser: async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      },

      logout: async () => {
        try {
          await logoutUser();
        } finally {
          setUser(null);
        }
      },

      deleteAccount: async (password) => {
        await deleteAccount(password);
        setUser(null);
      },

      hasPermission: (permission) =>
        user?.role.permissions.some(
          (currentPermission) => currentPermission.name === permission,
        ) ?? false,
    }),
    [user, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
