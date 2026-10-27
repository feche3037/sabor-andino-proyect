# Guía de Configuración de Firebase para Sabor Andino

Esta guía detalla los pasos necesarios para crear y configurar desde cero el proyecto en Firebase, dar de alta la base de datos Cloud Firestore, habilitar la autenticación de usuarios y conectar las credenciales con la aplicación Expo.

---

## 1. Crear un Nuevo Proyecto en Firebase

1. Ingresá a la [Consola de Firebase](https://console.firebase.google.com/) con tu cuenta de Google.
2. Hacé clic en **"Agregar proyecto"** (o *"Crear un proyecto"*).
3. Ingresá el nombre del proyecto, por ejemplo: `sabor-andino-proyect`.
4. (Opcional) Podés deshabilitar Google Analytics para simplificar la configuración inicial, o dejarlo habilitado si querés analíticas.
5. Hacé clic en **"Crear proyecto"** y esperá a que finalice la creación.

---

## 2. Registrar la Aplicación Web y Obtener Credenciales

Para aplicaciones Expo/React Native gestionadas, la forma recomendada y universal es registrar una aplicación de tipo Web en la consola:

1. En la página principal del proyecto en Firebase Console, hacé clic en el ícono de **Web** (`</>`).
2. Ingresá un apodo para la aplicación, por ejemplo: `Sabor Andino Mobile`.
3. No es necesario tildar *Firebase Hosting* en este paso. Hacé clic en **"Registrar app"**.
4. Firebase te mostrará un bloque de configuración `firebaseConfig` con valores como:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "sabor-andino-proyect.firebaseapp.com",
     projectId: "sabor-andino-proyect",
     storageBucket: "sabor-andino-proyect.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789...:web:..."
   };
   ```
5. Copiá estos valores.

---

## 3. Configurar las Variables de Entorno en el Proyecto

En la raíz del proyecto `sabor-andino-proyect`, creá un archivo `.env` (si aún no existe) con las siguientes variables (usando tus valores de Firebase):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sabor-andino-proyect.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sabor-andino-proyect
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sabor-andino-proyect.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> **Nota de Expo**: Las variables que comienzan con `EXPO_PUBLIC_` son inyectadas automáticamente por Expo en tiempo de ejecución sin necesidad de plugins adicionales.

---

## 4. Habilitar Firebase Authentication

1. En el menú lateral izquierdo de la consola, ve a **Compilación** > **Authentication**.
2. Hacé clic en **"Comenzar"**.
3. En la pestaña **Sign-in method** (Métodos de acceso), seleccioná **Correo electrónico/Contraseña**.
4. Activá el interruptor principal **"Habilitar"**.
5. Dejá deshabilitada la opción de *Vínculo del correo electrónico (acceso sin contraseña)*.
6. Hacé clic en **"Guardar"**.

---

## 5. Habilitar Cloud Firestore

1. En el menú lateral izquierdo, ve a **Compilación** > **Firestore Database**.
2. Hacé clic en **"Crear base de datos"**.
3. **Ubicación de la base de datos**: Seleccioná una región cercana, por ejemplo `southamerica-east1` (São Paulo) o `us-central1`.
4. **Reglas de seguridad iniciales**:
   - Podés comenzar en **Modo de prueba** (permite lectura/escritura durante 30 días mientras desarrollás).
5. Hacé clic en **"Habilitar"**.

---

## 6. Estructura de Entidades y Colecciones en Firestore

La aplicación utiliza tres colecciones principales en Firestore:

### Colección: `usuarios`
El ID del documento corresponde al `uid` asignado por Firebase Auth (`usuarios/{uid}`).
* `uid`: string (ID de autenticación)
* `nombre`: string (Ej: "Luciana")
* `apellido`: string (Ej: "Ríos")
* `email`: string (Ej: "luciana.rios@ejemplo.com")
* `telefono`: string opcional (Ej: "387 455-0192")
* `puesto`: string opcional (Ej: "Auxiliar administrativa")
* `createdAt`: string ISO 8601
* `updatedAt`: string ISO 8601

### Colección: `productos`
El ID del documento es un UUID generado automáticamente (`productos/{id}`).
* `id`: string (UUID autogenerado)
* `nombre`: string (Ej: "Pimentón dulce", "Ají molido", "Comino")
* `color`: string hexadecimal (Ej: `"#8B2613"`, `"#E8A338"`, `"#2E6930"`)
* `createdAt`: string ISO 8601
* `updatedAt`: string ISO 8601

### Colección: `productores`
El ID del documento es un UUID generado automáticamente (`productores/{id}`).
* `id`: string (UUID autogenerado)
* `nombre`: string (Ej: "Marta Guanuco")
* `localidad`: string (Ej: "Cachi", "Payogasta", "San Carlos")
* `iniciales`: string (Ej: "MG")
* `producto`: mapa/objeto `Producto`:
  * `id`: string
  * `nombre`: string
  * `color`: string
* `createdAt`: string ISO 8601
* `updatedAt`: string ISO 8601

---

## 7. Reglas de Seguridad Recomendadas (`firestore.rules`)

En Firebase Console > **Firestore Database** > pestaña **Reglas**, pegá las siguientes reglas para proteger los datos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función auxiliar: verifica si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Colección de Usuarios: cada usuario autenticado puede leer y modificar su propio documento
    match /usuarios/{uid} {
      allow read, write: if isAuthenticated() && request.auth.uid == uid;
    }

    // Colección de Productos: cualquier usuario autenticado puede consultar y gestionar productos
    match /productos/{id} {
      allow read, write: if isAuthenticated();
    }

    // Colección de Productores: cualquier usuario autenticado puede consultar y gestionar productores
    match /productores/{id} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

Hacé clic en **"Publicar"** para aplicar los cambios.

---

## 8. Carga de Datos de Ejemplo (Importar JSON)

Se ha generado el archivo [`firebase-import.json`](./firebase-import.json) en la raíz del proyecto con la estructura completa de `usuarios`, `productos` y `productores`.

### Opción A: Importar en Realtime Database (desde la consola web)
1. En Firebase Console, ve a **Realtime Database** (la vista de tu captura de pantalla).
2. Haz clic en el menú de los tres puntos verticales (`⋮`) en la esquina superior derecha del visor de datos.
3. Selecciona **"Importar JSON"**.
4. Haz clic en **"Examinar"** y selecciona el archivo `firebase-import.json` ubicado en la raíz del proyecto.
5. Haz clic en **"Importar"**.

### Opción B: Cargar en Cloud Firestore (Recomendado para la App)
La aplicación utiliza Cloud Firestore. Para poblar Firestore directamente con los mismos datos del JSON, simplemente ejecuta en tu terminal:

```bash
npm run seed
```
Este comando conectará con tu proyecto configurado en el archivo `.env` y subirá automáticamente todos los productos, productores y usuarios a Cloud Firestore.

---

## 9. Ejecutar el Proyecto Localmente

```bash
# Iniciar el servidor de desarrollo de Expo
npx expo start

# Para abrir en la versión web
npx expo start --web

# Para correr en emulador Android / iOS (o Expo Go)
npx expo start --android
npx expo start --ios
```

