# Termica Lombarda — landing page

Landing single page per Termica Lombarda Srl (installatore immaginario, Milano).
Offerta: sostituire la vecchia caldaia con un sistema ibrido (caldaia a condensazione + pompa di calore), fino al 65% della spesa per l'impianto rimborsato con il Conto Termico 3.0 del GSE, pratica gestita dall'azienda.
Obiettivo unico della pagina: far richiedere un **sopralluogo gratuito**.

## Stack e vincoli
- HTML, CSS e JavaScript vanilla. Nessun framework, nessuna libreria, nessun build step, nessun `package.json`.
- Deploy: GitHub Pages dal branch `main`, root del repo (https://dig26.github.io/termica-lombarda-landing/).
- Font self-hosted in `assets/fonts/` (Archivo variabile, OFL). Nessuna risorsa caricata da CDN o servizi terzi.
- Il form **non invia dati**: `method="dialog"`, validazione lato client, `preventDefault()`, messaggio di conferma. Nessun `fetch`, nessun `action` verso server.
- `noindex`: l'azienda è immaginaria.

## Struttura
- `index.html`: hero con foto + fascia interattiva "L'inverno scorso a Milano", prenotazione (form), perché adesso, come funziona, percorso in 5 passi, FAQ, richiamo finale.
- `css/style.css`: unico foglio di stile, design token in `:root`.
- `js/form.js`: validazione e conferma del form.
- `js/inverno.js`: fascia interattiva (183 giorni, confronto caldaia di oggi / sistema ibrido) e stima della bolletta.
- `js/dati-inverno.js`: temperature giornaliere di Milano 15/10/2025–15/04/2026, **generato** da `scripts/scarica-dati.py` (Open-Meteo, CC BY 4.0). Non modificarlo a mano.
- `scripts/prepara-foto.swift`: ritaglio, sfocatura di marchi e ridimensionamento delle foto (poi `cwebp` per il WebP).
- `assets/img/`: foto Unsplash in WebP, crediti nel footer. `assets/favicon.svg`: logo a raccordo a T con variante per tema scuro.

## Scelte di contenuto da non stravolgere senza discuterne
- 65% = rimborso sulla **spesa per l'impianto**; circa 40% = risparmio stimato **in bolletta**. Ogni numero va sempre legato al suo sostantivo.
- La fascia confronta la caldaia di oggi (183 giorni di gas) con l'ibrido (18 giorni di gas): i dati sono reali, la soglia di 3 °C è dichiarata come esempio. Non gonfiare i numeri.
- La stima della bolletta ha le ipotesi visibili nella pagina ("Come facciamo il conto").
- Nessun marchio reale di produttori visibile nelle foto.

## Stile del codice
- HTML semantico (`header`, `main`, `section`, `footer`), un solo `h1`.
- CSS mobile-first, colori/spaziature/tipografia come custom properties in `:root`. Classi con nomi leggibili, specificità bassa.
- JS minimo, commentato dove serve. Niente codice che l'autore non sa spiegare.
- Lingua dei contenuti e dei commenti: italiano.

## Qualità minima
- Responsive da 320px in su, nessuno scorrimento orizzontale.
- Accessibilità: contrasto WCAG AA, focus visibile, label su ogni campo, errori annunciati, `prefers-reduced-motion` rispettato.
- Meta SEO e Open Graph in `<head>`.

## Processo
- Ogni modifica importante si fa su un branch di prova (`prova-...`); si unisce a `main` e si pubblica solo dopo l'ok dell'utente.
- Anteprima locale: avviare `python3 -m http.server 8000` dalla cartella del progetto via terminale (il server lanciato da `.claude/launch.json` non ha i permessi su Documenti), poi aprire `http://localhost:8000`.
- Verifica visiva a larghezza mobile e desktop, console senza errori.
- Commit piccoli, messaggi in italiano.
- `DECISIONI.md` documenta le scelte tecniche (strumenti, linguaggi, struttura), non i contenuti.
