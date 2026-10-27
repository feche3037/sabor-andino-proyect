import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { suscribirProductores } from "@/services/productores.service";
import { suscribirProductos } from "@/services/productos.service";
import { Producto, Productor } from "@/types";

interface DataContextType {
  productos: Producto[];
  productores: Productor[];
  loadingProductos: boolean;
  loadingProductores: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Mantiene una única suscripción en tiempo real a productos y productores
 * mientras haya una sesión verificada, para que los datos ya estén cargados
 * cuando se abre cada pestaña.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const habilitado = !!user && user.emailVerified;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productores, setProductores] = useState<Productor[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingProductores, setLoadingProductores] = useState(true);

  useEffect(() => {
    if (!habilitado) return;

    const unsubProductos = suscribirProductos(
      (data) => {
        setProductos(data);
        setLoadingProductos(false);
      },
      () => setLoadingProductos(false),
    );

    const unsubProductores = suscribirProductores(
      (data) => {
        setProductores(data);
        setLoadingProductores(false);
      },
      () => setLoadingProductores(false),
    );

    return () => {
      unsubProductos();
      unsubProductores();
      // Al cerrar sesión no deben quedar datos del usuario anterior
      setProductos([]);
      setProductores([]);
      setLoadingProductos(true);
      setLoadingProductores(true);
    };
  }, [habilitado]);

  return (
    <DataContext.Provider
      value={{ productos, productores, loadingProductos, loadingProductores }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData debe ser utilizado dentro de un DataProvider");
  }
  return context;
}
