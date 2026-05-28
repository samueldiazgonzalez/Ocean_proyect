export interface Tour {
  id?: string; // Es opcional porque Firebase se lo pone automáticamente
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  proveedorId: string; // Para saber qué proveedor creó este tour
  estado?: string;          // <--- Para quitar el error rojo de Angular
  
  categoria?: string;     // <--- Para el número de WhatsApp que agregamos hace un rato
  direccion?: string;            // <--- NUEVO
  opcionesAdicionales?: string;
}