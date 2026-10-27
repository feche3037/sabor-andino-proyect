# Especificación de Cambios en Esquema de Cloud Firestore

Este documento detalla las modificaciones estructurales en las colecciones de Firestore para **Sabor Andino**, especificando el esquema anterior, el nuevo esquema extendido y las consideraciones de compatibilidad retroactiva.

---

## 1. Colección `usuarios`

### Esquema Anterior (Legacy)
```json
{
  "uid": "seed-ce0336f2",
  "nombre": "Luciana",
  "apellido": "Ríos",
  "email": "luciana.rios@ejemplo.com",
  "telefono": "387 455-0192",
  "puesto": "Auxiliar administrativa",
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:00:00.000Z"
}
```

### Nuevo Esquema
* **Eliminado:** Campo `puesto` (se descarta de la interfaz y modelo).
* **Agregado:** `fotoUrl` (string opcional, URL de Firebase Storage).
* **Agregado:** `emailVerified` (boolean, sincronizado con Firebase Auth).

```json
{
  "uid": "seed-ce0336f2",
  "nombre": "Luciana",
  "apellido": "Ríos",
  "email": "luciana.rios@ejemplo.com",
  "telefono": "387 455-0192",
  "fotoUrl": "https://firebasestorage.googleapis.com/v0/b/sabor-andino-proyect.appspot.com/o/usuarios%2Fseed-ce0336f2%2Favatar.jpg?alt=media",
  "emailVerified": true,
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-23T22:30:00.000Z"
}
```

---

## 2. Colección `productores`

### Esquema Anterior (Legacy)
En el modelo anterior, cada productor tenía embebido un único producto como objeto (`1:1`).

```json
{
  "id": "f40a1e93-e8d9-4071-a40c-bf81ba873b08",
  "nombre": "Marta Guanuco",
  "localidad": "Cachi",
  "iniciales": "MG",
  "producto": {
    "id": "c79e22cf-63cb-43fd-8f92-a9aa3744c0ff",
    "nombre": "Pimentón dulce",
    "color": "#8B2613"
  },
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:00:00.000Z"
}
```

### Nuevo Esquema (Relación $N:M$)
* **Eliminado / Reemplazado:** `producto` (objeto único) pasa a ser un arreglo de identificadores `productosIds: string[]`. Para compatibilidad de lectura inmediata se puede preservar `productos: Array<{ id, nombre, color }>` o consultar por IDs.
* **Agregados:**
  * `direccion`: string (ej. "Ruta 40 km 4480, Cachi").
  * `celular`: string (ej. "+54 9 387 512-3456").
  * `redesSociales`: objeto de enlaces (`{ instagram?: string, facebook?: string, web?: string }`).
  * `fotoUrl`: string opcional (URL de Firebase Storage).

```json
{
  "id": "f40a1e93-e8d9-4071-a40c-bf81ba873b08",
  "nombre": "Marta Guanuco",
  "localidad": "Cachi",
  "iniciales": "MG",
  "direccion": "Finca El Pucará, Cachi Adentro",
  "celular": "387-5123456",
  "redesSociales": {
    "instagram": "@martaguanuco_especias",
    "facebook": "Marta Guanuco Valles"
  },
  "fotoUrl": "https://firebasestorage.googleapis.com/v0/b/sabor-andino-proyect.appspot.com/o/productores%2Ff40a1e93.jpg?alt=media",
  "productosIds": [
    "c79e22cf-63cb-43fd-8f92-a9aa3744c0ff",
    "b3e3426b-096e-44d0-9660-5807bdc90e19"
  ],
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-23T22:30:00.000Z"
}
```

---

## 3. Colección `productos`

### Esquema Anterior (Legacy)
```json
{
  "id": "c79e22cf-63cb-43fd-8f92-a9aa3744c0ff",
  "nombre": "Pimentón dulce",
  "color": "#8B2613",
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:00:00.000Z"
}
```

### Nuevo Esquema (Relación $N:M$ y Gestión de Inventario)
* **Agregados:**
  * `lote`: string (ej. "L-2026-CAL-04").
  * `stock`: number (ej. 150 - en kg o unidades).
  * `presentacion`: string (ej. "Bolsa al vacío 500g", "Frasco 100g", "Granel").
  * `fotoUrl`: string opcional (URL en Firebase Storage).
  * `productoresIds`: string[] (Arreglo con los IDs de productores que cultivan o entregan este producto).

```json
{
  "id": "c79e22cf-63cb-43fd-8f92-a9aa3744c0ff",
  "nombre": "Pimentón dulce",
  "color": "#8B2613",
  "lote": "L-2026-CAL-01",
  "stock": 250,
  "presentacion": "Molido fino al vacío 250g",
  "fotoUrl": "https://firebasestorage.googleapis.com/v0/b/sabor-andino-proyect.appspot.com/o/productos%2Fc79e22cf.jpg?alt=media",
  "productoresIds": [
    "f40a1e93-e8d9-4071-a40c-bf81ba873b08"
  ],
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-23T22:30:00.000Z"
}
```

---

## 4. Justificación de Arquitectura de Datos $N:M$ en Firestore

Se eligió el enfoque **Array of IDs bidireccional (`productosIds` en Productor y `productoresIds` en Producto)**:

1. **Límite de tamaño:** La cantidad de productores por producto o productos por productor en este dominio no supera los 50 elementos por documento (lejos del límite de 1MB por documento de Firestore).
2. **Eficiencia en lecturas y costo:** Permite consultar los productos de un productor en una única consulta con `where(documentId(), "in", productor.productosIds)` o buscar productores que suministran un producto con `where("productosIds", "array-contains", productoId)`.
3. **Simplicidad sin subcolecciones complejas:** Evita costos de queries multinivel en colecciones intermedias (`junction table`), agilizando el renderizado offline y la sincronización en tiempo real (`onSnapshot`).

