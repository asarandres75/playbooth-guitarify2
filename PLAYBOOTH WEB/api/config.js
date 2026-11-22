// GET /api/config — dirección pública para el QR (opcional: variable de entorno URL_PUBLICA)
import { json } from "./_comun.js";

export function GET() {
  return json({ base: process.env.URL_PUBLICA || null });
}
