# Termica Lombarda — landing page

Landing single page per Termica Lombarda Srl (installatore immaginario, Milano).
Offerta: sostituire la vecchia caldaia con un sistema ibrido (caldaia a condensazione + pompa di calore), fino al 65% rimborsato con il Conto Termico 3.0 del GSE, pratica gestita dall'azienda.
Obiettivo unico della pagina: far richiedere un **sopralluogo gratuito**.

## Stack e vincoli
- HTML, CSS e JavaScript vanilla. Nessun framework, nessuna libreria, nessun build step, nessun `package.json`.
- File: `index.html`, `css/style.css`, `js/form.js`, `assets/` (font, immagini, icone).
- Deploy: GitHub Pages dal branch `main`, root del repo.
- Font self-hosted in `assets/fonts/` (woff2). Nessuna risorsa caricata da CDN o servizi terzi.
- Il form **non invia dati**: validazione lato client, `preventDefault()`, messaggio di conferma. Nessun `fetch`, nessun `action` verso server.

## Stile del codice
- HTML semantico (`header`, `main`, `section`, `footer`), un solo `h1`.
- CSS mobile-first, colori/spaziature/tipografia come custom properties in `:root`. Classi con nomi leggibili, specificità bassa.
- JS minimo, commentato solo dove serve. Niente codice che non sai spiegare.
- Lingua dei contenuti: italiano.

## Qualità minima
- Responsive da 320px in su.
- Accessibilità: contrasto WCAG AA, focus visibile, label su ogni campo, errori annunciati (`aria-live`), `prefers-reduced-motion` rispettato.
- Meta SEO e Open Graph in `<head>`.

## Processo
- Design: usare la skill `frontend-design` (in `.claude/skills/`) e far approvare il piano prima di scrivere codice.
- Verifica visiva nel browser integrato, a larghezza mobile e desktop.
- Commit piccoli, uno per sezione o modifica logica, messaggi in italiano.
- `DECISIONI.md` documenta le scelte tecniche (strumenti, linguaggi, struttura), non i contenuti: va aggiornato quando cambia una scelta.
