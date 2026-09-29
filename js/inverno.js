// Fascia interattiva "L'inverno scorso a Milano, giorno per giorno".
// Legge le temperature da window.INVERNO_MILANO (file js/dati-inverno.js),
// disegna una barra per giorno e aggiorna lo schema dell'impianto sul giorno scelto.

document.addEventListener("DOMContentLoaded", () => {
  const dati = window.INVERNO_MILANO;
  const strip = document.getElementById("inverno-strip");
  if (!dati || !strip) return;

  // Sotto questa temperatura media la caldaia aiuta la pompa di calore (valore di esempio)
  const SOGLIA = 3;
  // Temperatura interna di riferimento: più il giorno è freddo, più la barra è alta
  const COMFORT = 20;

  const giorni = dati.media.length;
  const svg = document.getElementById("inverno-barre");
  const range = document.getElementById("inverno-giorno");
  const cursore = document.getElementById("inverno-cursore");
  const stage = document.getElementById("inverno-stage");
  const testoData = document.getElementById("inverno-data");
  const testoStato = document.getElementById("inverno-stato");

  const [anno, mese, giorno] = dati.inizio.split("-").map(Number);
  const dataDelGiorno = (i) => new Date(anno, mese - 1, giorno + i);
  const serveCaldaia = (i) => dati.media[i] < SOGLIA;

  const formatoData = new Intl.DateTimeFormat("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const formatoMese = new Intl.DateTimeFormat("it-IT", { month: "short" });

  // "−3 °C" con il segno meno tipografico
  const gradi = (t) => `${Math.round(t)} °C`.replace("-", "−");

  // Blu scuro nei giorni freddi, blu chiaro in quelli miti (interpolazione lineare RGB)
  function coloreBarra(t) {
    if (t < SOGLIA) return "#C2361B";
    const k = Math.min(Math.max((t - SOGLIA) / 13, 0), 1);
    const scuro = [47, 93, 140];
    const chiaro = [184, 204, 222];
    const rgb = scuro.map((c, n) => Math.round(c + (chiaro[n] - c) * k));
    return `rgb(${rgb.join(",")})`;
  }

  // ---------- Disegno delle barre (viewBox 183 x 100: 1 unità = 1 giorno) ----------
  const NS = "http://www.w3.org/2000/svg";
  dati.media.forEach((t, i) => {
    const altezza = Math.min(Math.max((COMFORT - t) * 4, 6), 100);
    const barra = document.createElementNS(NS, "rect");
    barra.setAttribute("x", i + 0.1);
    barra.setAttribute("y", 100 - altezza);
    barra.setAttribute("width", 0.8);
    barra.setAttribute("height", altezza);
    barra.setAttribute("fill", coloreBarra(t));
    svg.appendChild(barra);
  });

  // ---------- Etichette dei mesi, posizionate sul primo giorno di ogni mese ----------
  // (più il 15 ottobre, primo giorno della stagione, indicato solo con il mese)
  const mesi = document.getElementById("inverno-mesi");
  for (let i = 0; i < giorni; i++) {
    const d = dataDelGiorno(i);
    if (i === 0 || d.getDate() === 1) {
      const etichetta = document.createElement("span");
      etichetta.textContent = formatoMese.format(d);
      etichetta.style.left = `${(i / giorni) * 100}%`;
      mesi.appendChild(etichetta);
    }
  }

  // ---------- Riepilogo calcolato dai dati ----------
  const giorniCaldaia = dati.media.filter((t) => t < SOGLIA).length;
  document.getElementById("giorni-caldaia").textContent = giorniCaldaia;
  document.getElementById("giorni-pdc").textContent = giorni - giorniCaldaia;
  document.getElementById("giorni-totali").textContent = giorni;

  // ---------- Selezione di un giorno ----------
  function mostraGiorno(i) {
    const d = dataDelGiorno(i);
    const data = formatoData.format(d);
    const insieme = serveCaldaia(i);

    range.value = i;
    cursore.style.left = `${((i + 0.5) / giorni) * 100}%`;
    testoData.textContent = data.charAt(0).toUpperCase() + data.slice(1);
    document.getElementById("t-media").textContent = gradi(dati.media[i]);
    document.getElementById("t-minima").textContent = gradi(dati.minima[i]);
    document.getElementById("t-massima").textContent = gradi(dati.massima[i]);

    testoStato.innerHTML = insieme
      ? "<strong>Lavorano insieme.</strong> Fa molto freddo: la caldaia aiuta la pompa di calore."
      : "<strong>Lavora la pompa di calore.</strong> Scalda la casa da sola, la caldaia resta spenta.";
    stage.classList.toggle("is-caldaia", insieme);

    // Testo letto dagli screen reader quando si sposta lo slider
    range.setAttribute("aria-valuetext",
      `${data}, media ${gradi(dati.media[i])}, ${insieme ? "lavorano insieme pompa di calore e caldaia" : "lavora solo la pompa di calore"}`);
  }

  range.addEventListener("input", () => {
    fermaIntro();
    mostraGiorno(Number(range.value));
  });

  // Trascinamento con mouse o dito: la posizione orizzontale diventa un giorno
  function giornoDaPuntatore(event) {
    const box = strip.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - box.left, 0), box.width - 1);
    return Math.floor((x / box.width) * giorni);
  }

  strip.addEventListener("pointerdown", (event) => {
    fermaIntro();
    strip.setPointerCapture(event.pointerId);
    mostraGiorno(giornoDaPuntatore(event));
  });

  strip.addEventListener("pointermove", (event) => {
    if (strip.hasPointerCapture(event.pointerId)) mostraGiorno(giornoDaPuntatore(event));
  });

  // ---------- Unico movimento automatico: il cursore scorre fino al giorno più freddo ----------
  const piuFreddo = dati.media.indexOf(Math.min(...dati.media));
  const riduciMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let intro = null;

  function fermaIntro() {
    if (intro) cancelAnimationFrame(intro);
    intro = null;
  }

  if (riduciMovimento) {
    mostraGiorno(piuFreddo);
  } else {
    const durata = 1800;
    let partenza = null;
    const passo = (ora) => {
      if (partenza === null) partenza = ora;
      const p = Math.min((ora - partenza) / durata, 1);
      const easing = 1 - Math.pow(1 - p, 3); // rallenta verso la fine
      mostraGiorno(Math.round(easing * piuFreddo));
      intro = p < 1 ? requestAnimationFrame(passo) : null;
    };
    intro = requestAnimationFrame(passo);
  }
});
