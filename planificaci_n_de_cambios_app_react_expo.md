# Solicitud de Planificación para Cambios en App React Expo (Antigravity)

Hola Antigravity, necesito que generes una planificación y hoja de ruta detallada para implementar una serie de actualizaciones y mejoras en mi aplicación móvil desarrollada con **React Native (Expo)**, utilizando **Firebase (Firebase Firestore)** como base de datos y backend, y asegurando un comportamiento de UI óptimo y nativo tanto en **Android como en iOS**.

A continuación, detallo los requerimientos específicos agrupados por pantallas, la integración con Firestore, validaciones globales de formularios y la optimización de la interfaz multiplataforma.

---

## 1. Pantalla de Bienvenida (Welcome Screen)

* **Comportamiento:** Mostrar esta pantalla únicamente la primera vez que el usuario abre la aplicación (primer arranque, gestionado con `AsyncStorage` o estado de sesión persistente), antes de llegar a la pantalla de "Iniciar sesión".
* **Diseño/UI:** Debe ser idéntica a la pantalla Home actual, incluyendo los botones principales: **"Iniciar sesión"** y **"Registrarse"**.

---

## 2. Pantalla de Iniciar Sesión (Login Screen) & Firebase Auth / Firestore

* **Validación de Correo:** Validar mediante la lógica de autenticación de Firebase si el correo ingresado está registrado correctamente; en caso de no existir o haber error, mostrar un mensaje claro en pantalla.
* **Funcionalidad:** Agregar la opción **"¿Te olvidaste tu contraseña?"** utilizando el método nativo de Firebase `sendPasswordResetEmail`.
* **Seguridad/Flujo:** Implementar la verificación de correo electrónico (`sendEmailVerification` de Firebase Auth) antes de permitir el acceso completo a la app.

---

## 3. Pantalla de Registro (Register Screen)

* **Seguridad en Contraseña:** Validar estrictamente los caracteres de la contraseña antes de enviarla a Firebase Auth cumpliendo con:
  * Longitud mínima (8+ caracteres).
  * Al menos una letra mayúscula.
  * Al menos un número.
  * Al menos un carácter especial (`!@#$%^&*`).
* **Integración:** Creación del documento inicial del usuario en **Cloud Firestore** (`users` collection) al registrarse exitosamente.

---

## 4. Pantalla de Perfil (Profile Screen)

* **Ajustes de UI:** Quitar el campo de "puesto".
* **Funcionalidad y Firebase:** 
  * Agregar la opción de **carga y selección de imagen** (`expo-image-picker`).
  * Subir la imagen a **Firebase Storage** y actualizar la URL resultante en el documento del usuario en **Firestore**.

---

## 5. Pantalla de Productores (Producers Screen)

* **Nuevos Campos (Firestore):** Agregar en el documento del productor los campos: `direccion`, `redesSociales` (mapa/objeto o array) y `celular`.
* **Funcionalidad:** Carga de imagen del productor utilizando **Firebase Storage** y persistencia de la URL en **Firestore**.

---

## 6. Pantalla de Producto (Product Screen) & Relaciones en Firestore

* **Relaciones $N:M$ (Muchos a Muchos):** 
  * Modelar la estructura en Firestore donde un productor puede tener múltiples productos y un producto puede asociarse a múltiples productores (usando un array de referencias a IDs de productores o una colección intermedia/subcolección según la arquitectura recomendada).
  * Incluir la vista de listado de productos asociados.
* **Nuevas Variables en Firestore:**
  * `lote` (string/number)
  * `stock` (number)
  * `presentación` (string)
* **Funcionalidad:** Carga de imagen del producto conectada con **Firebase Storage**.

---

## 7. Validaciones Generales en Formularios

Aplicar validaciones robustas (mediante expresiones regulares y control de estado controlado) en todos los campos de los formularios:
* **Nombre:** Permitir exclusivamente el ingreso de letras y espacios (bloquear números y símbolos extraños).
* **Correo:** Validar el formato correcto de correo electrónico (`usuario@dominio.com`).
* **Números:** Validar que los campos numéricos (`stock`, `celular`, etc.) solo acepten caracteres válidos de números.

---

## 8. Optimización Multiplataforma (Android & iOS), Formularios, Selects y Navegación

Este apartado es crítico para garantizar una experiencia fluida y nativa en ambos sistemas operativos:

* **Barra de Navegación Global (Persistent Navigation):**
  * Asegurar que la barra de navegación (ya sea Tab Bar o Drawer) pertenezca al layout raíz de la app (`_layout.tsx` en Expo Router o NavigationContainer principal) para **evitar que se vuelva a renderizar o montar en cada cambio de pantalla**.
  * Prevenir saltos visuales o parpadeos (flickering) al navegar entre vistas.
* **Formularios y Teclado (`KeyboardAvoidingView`):**
  * Implementar contenedores adaptativos para que en iOS y Android el teclado virtual no tape los inputs.
  * Asegurar el comportamiento correcto del scroll (`ScrollView` / `KeyboardAvoidingView` con `behavior="padding"` o `"height"` según la plataforma).
* **Selects y Pickers Nativos:**
  * Utilizar componentes de selección optimizados para cada plataforma (por ejemplo, modales limpios o selectores nativos adaptados para iOS y Android) que eviten bugs de renderizado de listas desplegables nativas que suelen fallar entre sistemas operativos.

---

## Entregables esperados de Antigravity:

1. **Fases de Desarrollo y Arquitectura:** Orden lógico de implementación conectando componentes con Firebase Firestore y Storage.
2. **Estrategia de Navegación y UI:** Código base o directrices de cómo estructurar la navegación raíz para que la barra inferior/superior sea única y persistente.
3. **Manejo Multiplataforma:** Soluciones específicas para formularios, inputs y selects en Android vs. iOS.
4. Documentacion **.md** que me indique las modificaciones de los documentos de Firestore para las entidades modificadas o un script que haga las modificaciones para los documentos.  