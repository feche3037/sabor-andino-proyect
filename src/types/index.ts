export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fotoUrl?: string | null;
  puesto?: string; // Opcional por compatibilidad con registros antiguos
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RedesSociales {
  instagram?: string;
  facebook?: string;
  web?: string;
}

export interface Producto {
  id: string; // UUID autogenerado
  nombre: string;
  color: string; // Hexadecimal ej: "#7A2214"
  lote?: string;
  stock?: number;
  presentacion?: string;
  fotoUrl?: string | null;
  productoresIds?: string[]; // IDs de productores asociados (N:M)
  createdAt?: string;
  updatedAt?: string;
}

export interface Productor {
  id: string; // UUID autogenerado
  nombre: string;
  localidad: string;
  iniciales: string;
  direccion?: string;
  celular?: string;
  redesSociales?: RedesSociales;
  fotoUrl?: string | null;
  productosIds: string[]; // IDs de productos asociados (N:M)
  producto?: Producto; // Soporte legacy para registros no migrados
  createdAt?: string;
  updatedAt?: string;
}
