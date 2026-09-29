// Fascia interattiva "L'inverno scorso a Milano, giorno per giorno".
// Legge le temperature da window.INVERNO_MILANO (file js/dati-inverno.js),
// disegna una barra per giorno e confronta due impianti:
//   "oggi"   = caldaia a gas tradizionale: gas acceso tutti i giorni
//   "ibrido" = pompa di calore nei giorni miti, caldaia solo nei giorni di gelo

document.addEventListener("DOMContentLoaded", () => {
  const dati = window.INVERNO_MILANO;
  const figura = document.getElementById("inverno");
  if (!dati || !figura) return;

  // Con l'ibrido, sotto questa temperatura media la caldaia entra in funzione (valore di esempio)
  const SOGLIA = 3;
  // Temperatura interna di riferimento: più il giorno è freddo, più la barra è alta
  const COMFORT = 20;

  const giorni = dati.media.length;
  const strip = document.getElementById("inverno-strip");
  const svg = document.getElementById("inverno-barre");
  const range = document.getElementById("inverno-giorno");
  const cursore = document.getElementById("inverno-cursore");
  const stage = document.getElementById("inverno-stage");
  const testoData = document.getElementById("inverno-data");
  const testoStato = document.getElementById("inverno-stato");
  const contatore = document.getElementById("giorni-gas");
  const riepilogo = document.getElementById("inverno-riepilogo");
  const pulsanti = figura.querySelectorAll(".inverno__switch button");

  const riduciMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const giorniGelo = dati.media.filter((t) => t < SOGLIA).length;

  let modo = "oggi";
  let giornoScelto = 0;

  const [anno, mese, giorno] = dati.inizio.split("-").map(Number);
  const dataDelGiorno = (i) => new Date(anno, mese - 1, giorno + i);
  const giornoDiGelo = (i) => dati.media[i] < SOGLIA;
  const caldaiaAccesa = (i) => modo === "oggi" || giornoDiGelo(i);

  const formatoData = new Intl.DateTimeFormat("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const formatoMese = new Intl.DateTimeFormat("it-IT", { month: "short" });

  // "−3 °C" con il segno meno tipografico
  const gradi = (t) => `${Math.round(t)} °C`.replace("-", "−");

  // Colore della barra con l'ibrido: rosso nei giorni di gelo,
  // altrimenti blu, più scuro quando fa freddo e più chiaro quando è mite
  function coloreIbrido(t) {
    if (t < SOGLIA) return "#C2361B";
    const k = Math.min(Math.max((t - SOGLIA) / 13, 0), 1);
    const scuro = [47, 93, 140];
    const chiaro = [184, 204, 222];
    const rgb = scuro.map((c, n) => Math.round(c + (chiaro[n] - c) * k));
    return `rgb(${rgb.join(",")})`;
  }

  // ---------- Disegno delle barre (viewBox 183 x 100: 1 unità = 1 giorno) ----------
  // Il colore sta in una variabile CSS: in modalità "oggi" il CSS le fa tutte rosse,
  // e il ritardo crescente (--ritardo) fa cambiare colore alle barre a onda.
  const NS = "http://www.w3.org/2000/svg";
  dati.media.forEach((t, i) => {
    const altezza = Math.min(Math.max((COMFORT - t) * 4, 6), 100);
    const barra = document.createElementNS(NS, "rect");
    barra.setAttribute("x", i + 0.1);
    barra.setAttribute("y", 100 - altezza);
    barra.setAttribute("width", 0.8);
    barra.setAttribute("height", altezza);
    barra.style.setProperty("--colore", coloreIbrido(t));
    barra.style.setProperty("--ritardo", `${i * 5}ms`);
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

  // ---------- Contatore dei giorni con il gas acceso ----------
  let animazioneContatore = null;

  function aggiornaContatore(valoreFinale) {
    cancelAnimationFrame(animazioneContatore);
    const valoreIniziale = Number(contatore.textContent);
    if (riduciMovimento) {
      contatore.textContent = valoreFinale;
      return;
    }
    const durata = 1000;
    let partenza = null;
    const passo = (ora) => {
      if (partenza === null) partenza = ora;
      const p = Math.min((ora - partenza) / durata, 1);
      const easing = 1 - Math.pow(1 - p, 3); // rallenta verso la fine
      contatore.textContent = Math.round(valoreIniziale + (valoreFinale - valoreIniziale) * easing);
      if (p < 1) animazioneContatore = requestAnimationFrame(passo);
    };
    animazioneContatore = requestAnimationFrame(passo);
  }

  // ---------- Cambio di impianto ----------
  function impostaModo(nuovoModo) {
    modo = nuovoModo;
    figura.classList.toggle("modo-oggi", modo === "oggi");
    pulsanti.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.modo === modo)));

    if (modo === "oggi") {
      aggiornaContatore(giorni);
      riepilogo.textContent =
        `Con una caldaia a gas tradizionale bruci gas tutti i ${giorni} giorni della stagione di riscaldamento, anche quelli miti.`;
    } else {
      aggiornaContatore(giorniGelo);
      riepilogo.textContent =
        `Con un sistema ibrido, per ${giorni - giorniGelo} giorni avresti scaldato casa con l'aria invece che con il gas. La caldaia si sarebbe accesa solo nei ${giorniGelo} giorni di gelo.`;
    }
    mostraGiorno(giornoScelto);
  }

  pulsanti.forEach((b) => {
    b.addEventListener("click", () => {
      annullaCambioAutomatico();
      impostaModo(b.dataset.modo);
    });
  });

  // ---------- Selezione di un giorno ----------
  function mostraGiorno(i) {
    giornoScelto = i;
    const data = formatoData.format(dataDelGiorno(i));
    const accesa = caldaiaAccesa(i);

    range.value = i;
    cursore.style.left = `${((i + 0.5) / giorni) * 100}%`;
    testoData.textContent = data.charAt(0).toUpperCase() + data.slice(1);
    document.getElementById("t-media").textContent = gradi(dati.media[i]);
    document.getElementById("t-minima").textContent = gradi(dati.minima[i]);
    document.getElementById("t-massima").textContent = gradi(dati.massima[i]);

    let stato;
    if (modo === "oggi") {
      stato = "<strong>Brucia gas la caldaia.</strong> Come tutti gli altri giorni dell'inverno, anche quelli miti.";
    } else if (accesa) {
      stato = "<strong>Entra in campo la caldaia.</strong> Fuori gela, ma in casa il calore non manca, anche con i termosifoni che hai.";
    } else {
      stato = "<strong>Lavora la pompa di calore.</strong> Scalda con l'energia dell'aria: la caldaia resta spenta, niente gas.";
    }
    testoStato.innerHTML = stato;
    stage.classList.toggle("is-caldaia", accesa);

    // Testo letto dagli screen reader quando si sposta lo slider
    range.setAttribute("aria-valuetext",
      `${data}, media ${gradi(dati.media[i])}, ${accesa ? "caldaia a gas accesa" : "lavora la pompa di calore, niente gas"}`);
  }

  range.addEventListener("input", () => mostraGiorno(Number(range.value)));

  // Trascinamento con mouse o dito: la posizione orizzontale diventa un giorno
  function giornoDaPuntatore(event) {
    const box = strip.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - box.left, 0), box.width - 1);
    return Math.floor((x / box.width) * giorni);
  }

  strip.addEventListener("pointerdown", (event) => {
    strip.setPointerCapture(event.pointerId);
    mostraGiorno(giornoDaPuntatore(event));
  });

  strip.addEventListener("pointermove", (event) => {
    if (strip.hasPointerCapture(event.pointerId)) mostraGiorno(giornoDaPuntatore(event));
  });

  // ---------- Stato iniziale ----------
  // Si parte dalla caldaia di oggi su un giorno mite (media più vicina a 10 °C):
  // il gas è acceso anche se non ce ne sarebbe bisogno.
  const giornoMite = dati.media.reduce(
    (migliore, t, i) => (Math.abs(t - 10) < Math.abs(dati.media[migliore] - 10) ? i : migliore), 0);
  mostraGiorno(giornoMite);

  // ---------- Unico movimento automatico ----------
  // Quando la fascia è ben visibile, dopo un attimo si passa da sola all'ibrido.
  // Chi preferisce meno movimento vede subito l'ibrido; un click sull'interruttore annulla il cambio.
  let timerCambio = null;
  let osservatore = null;

  function annullaCambioAutomatico() {
    clearTimeout(timerCambio);
    if (osservatore) osservatore.disconnect();
  }

  if (riduciMovimento || !("IntersectionObserver" in window)) {
    impostaModo("ibrido");
  } else {
    osservatore = new IntersectionObserver((voci) => {
      if (voci[0].isIntersecting) {
        osservatore.disconnect();
        timerCambio = setTimeout(() => impostaModo("ibrido"), 1200);
      }
    }, { threshold: 0.6 });
    osservatore.observe(strip);
  }
});
