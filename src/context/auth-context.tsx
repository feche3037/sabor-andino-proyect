import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
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
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
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
            setUserProfile({
              ...profile,
              emailVerified: firebaseUser.emailVerified,
            });
          } else {
            // Si el documento en Firestore no existe todavía, crear uno base
            const fallbackProfile: Usuario = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              nombre: firebaseUser.displayName?.split(" ")[0] || "Usuario",
              apellido: firebaseUser.displayName?.split(" ")[1] || "",
              fotoUrl: firebaseUser.photoURL || null,
              emailVerified: firebaseUser.emailVerified,
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
      setUser(cred.user);
      const profile = await obtenerUsuario(cred.user.uid);
      if (profile) {
        setUserProfile({
          ...profile,
          emailVerified: cred.user.emailVerified,
        });
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

      // Enviar correo de verificación inicial
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.warn("No se pudo enviar el correo de verificación automático:", err);
      }

      // Crear documento del perfil en Firestore
      const nuevoPerfil: Usuario = {
        uid: cred.user.uid,
        email: email.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fotoUrl: null,
        emailVerified: cred.user.emailVerified,
        createdAt: new Date().toISOString(),
      };

      await guardarUsuario(nuevoPerfil);
      setUser(cred.user);
      setUserProfile(nuevoPerfil);
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("No hay usuario autenticado.");
    await sendEmailVerification(auth.currentUser);
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      const updatedUser = { ...auth.currentUser } as User;
      setUser(updatedUser);
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          emailVerified: auth.currentUser.emailVerified,
        });
      }
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
        setUserProfile({
          ...profile,
          emailVerified: user.emailVerified,
        });
      }
    }
  };

  const updateProfileData = async (data: Partial<Omit<Usuario, "uid">>) => {
    if (!user) throw new Error("No hay usuario autenticado.");

    // Sincronizar photoURL o displayName en Firebase Auth si viene en la carga
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (data.nombre || data.apellido) {
      const nom = data.nombre ?? userProfile?.nombre ?? "";
      const ape = data.apellido ?? userProfile?.apellido ?? "";
      authUpdates.displayName = `${nom} ${ape}`.trim();
    }
    if (data.fotoUrl !== undefined) {
      authUpdates.photoURL = data.fotoUrl || "";
    }
    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(user, authUpdates);
    }

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
        resetPassword,
        sendVerificationEmail,
        reloadUser,
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
