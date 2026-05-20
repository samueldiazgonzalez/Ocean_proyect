export interface Tour {
  id?: string; // Es opcional porque Firebase se lo pone automáticamente
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  proveedorId: string; // Para saber qué proveedor creó este tour
}