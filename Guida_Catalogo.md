# Guida al prototipo — Catalogo prodotti

26/10/2026 · Ugo Volpato

## Prima di iniziare

Il prototipo mostra come Oltre Il Giardino terrà in un solo posto la scheda di ogni articolo: descrizione, misure, foto e colori, varianti, prezzi e fornitori. Dal catalogo la logistica prenderà ingombri, pesi e tempi di carico.

- Si apre dal browser, senza installare nulla: https://uvolpato.github.io/OltreIlGiardino/Prototipo-Catalogo/
- I dati sono quelli del file articoli attuale (2.194 articoli). Nella versione online **prezzi e fornitori sono tolti**.
- Le modifiche restano solo nel tuo browser. «Azzera», in basso a sinistra, riparte dai dati originali.
- Le parti di intelligenza artificiale (descrizioni, foto di presentazione) sono **simulate**.

Calcola circa 25 minuti.

## L'accesso: scegli un ruolo

All'apertura scegli con quale ruolo entrare. Nel prodotto vero ci sarà un solo accesso aziendale, lo stesso della Logistica. Ogni ruolo vede viste diverse:

| Ruolo | Chi è | Cosa vede |
|---|---|---|
| **Curatore** | chi rivede e approva le schede | tutto |
| **Censitore** | magazzino e location, da telefono | Censimento, Catalogo |
| **Commerciale** | chi prepara le offerte | Catalogo (sola lettura), API |
| **Logistica** | chi pianifica | Catalogo, Censimento, Import |

Per il primo giro entra come **Curatore**. «Cambia», in basso a sinistra, cambia ruolo.

## Percorso consigliato

1. **Catalogo** (8 min) — cerca un articolo, filtra, apri una scheda.
2. **Scheda articolo** (8 min) — guarda le schede interne e cosa manca per completarla.
3. **Censimento** (5 min) — il flusso da telefono: foto, nota, proposta dell'AI, invio in revisione.
4. **Revisione e Import** (4 min) — le schede da approvare e le anomalie del file attuale.

## Catalogo

- Gli articoli sono raggruppati per **modello**: le varianti di colore stanno insieme. «Raggruppa le varianti» si può spegnere.
- **Naviga per categoria** parte dalle categorie (Sedute, Tavoli, Luci…) e scende nelle sottocategorie. Spento, mostra tutto con i filtri.
- Si cerca per codice, descrizione, fornitore o tema, e si filtra per stato, categoria, tipo (articolo finito o componente) e colore.
- **Griglia o Tabella**: la tabella si ordina cliccando le colonne e scorre restando sotto i filtri.
- La **completezza** dice quanto è compilata ogni scheda. Oggi nessuna è completa: è il punto di partenza reale.

## Scheda articolo

Cliccando un articolo si apre la scheda. A sinistra c'è un riepilogo fisso (foto, stato, codice, classe, colore, varianti, completezza con le voci mancanti cliccabili). A destra ci sono le schede:

- **Descrizione** — testo, tipo (finito o componente).
- **Uso negli eventi** — stili, temi, dove si usa.
- **Misure** — dimensioni, anche con un massimo («da… fino a…»), e i dati per la logistica: volume e peso da imballato, pezzi per pila, tempi di carico e montaggio.
- **Composizione** — struttura, rivestimenti, componenti condivisi tra articoli.
- **Foto e colori** — il colore è calcolato dai pixel della foto, con il codice colore aziendale più vicino.
- **Prezzi e fornitori** — prezzi di acquisto, vendita e noleggio, **giorni coperti dal noleggio**, più fornitori, storico dei costi. Li modifica solo il curatore.
- **Magazzino e storico** — giacenza.

Ogni scheda mostra quanti dati mancano. **«Duplica…»** crea una nuova variante dello stesso modello (per esempio un altro colore) oppure un articolo nuovo. Il commerciale vede la scheda in sola lettura.

## Censimento (da telefono)

Nel prototipo il telefono è disegnato dentro la pagina. Su un telefono vero occupa tutto lo schermo.

1. Scegli: articolo nuovo, completa uno esistente, oppure solo foto.
2. Scatta la foto (o usa quella di esempio), aggiungi una nota.
3. L'AI propone descrizione, classe, colore e codice, e mostra gli articoli simili per evitare doppioni.
4. Invii in revisione: la scheda arriva al curatore.

## Revisione, Prompt, Import, API

- **Revisione** — le schede proposte, da aprire, correggere e approvare. «Rimanda» le restituisce al censitore.
- **Prompt immagini** — le istruzioni per la foto di presentazione su fondo pulito. Gli standard sono fissi, i personali si modificano.
- **Import** — cosa è arrivato dal file articoli attuale e le anomalie da sistemare: duplicati, descrizioni troppo lunghe, dimensioni illeggibili, coperture da collegare. Cliccando una riga si apre l'articolo.
- **API e MCP** — come gestionale, sito, logistica e assistenti AI leggeranno il catalogo. Escono solo gli articoli pubblicati.

## Cosa è vero e cosa è simulato

- **Vero:** i dati del file, le varianti ricavate dal codice, materiale e colore dal codice, le dimensioni lette dal testo, i colori calcolati dalla foto, il codice proposto per i nuovi articoli.
- **Simulato:** la foto di presentazione, le descrizioni e i temi generati dall'AI, l'accesso aziendale, il salvataggio condiviso.
- **Mancano:** le foto vere (oggi il riquadro mostra il colore dell'articolo).

## Cosa annotare

Mentre provi, annota:

- [ ] Un dato che nella scheda manca, o uno che non serve.
- [ ] Un filtro o una ricerca che useresti e non c'è.
- [ ] Una categoria o una classe che non corrisponde a come lavorate.
- [ ] Un'anomalia dell'Import che sai già come sistemare.
- [ ] Un punto in cui non hai capito cosa fare dopo.
