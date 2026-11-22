/* Dibuja la tira Guitarify (igual que PRODUCTO/playbooth-tira-simple.png)
   Medidas de diseño: 600 × 1800 (2 × 6 pulgadas a 300 ppp).
   Se dibuja a ESCALA × para que salga nítida (por defecto 1200 × 3600). */
(function () {
  const ANCHO = 600, ALTO = 1800;
  // Marcos de las 3 fotos (en coordenadas de diseño)
  const MARCO = { x: 24, w: 552, h: 426, ys: [24, 464, 904], radio: 6 };
  const PROPORCION_FOTO = MARCO.w / MARCO.h; // ≈ 1,296

  const ORO = "#d4a52a";
  const ROJO = "#c8102e";

  function rectRedondo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Púa / escudo con rayo (logo). (x, y) = esquina superior izquierda, s = alto.
  function dibujarPua(ctx, x, y, s) {
    const k = s / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    const pua = new Path2D("M50 97 C33 84 7 60 7 30 C7 14 27 5 50 5 C73 5 93 14 93 30 C93 60 67 84 50 97 Z");
    ctx.fillStyle = ROJO;
    ctx.fill(pua);
    ctx.lineWidth = 5;
    ctx.strokeStyle = ORO;
    ctx.stroke(pua);
    const rayo = new Path2D("M57 17 L35 55 L48 55 L42 85 L66 43 L53 43 L60 17 Z");
    ctx.fillStyle = "#f7ede0";
    ctx.fill(rayo);
    ctx.restore();
  }

  // Dibuja una foto (canvas o imagen) recortada para llenar el marco
  function dibujarCubriendo(ctx, img, x, y, w, h) {
    const iw = img.width, ih = img.height;
    const escala = Math.max(w / iw, h / ih);
    const sw = w / escala, sh = h / escala;
    ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  }

  function dibujarQR(ctx, texto, x, y, lado) {
    const qr = qrcode(0, "M");
    qr.addData(texto);
    qr.make();
    const n = qr.getModuleCount();
    const m = lado / n;
    ctx.fillStyle = "#111";
    for (let f = 0; f < n; f++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(f, c)) {
          // +0.6 evita líneas finas entre módulos al escalar
          ctx.fillRect(x + c * m, y + f * m, m + 0.6, m + 0.6);
        }
      }
    }
  }

  async function cargarFuentes() {
    if (!document.fonts) return;
    try {
      await Promise.all([
        document.fonts.load('italic 800 64px "Montserrat"'),
        document.fonts.load('italic 700 17px "Montserrat"'),
        document.fonts.load('500 19px "Montserrat"'),
        document.fonts.load('700 18px "Montserrat"'),
      ]);
    } catch (e) { /* si falla, usa la fuente del sistema */ }
  }

  /**
   * Compone la tira.
   * @param {Array<CanvasImageSource>} fotos  3 fotos (canvas o imágenes)
   * @param {string|null} urlQR  enlace del QR (null = recuadro vacío)
   * @param {number} escala  1 = 600×1800, 2 = 1200×3600
   */
  async function componerTira(fotos, urlQR, escala = 2) {
    await cargarFuentes();
    const lienzo = document.createElement("canvas");
    lienzo.width = ANCHO * escala;
    lienzo.height = ALTO * escala;
    const ctx = lienzo.getContext("2d");
    ctx.scale(escala, escala);

    // Fondo negro con brillo rojo abajo a la izquierda y dorado a la derecha
    ctx.fillStyle = "#0b0a09";
    ctx.fillRect(0, 0, ANCHO, ALTO);
    let g = ctx.createRadialGradient(70, 1660, 0, 70, 1660, 620);
    g.addColorStop(0, "rgba(92, 12, 22, 0.95)");
    g.addColorStop(0.45, "rgba(52, 9, 15, 0.7)");
    g.addColorStop(1, "rgba(11, 10, 9, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    g = ctx.createRadialGradient(640, 1440, 0, 640, 1440, 330);
    g.addColorStop(0, "rgba(64, 50, 18, 0.75)");
    g.addColorStop(1, "rgba(11, 10, 9, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // Las 3 fotos
    MARCO.ys.forEach((y, i) => {
      ctx.save();
      rectRedondo(ctx, MARCO.x, y, MARCO.w, MARCO.h, MARCO.radio);
      ctx.fillStyle = "#2b2622";
      ctx.fill();
      ctx.clip();
      if (fotos[i]) dibujarCubriendo(ctx, fotos[i], MARCO.x, y, MARCO.w, MARCO.h);
      ctx.restore();
      rectRedondo(ctx, MARCO.x + 0.5, y + 0.5, MARCO.w - 1, MARCO.h - 1, MARCO.radio);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(212, 165, 42, 0.7)";
      ctx.stroke();
    });

    // Logo: púa + "Guitarify", centrado
    ctx.font = 'italic 800 64px "Montserrat", sans-serif';
    ctx.textBaseline = "alphabetic";
    const textoLogo = "Guitarify";
    const anchoTexto = ctx.measureText(textoLogo).width;
    const ladoPua = 76, separacion = 18;
    const inicio = (ANCHO - (ladoPua * 0.86 + separacion + anchoTexto)) / 2;
    dibujarPua(ctx, inicio - ladoPua * 0.07, 1402, ladoPua);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(textoLogo, inicio + ladoPua * 0.86 + separacion, 1462);

    // Línea divisoria
    ctx.fillStyle = "rgba(212, 165, 42, 0.32)";
    ctx.fillRect(24, 1537, 552, 1.2);

    // Textos de la feria
    ctx.fillStyle = "#ddd3c6";
    ctx.font = '500 19px "Montserrat", sans-serif';
    ctx.fillText("Feria de Proyectos", 24, 1656);
    ctx.fillText("Personales 2026–2027", 24, 1682);
    ctx.fillStyle = "#ffffff";
    ctx.font = '700 18px "Montserrat", sans-serif';
    if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
    ctx.fillText("UEPRIM", 24, 1707);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.fillStyle = ORO;
    ctx.font = 'italic 700 17px "Montserrat", sans-serif';
    ctx.fillText("Descifra la música que tocas.", 24, 1770);

    // Recuadro del QR (abajo a la derecha)
    rectRedondo(ctx, 426, 1626, 150, 150, 9);
    ctx.fillStyle = "#f6f0e5";
    ctx.fill();
    if (urlQR) dibujarQR(ctx, urlQR, 436, 1636, 130);

    return lienzo;
  }

  window.Tira = { componerTira, dibujarPua, PROPORCION_FOTO, ANCHO, ALTO };
})();
