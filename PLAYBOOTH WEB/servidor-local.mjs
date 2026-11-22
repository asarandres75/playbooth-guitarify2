// Servidor local del PlayBooth (plan B sin internet, o para probar en casa).
// Uso:  node servidor-local.mjs      → abre http://localhost:3000 en la laptop
// Las tiras se guardan en la carpeta ./tiras-local y el QR apunta a la IP de la
// laptop en la red Wi-Fi, así que el celular tiene que estar en la MISMA red.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const PUERTO = Number(process.env.PORT) || 3000;
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_TIRAS = path.join(RAIZ, "tiras-local");
const NOMBRES = ["tira", "foto1", "foto2", "foto3"];

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

function ipLocal() {
  for (const lista of Object.values(os.networkInterfaces())) {
    for (const r of lista || []) {
      if (r.family === "IPv4" && !r.internal) return r.address;
    }
  }
  return "localhost";
}
const BASE_PUBLICA = process.env.URL_PUBLICA || `http://${ipLocal()}:${PUERTO}`;

const valido = (id, nombre) => /^[a-z0-9]{6,32}$/.test(id || "") && NOMBRES.includes(nombre);

function enviar(res, status, cuerpo, tipo = "application/json", extra = {}) {
  res.writeHead(status, { "Content-Type": tipo, "Cache-Control": "no-store", ...extra });
  res.end(cuerpo);
}

async function leerCuerpo(req, max = 6 * 1024 * 1024) {
  const partes = [];
  let total = 0;
  for await (const p of req) {
    total += p.length;
    if (total > max) throw new Error("demasiado grande");
    partes.push(p);
  }
  return Buffer.concat(partes);
}

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;

    if (p === "/api/config") return enviar(res, 200, JSON.stringify({ base: BASE_PUBLICA }));

    if (p === "/api/subir" && req.method === "POST") {
      const id = url.searchParams.get("id"), nombre = url.searchParams.get("nombre");
      if (!valido(id, nombre)) return enviar(res, 400, '{"error":"inválido"}');
      const datos = await leerCuerpo(req);
      if (!(datos[0] === 0xff && datos[1] === 0xd8)) return enviar(res, 415, '{"error":"no es JPG"}');
      await fs.mkdir(path.join(CARPETA_TIRAS, id), { recursive: true });
      await fs.writeFile(path.join(CARPETA_TIRAS, id, `${nombre}.jpg`), datos);
      return enviar(res, 200, '{"ok":true}');
    }

    if (p === "/api/foto") {
      const id = url.searchParams.get("id"), nombre = url.searchParams.get("nombre");
      if (!valido(id, nombre)) return enviar(res, 400, '{"error":"inválido"}');
      try {
        const datos = await fs.readFile(path.join(CARPETA_TIRAS, id, `${nombre}.jpg`));
        const extra = url.searchParams.get("descargar")
          ? { "Content-Disposition": `attachment; filename="playbooth-guitarify-${id}${nombre === "tira" ? "" : "-" + nombre}.jpg"` }
          : {};
        return enviar(res, 200, datos, "image/jpeg", extra);
      } catch {
        return enviar(res, 404, '{"error":"no encontrada"}');
      }
    }

    // Archivos estáticos
    let archivo = p === "/" ? "/index.html" : p;
    if (/^\/t\/[a-z0-9]+\/?$/i.test(p) || p === "/tira") archivo = "/tira.html";
    const completo = path.normalize(path.join(RAIZ, archivo));
    if (!completo.startsWith(RAIZ) || completo.includes(`${path.sep}api${path.sep}`) || completo.includes("tiras-local")) {
      return enviar(res, 403, "prohibido", "text/plain");
    }
    const datos = await fs.readFile(completo);
    return enviar(res, 200, datos, TIPOS[path.extname(completo)] || "application/octet-stream");
  } catch (e) {
    if (e && e.code === "ENOENT") return enviar(res, 404, "no existe", "text/plain");
    console.error(e);
    return enviar(res, 500, "error", "text/plain");
  }
});

servidor.listen(PUERTO, () => {
  console.log("");
  console.log("  PlayBooth · Guitarify (modo local)");
  console.log(`  Cabina (abrir en la laptop):  http://localhost:${PUERTO}`);
  console.log(`  El QR llevará a:              ${BASE_PUBLICA}/t/...`);
  console.log("  Los celulares deben estar en la misma red Wi-Fi que la laptop.");
  console.log("");
});
