# Uso rapido - Postman o Thunder Client

## 1) Levantar backend

1. Asegurate de tener MongoDB encendido.
2. En `backend/` ejecuta:

```bash
npm run seed:admin
npm run dev
```

## 2) Importar coleccion

- Importa el archivo `docs/postman/App-Harinas.postman_collection.json`.

## 3) Flujo de prueba recomendado

1. Ejecuta `Auth - Login`.
2. Copia el valor `data.token` y guardalo en variable `token`.
3. Ejecuta `Harinas - Crear` y copia el `_id` retornado en `data._id`.
4. Guarda ese id en la variable `harinaId`.
5. Ejecuta `Harinas - Listar`, `Harinas - Actualizar` y `Harinas - Eliminar`.
