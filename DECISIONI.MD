Decisioni

Sito: https://dig26.github.io/termica-lombarda-landing/

Il codice l'ha scritto Claude Code. Io ho deciso cosa fare e ho approvato le proposte. Qui ci sono le scelte principali.

Strumenti
- Claude Code (app desktop) per tutto il lavoro: codice, prove nel browser, GitHub.
- Un file `CLAUDE.md` con le regole del progetto, così ogni sessione di Claude Code partiva dalle stesse.
- La skill `frontend-design` di Anthropic, per avere un piano grafico prima di scrivere codice.
- GitHub per il codice, con commit piccoli. Il sito è pubblicato con GitHub Pages dal branch `main`: gratis e si aggiorna a ogni push.
- Le modifiche grosse le facevo su un branch di prova: se mi convincevano facevo il merge su `main`, altrimenti cancellavo il branch.
- Alla fine ho aperto una seconda sessione di Claude Code senza contesto, per far valutare la pagina da zero e migliorarne la grafica e la capacità di portare contatti (lead). Da lì sono venuti gli ultimi accorgimenti.
- Claude Code mi ha proposto una piccola correzione di accessibilità (gli screen reader leggevano troppe volte la cifra dello slider della bolletta) e già che c'ero gli ho dato l'ok.

Linguaggi
- HTML, CSS e JavaScript, senza framework: è una sola pagina, non serviva altro.
- Ho valutato TypeScript ma non l'ho usato: per così poco codice aggiungeva complessità senza vantaggi reali.

Struttura
- Una sola pagina statica, senza server.
- Tutto quello che serve (font, foto, dati meteo) è dentro il repository: la pagina non chiama altri siti.
- Le temperature di Milano sono state scaricate una volta e salvate, invece di chiederle a un servizio esterno ogni volta.
- L'organizzazione dei file l'ha decisa Claude Code ed è descritta in `CLAUDE.md`.
