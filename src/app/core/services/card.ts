import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  // REGLA DE NEGOCIO: Algoritmo de Luhn
  validarLuhn(numero: string): boolean {
    const numStr = numero.replace(/\s/g, ''); // Quita espacios
    let sum = 0;
    let shouldDouble = false;
    for (let i = numStr.length - 1; i >= 0; i--) {
      let digit = parseInt(numStr.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
  }

  // REGLA DE NEGOCIO: Detección de Franquicia
  obtenerFranquicia(numero: string): 'visa' | 'mastercard' | 'desconocida' {
    const numStr = numero.replace(/\s/g, '');
    if (numStr.startsWith('4')) return 'visa';
    const bin = parseInt(numStr.substring(0, 2));
    if (bin >= 51 && bin <= 55) return 'mastercard';
    return 'desconocida';
  }
}