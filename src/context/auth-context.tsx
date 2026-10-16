import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "@/config/firebase";
import {
  actualizarUsuario,
  guardarUsuario,
  obtenerUsuario,
} from "@/services/usuarios.service";
import { Usuario } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nombre: string,
    apellido: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: Partial<Omit<Usuario, "uid">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de autenticación y cargar perfil de Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await obtenerUsuario(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Si el documento en Firestore no existe todavía, crear uno base
            const fallbackProfile: Usuario = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              nombre: firebaseUser.displayName?.split(" ")[0] || "Usuario",
              apellido: firebaseUser.displayName?.split(" ")[1] || "",
              puesto: "Colaborador",
              createdAt: new Date().toISOString(),
            };
            await guardarUsuario(fallbackProfile);
            setUserProfile(fallbackProfile);
          }
        } catch (error) {
          console.error("Error al sincronizar perfil de usuario:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Cargar perfil tras login
      const profile = await obtenerUsuario(cred.user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const register = async (
    nombre: string,
    apellido: string,
    email: string,
    password: string,
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // Actualizar nombre visible en Firebase Auth
      await updateProfile(cred.user, {
        displayName: `${nombre.trim()} ${apellido.trim()}`,
      });

      // Crear documento del perfil en Firestore
      const nuevoPerfil: Usuario = {
        uid: cred.user.uid,
        email: email.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        puesto: "Auxiliar",
        createdAt: new Date().toISOString(),
      };

      await guardarUsuario(nuevoPerfil);
      setUserProfile(nuevoPerfil);
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error en logout:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await obtenerUsuario(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  const updateProfileData = async (data: Partial<Omit<Usuario, "uid">>) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    await actualizarUsuario(user.uid, data);
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}

