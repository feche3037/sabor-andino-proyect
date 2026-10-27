/**
 * Funciones y expresiones regulares de validación para formularios de Sabor Andino
 */

export const REGEX = {
  // Letras, vocales con tildes, diéresis, ñ y espacios
  NOMBRE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  // Formato estándar de email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  // Dígitos exclusivamente
  SOLO_NUMEROS: /^\d+$/,
  // Celular (dígitos, espacios, guiones y posible +)
  CELULAR: /^(?:\+54\s?(?:9\s?)?)?\d{3}-?\d{7}$/,
};

export const validarNombre = (nombre: string): string | null => {
  const limpio = nombre.trim();
  if (!limpio) return "Este campo es obligatorio.";
  if (limpio.length < 2) return "Debe tener al menos 2 caracteres.";
  if (!REGEX.NOMBRE.test(limpio)) {
    return "Solo se permiten letras y espacios (sin números ni símbolos).";
  }
  return null;
};

export const validarEmail = (email: string): string | null => {
  const limpio = email.trim();
  if (!limpio) return "El correo es obligatorio.";
  if (!REGEX.EMAIL.test(limpio)) {
    return "Ingresá un correo electrónico válido (ej: usuario@dominio.com).";
  }
  return null;
};

export const validarPassword = (password: string): string | null => {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Debe incluir al menos una letra mayúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "Debe incluir al menos un número.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Debe incluir al menos un carácter especial (!@#$%^&*...).";
  }
  return null;
};

export const validarNumero = (valor: string, campo = "Este campo"): string | null => {
  const limpio = valor.trim();
  if (!limpio) return `${campo} es obligatorio.`;
  if (!REGEX.SOLO_NUMEROS.test(limpio)) {
    return `${campo} debe contener únicamente números.`;
  }
  return null;
};

export const validarCelular = (celular: string, obligatorio = false): string | null => {
  const limpio = celular.trim();
  if (!limpio) {
    return obligatorio ? "El número de celular es obligatorio." : null;
  }
  if (!REGEX.CELULAR.test(limpio)) {
    return "Formato de celular inválido (ingresá sólo números, guiones o espacios).";
  }
  return null;
};

