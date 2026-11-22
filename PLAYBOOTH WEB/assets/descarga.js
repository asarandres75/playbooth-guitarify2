/* Página de descarga / compartir de la tira */
(function () {
  const $ = (id) => document.getElementById(id);

  // El id viene en /t/<id> o en ?id=<id>
  const deRuta = location.pathname.match(/\/t\/([a-z0-9]{6,32})\/?$/i);
  const id = (deRuta && deRuta[1]) || new URLSearchParams(location.search).get("id") || "";
  const idValido = /^[a-z0-9]{6,32}$/i.test(id);

  const urlFoto = (nombre, descargar) =>
    `/api/foto?id=${encodeURIComponent(id)}&nombre=${nombre}${descargar ? "&descargar=1" : ""}`;
  const enlaceCompartir = location.origin + (deRuta ? location.pathname : `/t/${id}`);
  const textoCompartir = "Mi tira del PlayBooth de Guitarify 🎸 Feria de Proyectos Personales 2026–2027 · UEPRIM";

  function aviso(texto) {
    const a = $("aviso");
    a.textContent = texto;
    a.classList.add("visible");
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => a.classList.remove("visible"), 2400);
  }

  function noEncontrada() {
    $("portada").hidden = true;
    $("seccionFotos").hidden = true;
    $("noEncontrada").hidden = false;
  }

  if (!idValido) { noEncontrada(); return; }

  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  $("notaIos").hidden = !esIOS;

  // ----- Tira principal (reintenta unos segundos por si se está subiendo) -----
  const img = $("imgTira");
  let intentos = 0;
  img.onload = () => {
    $("tiraMarco").classList.add("lista");
  };
  img.onerror = () => {
    intentos++;
    if (intentos <= 5) setTimeout(() => { img.src = urlFoto("tira") + `&r=${intentos}`; }, 1500);
    else noEncontrada();
  };
  img.src = urlFoto("tira");

  $("btnDescargar").href = urlFoto("tira", true);
  $("btnDescargar").setAttribute("download", `playbooth-guitarify-${id}.jpg`);
  $("btnWhatsapp").href = "https://wa.me/?text=" + encodeURIComponent(`${textoCompartir}\n${enlaceCompartir}`);

  // ----- Compartir (con la imagen si el celular lo permite) -----
  $("btnCompartir").addEventListener("click", async () => {
    try {
      if (navigator.share) {
        try {
          const r = await fetch(urlFoto("tira"));
          const blob = await r.blob();
          const archivo = new File([blob], `playbooth-guitarify-${id}.jpg`, { type: "image/jpeg" });
          if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
            await navigator.share({ files: [archivo], title: "PlayBooth · Guitarify", text: textoCompartir });
            return;
          }
        } catch (e) {
          if (e && e.name === "AbortError") return;
        }
        await navigator.share({ title: "PlayBooth · Guitarify", text: textoCompartir, url: enlaceCompartir });
        return;
      }
      await copiar();
    } catch (e) {
      if (!(e && e.name === "AbortError")) aviso("No se pudo compartir. Prueba con WhatsApp o copia el enlace.");
    }
  });

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlaceCompartir);
      aviso("Enlace copiado");
    } catch (e) {
      prompt("Copia este enlace:", enlaceCompartir);
    }
  }
  $("btnCopiar").addEventListener("click", copiar);

  // ----- Fotos sueltas -----
  const lista = $("listaFotos");
  for (let i = 1; i <= 3; i++) {
    const li = document.createElement("li");
    li.className = "foto-fila";
    li.innerHTML = `
      <span class="foto-num">${i}</span>
      <span class="foto-cuerpo">
        <img class="foto-mini" alt="Foto ${i}" loading="lazy">
        <span><div class="foto-nombre">Foto ${i}</div><div class="foto-sub">PlayBooth · Guitarify</div></span>
      </span>
      <a class="foto-bajar" title="Descargar foto ${i}" aria-label="Descargar foto ${i}"><svg><use href="#i-bajar"/></svg></a>`;
    const mini = li.querySelector("img");
    mini.src = urlFoto(`foto${i}`);
    mini.onerror = () => { li.hidden = true; };
    const a = li.querySelector("a");
    a.href = urlFoto(`foto${i}`, true);
    a.setAttribute("download", `playbooth-guitarify-${id}-foto${i}.jpg`);
    lista.appendChild(li);
  }
})();
