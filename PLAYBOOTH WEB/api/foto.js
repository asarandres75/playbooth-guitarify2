// GET /api/foto?id=<id>&nombre=tira|foto1|foto2|foto3[&descargar=1]
// Sirve la imagen desde el mismo dominio (así descargar y compartir funcionan en todos los celulares).
import { get } from "@vercel/blob";
import { validar, ruta, conAcceso, json } from "./_comun.js";

export async function GET(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const nombre = url.searchParams.get("nombre");
  if (!validar(id, nombre)) return json({ error: "id o nombre inválido" }, 400);

  let resultado = null;
  try {
    resultado = await conAcceso((access) => get(ruta(id, nombre), { access }));
  } catch (e) {
    console.error(e);
  }
  if (!resultado || !resultado.stream) return json({ error: "no encontrada" }, 404);

  const headers = {
    "Content-Type": "image/jpeg",
    "Cache-Control": "public, max-age=86400",
  };
  if (url.searchParams.get("descargar")) {
    const archivo = `playbooth-guitarify-${id}${nombre === "tira" ? "" : "-" + nombre}.jpg`;
    headers["Content-Disposition"] = `attachment; filename="${archivo}"`;
  }
  return new Response(resultado.stream, { status: 200, headers });
}
