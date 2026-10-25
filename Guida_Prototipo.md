# Guida al prototipo — Pianificatore Logistica

25/10/2026 · Ugo Volpato

## Prima di iniziare

Il prototipo mostra come Oltre Il Giardino pianificherà uscite, squadre, mezzi e preparazioni di magazzino a partire dalle offerte. Tutti i dati sono di esempio: nulla viene salvato, e ricaricando la pagina si torna allo stato iniziale.

- **Come aprirlo:** apri il file `Prototipo/index.html` in Chrome o Edge. Non serve installare niente.
- **Il giorno di "oggi":** il prototipo finge che oggi sia **martedì 20 ottobre 2026**. Le viste si aprono su quella data, e la linea rossa nei Gantt la indica.
- **Periodo dei dati:** ci sono ordini dimostrativi per i 20 giorni da martedì 20 ottobre a domenica 8 novembre 2026, preparati in modo che compaia ogni situazione da controllare (vedi la sezione "Casi dimostrativi").
- **Il pulsante ? accanto a ogni titolo** spiega a cosa serve la vista o il riquadro.

## Percorso consigliato

Segui le viste in quest'ordine, la prima volta: ognuna usa ciò che hai visto nella precedente. Calcola circa 30 minuti.

1. **Foglio del giorno** (5 min) — la schermata che sostituisce l'Excel quotidiano. Guarda martedì 20 ottobre: è il giorno più pieno, con 14 uscite e 7 carichi.
2. **Pianificazione** (10 min) — il Gantt di tutti gli ordini, con i conflitti in rosso. Qui si vede il piano su più giorni.
3. **Ordini** (3 min) — l'elenco delle offerte; cliccane una per aprire il dettaglio con i micro-task.
4. **Risorse** (5 min) — addetti e mezzi, con ferie, fermi e scadenze.
5. **Magazzino** (5 min) — i report da stampare: cosa preparare e cosa deve rientrare.
6. **Notifiche & ore** (2 min) — gli alert da inviare e il confronto tra ore pianificate ed effettive.

Le frecce ‹ › in alto cambiano giorno (o settimana, in Pianificazione); «Oggi» torna al 20 ottobre.

## Pianificazione

Il Gantt mostra ogni ordine scomposto in micro-task (carico, viaggio, consegna, allestimento, ritiro, rientro), ciascuno con persone e mezzo. Cosa guardare:

- **Per ordine / Per risorsa** — per ordine vedi le fasi di ogni evento; per risorsa vedi la giornata di ogni addetto e mezzo, con ferie e fermi come fasce grigie tratteggiate.
- **Giorno / Settimana / Mese e zoom** — i pulsanti − e + (oppure Ctrl + rotella) ingrandiscono attorno al cursore; «Adatta» riporta tutto nello schermo. Il nome del mese resta sempre visibile nella barra colorata in alto.
- **Barre che pulsano in rosso** — un conflitto: stessa persona su due incarichi, mezzo fermo, patente mancante, persona in ferie.
- **Pannello Avvisi a destra** — l'elenco dei problemi del periodo, dal più grave. Ogni avviso dice cosa fare; cliccandolo si apre il task interessato.
- **Trascinare una barra** — in vista Per risorsa, trascinarla su un'altra riga riassegna la tratta; gli avvisi si ricalcolano subito.
- **Tenere premuto Spazio** e trascinare sposta la vista, come in un'app di grafica.

### Salvare e tornare indietro

Nel piano non c'è un pulsante Salva: **ogni modifica si applica appena cambi un campo**. Gantt e avvisi si ricalcolano subito, e un messaggio in basso a destra conferma la modifica e dice se ha creato o risolto dei conflitti. «Chiudi» nella scheda dell'ordine non annulla nulla.

- **Puntino bianco su una barra** = task modificato a mano rispetto alla proposta. **Pallino arancione** nella sequenza dell'ordine = task in conflitto.
- **Ctrl+Z** annulla l'ultima modifica al piano.
- **Registro modifiche** (icona con l'orologio in alto, oppure il pulsante nella scheda dell'ordine) elenca tutte le modifiche della sessione, dalla più recente, con ora e ordini toccati. «Annulla» su una voce la toglie.
- Annullando una modifica si annullano anche **tutte le successive sugli stessi ordini**, perché si basavano su di lei; prima di farlo il prototipo chiede conferma e le elenca. Le modifiche su altri ordini restano.
- Le voci annullate restano nel registro barrate, per traccia.
- «Ripristina proposta» riporta un ordine (o una tratta) alla proposta del sistema; anche questo finisce nel registro e si può annullare.

Ricaricando la pagina si perdono modifiche e registro: è un prototipo. Ferie, fermi e anagrafiche si salvano con il pulsante Salva delle loro schede e non passano dal registro.

## Risorse: addetti e mezzi

In Risorse, il pulsante «Modifica» su un addetto o un mezzo apre una scheda a schede, sempre della stessa dimensione.

**Addetto** — schede Anagrafica, Competenze, Disponibilità, Archivio.

- **Disponibilità** mostra il mese: la prima riga è l'addetto, sotto tutti i colleghi assenti nel mese. Trascinando sui giorni della prima riga si crea una ferie.
- Sotto, le assenze in programma: tipo, giorni interi o ore, durata. Un avviso segnala chi altro è assente negli stessi giorni.
- Non si salva con date incoerenti (fine prima dell'inizio) o assenze che si sovrappongono.
- **Archivio** raccoglie le assenze già concluse.
- Da provare: **Paolo Riva** (riposo il 22/10, con Giulia Marchetti in ferie), **Marco Bianchi** (ferie 2–6/11), **Luigi Rossi** (ferie di settembre in Archivio).

**Mezzo** — schede Dati, Scadenze, Disponibilità, Archivio.

- **Scadenze**: revisione, assicurazione, bollo, tagliando. Arancione entro 30 giorni, rosso se scaduta; le stesse etichette compaiono nell'elenco mezzi.
- **Disponibilità**: i fermi (manutenzione, revisione, tagliando, guasto, noleggio a terzi). Sotto il mezzo compaiono i mezzi dello stesso tipo fermi nel mese, e ogni fermo indica i sostituti liberi.
- Lo stato Libero/Fermo non si imposta più a mano: si calcola dai fermi, giorno per giorno.
- Da provare: **Furgone isotermico** (assicurazione scaduta, tagliando il 27/10), **Iveco 75 centinato** (revisione tra 16 giorni), **Motrice + semirimorchio** (manutenzione 12–30/10), **Ducato 1** (revisione il 3/11).

## Magazzino: i report da stampare

La vista Magazzino produce due report cartacei per il giorno scelto con le frecce in alto, **una scheda per ordine**. «Stampa» stampa solo le schede, senza menu e riquadri; «Esporta CSV» dà le stesse righe in un file.

- **Da preparare** — gli ordini il cui carico inizia il giorno dopo, così la scheda si stampa la sera prima. Per ognuno: orario del carico e della partenza, **le persone schedulate sul carico**, il mezzo, la location (con la ZTL se c'è), e l'elenco articoli con quantità e due caselle da spuntare a penna, Preparato e Caricato.
- **Rientri attesi** — gli ordini che rientrano in magazzino quel giorno (dall'evento o riconsegnati dal cliente). Per ognuno: le persone schedulate sul rientro e gli articoli attesi, con tre colonne vuote da compilare: Rientrati, Danneggiati, Mancanti.
- In fondo a ogni scheda ci sono una riga per le note e una per la firma.
- Se manca la persona o il mezzo, la scheda lo scrive in rosso («da assegnare»): va sistemato in Pianificazione prima di stampare.
- Giorni utili da provare: **19/10** (7 preparazioni per la giornata piena del 20), **28/10** (prepara il ritiro del cliente e la fiera di Verona del 29), **03/11** (2 preparazioni per il 4), **04/11** (2 rientri), **05/11** (prepara anche l'ordine del 6 ancora senza persone).

Le quantità dei report sono quelle dell'offerta: non c'è ancora una verifica della disponibilità in magazzino (vedi l'ultima sezione).

## Casi dimostrativi

Ogni riga è una situazione preparata apposta nei dati. Vai alla data in Pianificazione o nel Foglio del giorno e controlla che il prototipo la segnali come ti aspetti.

| Data | Ordine | Situazione | Cosa dovresti vedere |
| --- | --- | --- | --- |
| 20/10 | 2026-2057, 2026-1649 | Stessa persona su due incarichi | Avviso rosso «Luigi Rossi è su due incarichi contemporanei» |
| 20/10 | vari | Mezzo senza autista abilitato | Avviso rosso sulla patente per lo Sprinter sponda |
| 20/10 | vari | Giornata piena | 14 uscite e 7 carichi nel Foglio del giorno; giornate oltre 10 h |
| 20/10 | 2026-1918 e altri | Location in ZTL | Avviso «richiedi il permesso» e alert ZTL in Notifiche |
| 22/10 | 2026-2214 | Addetta in ferie assegnata | Avviso rosso su Giulia Marchetti |
| 25/10 | 2026-2230 | Domenica e sera tardi | Avvisi «giorno festivo» e «lavoro notturno» |
| 27/10 | 2026-2241 | Ordine senza proposta | Tratte senza squadra e senza mezzo |
| 29/10 | 2026-2250 | Il cliente ritira da noi | Solo preparazione e riconsegna, nessun viaggio |
| 29/10 | 2026-2268 | Mezzo in manutenzione assegnato | Avviso rosso «Motrice è fermo: manutenzione», e nessuno ha la patente CE |
| 29/10 | Omar Diallo | Malattia 29–31/10 | Non viene proposto; fascia grigia in Per risorsa |
| 30/10 | 2026-2255 | Fiera fuori zona (Verona, 130 km) | Partenza all'alba, giornate lunghe |
| 31/10–01/11 | 2026-2260 | Matrimonio nel weekend | Festivo e smontaggio a notte |
| 02/11 | 2026-2271 | Articolo non in anagrafica (XX-99) | Avviso «Articoli da censire»; nel report compare in rosso |
| 03/11 | Ducato 1 | Revisione di un giorno | Ducato 1 non proposto quel giorno |
| 04/11 | 2026-2275 | Mezzo da 12 t in Città Alta | Avviso «Iveco 75 centinato non ammesso in Città Alta» |
| 04/11 | 2026-2280 | Addetto in ferie assegnato | Avviso rosso su Marco Bianchi |
| 04/11 | 2026-2284 | Permesso di poche ore | Avviso rosso su Elena Greco (permesso 14–18) |
| 06/11 | 2026-2301 | Ordine arrivato all'ultimo | Tutto da assegnare; nel report Magazzino «da assegnare» in rosso |
| 07–08/11 | 2026-2296 | Quadrilatero della Moda, domenica | Permesso ZTL, festivo, notturno |

## Non ancora gestito, e cosa segnalarci

Tre parti sono rimandate di proposito:

- **Catalogo prodotti** — va fatto per primo: oggi gli articoli hanno solo volume, peso e tempi di carico, non le quantità possedute.
- **Impegno degli articoli e disponibilità** — verrà dopo il catalogo, con la gestione del magazzino: dirà se un ordine chiede più pezzi di quelli liberi in quelle date.
- **Officina** — servirà per la manutenzione e la sistemazione degli articoli noleggiati che rientrano danneggiati. Per ora i danni si annotano a penna nel report dei rientri.

Mentre provi, annota per ogni vista:

- [ ] Un avviso che manca, o uno che compare senza motivo.
- [ ] Una durata stimata che non torna con l'esperienza (carico, viaggio, allestimento).
- [ ] Un dato che nel report di magazzino manca o è di troppo.
- [ ] Un punto in cui non hai capito cosa fare dopo.

Versione online, commentabile: https://claude.ai/artifact/Ayx4gHoP4EUhAeDTg1evnU
