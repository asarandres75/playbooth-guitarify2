// Utilidades compartidas por las funciones de /api (los archivos con _ no son rutas)
export const NOMBRES = ["tira", "foto1", "foto2", "foto3"];
export const MAX_BYTES = 4 * 1024 * 1024; // límite de Vercel para el cuerpo: 4,5 MB

export function validar(id, nombre) {
  return /^[a-z0-9]{6,32}$/.test(id || "") && NOMBRES.includes(nombre);
}

export const ruta = (id, nombre) => `playbooth/${id}/${nombre}.jpg`;

// Funciona tanto si el Blob store se creó como "Public" como "Private".
// Si sabes cuál es, puedes fijarlo con la variable de entorno BLOB_ACCESS.
const ACCESOS = process.env.BLOB_ACCESS ? [process.env.BLOB_ACCESS] : ["public", "private"];

export async function conAcceso(fn) {
  let ultimoError = null;
  for (const acceso of ACCESOS) {
    try {
      const r = await fn(acceso);
      if (r !== null && r !== undefined) return r;
    } catch (e) {
      ultimoError = e;
    }
  }
  if (ultimoError) throw ultimoError;
  return null;
}

export const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
