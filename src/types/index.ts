export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  puesto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Producto {
  id: string; // UUID autogenerado
  nombre: string;
  color: string; // Hexadecimal ej: "#7A2214"
  createdAt?: string;
  updatedAt?: string;
}

export interface Productor {
  id: string; // UUID autogenerado
  nombre: string;
  localidad: string;
  producto: Producto; // Tipo Producto
  iniciales: string;
  createdAt?: string;
  updatedAt?: string;
}

