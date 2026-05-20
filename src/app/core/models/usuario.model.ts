export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  rol: 'viajero' | 'proveedor';
  telefono?: string;       // Nuevo: Opcional
  nombreAgencia?: string;  // Nuevo: Solo para proveedores
  fechaRegistro?: Date;    // Nuevo: Para saber cuándo se unió
}