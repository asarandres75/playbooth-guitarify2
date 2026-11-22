// POST /api/subir?id=<id>&nombre=tira|foto1|foto2|foto3   (cuerpo: la imagen JPG)
import { put } from "@vercel/blob";
import { validar, ruta, conAcceso, json, MAX_BYTES } from "./_comun.js";

export async function POST(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const nombre = url.searchParams.get("nombre");
  if (!validar(id, nombre)) return json({ error: "id o nombre inválido" }, 400);
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ error: "Falta conectar el Blob store al proyecto en Vercel (BLOB_READ_WRITE_TOKEN)." }, 500);
  }

  const datos = Buffer.from(await request.arrayBuffer());
  if (datos.length === 0 || datos.length > MAX_BYTES) return json({ error: "tamaño inválido" }, 413);
  // debe ser un JPG de verdad (empieza con FF D8 FF)
  if (!(datos[0] === 0xff && datos[1] === 0xd8 && datos[2] === 0xff)) return json({ error: "no es JPG" }, 415);

  try {
    await conAcceso((access) =>
      put(ruta(id, nombre), datos, {
        access,
        contentType: "image/jpeg",
        addRandomSuffix: false,
        allowOverwrite: true,
      })
    );
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "no se pudo guardar", detalle: String(e && e.message) }, 500);
  }
}
