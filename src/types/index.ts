export type UserRole = 'Admin' | 'Operador';

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  mfaHabilitado: boolean;
  mfaSecret?: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface Subcategory {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  parentId: string | null; // Admite jerarquías flexibles de N niveles
  nivel: number;
}

export interface Article {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  subcategoriaId: string;
  precioCosto: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string; // Ej: Unidades, Kg, Litros, Cajas
  proveedor?: string;
  imagen?: string;
  fechaActualizacion: string;
}

export interface StockMovement {
  id: string;
  articuloId: string;
  sku: string;
  articuloNombre: string;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  usuarioId: string;
  usuarioNombre: string;
  fecha: string;
}

export interface SystemConfig {
  allowedEmails: string[];
  totalArticulos: number;
  alertasStockBajo: number;
  valorInventario: number;
}

export interface BarcodeScanResult {
  sku: string;
  success: boolean;
}
