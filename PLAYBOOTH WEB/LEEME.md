# PlayBooth · Guitarify (web del photobooth)

Web para la cabina del PlayBooth en la Feria de Proyectos Personales 2026–2027 (UEPRIM).

**Cómo funciona:** Empezar → cuenta 3-2-1 → cada foto se puede **usar** o **repetir** (las veces que quieran,
y también pueden tocar una foto ya lista en la lista de la izquierda para rehacerla) → con las 3 fotos se arma la
tira de Guitarify con un **QR**. El QR abre una página en el celular para **descargar la tira**, descargar las
**3 fotos sueltas**, **compartir** (WhatsApp, Instagram, etc.) o copiar el enlace.

| Archivo | Qué es |
|---|---|
| `index.html` | La cabina (se abre en la laptop dentro del PlayBooth) |
| `tira.html` | La página que abre el QR (`/t/<código>`) |
| `assets/tira.js` | Dibuja la tira (mismo diseño que `PRODUCTO/playbooth-tira-simple.png`, 1200 × 3600 px) |
| `assets/cabina.js` | Lógica de la cabina. Arriba están los **ajustes** (espejo, segundos de cuenta, reinicio automático) |
| `api/` | Funciones de Vercel que guardan y sirven las fotos (Vercel Blob) |
| `servidor-local.mjs` | Plan B sin internet (ver abajo) |

---

## Publicarla en Vercel (como Guitarify) — una sola vez, ~10 min

Para que el QR funcione desde cualquier celular, las fotos tienen que quedar guardadas en internet.
Uso **Vercel Blob** (el almacenamiento de archivos de Vercel; el plan gratis alcanza de sobra para la feria).

1. **Sube esta carpeta a GitHub** como un repositorio nuevo (por ejemplo `playbooth-guitarify`).
   Con GitHub Desktop: *File → Add local repository* → elige esta carpeta → *Publish repository*.
2. En **vercel.com** → *Add New… → Project* → importa ese repositorio → *Deploy*
   (no hay que cambiar ninguna opción: no tiene "build").
3. En el proyecto de Vercel → pestaña **Storage** → *Create Database* → **Blob** → ponle un nombre
   (ej. `playbooth-fotos`) → *Create* → **Connect** al proyecto (deja marcados Production y Preview).
   Esto agrega solo la variable `BLOB_READ_WRITE_TOKEN`.
   *Si te pregunta si el store es Public o Private, cualquiera funciona; Public es lo más simple.*
4. Pestaña **Deployments** → en el último → ⋯ → **Redeploy** (para que tome la variable nueva).
5. Abre `https://TU-PROYECTO.vercel.app` en la laptop (en Chrome o Edge), acepta el permiso de cámara
   y pon la ventana en pantalla completa con **F11**.

**Prueba antes de la feria:** saca una tira, escanea el QR con tu celular con **datos móviles** (no el Wi-Fi
de la casa) y descarga la tira. Si el QR muestra "Sin conexión", revisa los pasos 3 y 4.

> Opcional: si quieres un enlace más bonito (ej. `playbooth-guitarify.vercel.app`), cámbialo en
> *Settings → Domains*. El QR usa siempre la dirección desde la que abriste la cabina.

## En la feria

- **Teclas:** `Espacio` / `Enter` = tomar foto y "usar esta" · `R` = repetir.
  Un control remoto Bluetooth de presentaciones (los que mandan "flecha derecha / izquierda") también funciona:
  derecha = tomar/usar, izquierda = repetir.
- La pantalla final vuelve sola al inicio después de 2 minutos (o con **Nueva sesión**).
  Con teclas no se borra, para que nadie pierda el QR antes de escanearlo.
- Si se cae el internet al final: la tira igual se ve en pantalla, aparece **Reintentar subida**, y
  **Descargar aquí** la guarda en la laptop para mandarla por WhatsApp después.
- La cámara sale **en espejo** (como selfie). Si prefieres que no, cambia `ESPEJO: true` a `false` en
  `assets/cabina.js`.

## Plan B: sin internet en el colegio

Necesitas [Node.js](https://nodejs.org) instalado en la laptop.

1. Abre una terminal en esta carpeta y ejecuta: `node servidor-local.mjs`
2. Abre `http://localhost:3000` en la laptop.
3. Conecta la laptop y los celulares de los visitantes a la **misma red Wi-Fi** (por ejemplo, el hotspot de tu celular).
   El QR apuntará a la IP de la laptop y las fotos se guardan en la carpeta `tiras-local`.

## Privacidad (para tu reflexión / informe)

Cada tira tiene un código aleatorio de 10 caracteres: solo quien tiene el QR puede verla, pero cualquiera con el
enlace sí. Después de la feria puedes borrar todas las fotos en Vercel → Storage → tu Blob → seleccionar todo → *Delete*.
Conviene avisarlo con un cartelito en la cabina ("tus fotos se borran después de la feria").
