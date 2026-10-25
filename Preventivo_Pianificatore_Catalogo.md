# Preventivo — Pianificatore Logistica e Catalogo prodotti (Oltre Il Giardino)

**Redatto da:** Ugo Volpato — AI Consultant
**Data:** 25/10/2026
**Cliente:** Oltre Il Giardino S.r.l., Grassobbio (BG)
**Modalità di sviluppo:** assistita da AI (analisi, generazione e codifica con modelli AI), rendicontata a ore

Versione online, commentabile: https://claude.ai/artifact/Jk86kwZcycZxpzh2UfQtAM

## 1. Oggetto e sintesi

Il preventivo copre **due applicazioni separate**, acquistabili e sviluppabili in modo indipendente: **€ 12.635,00 + IVA per entrambe** (207 ore), di cui € 4.000,00 già svolti in analisi e prototipi.

1. **Pianificatore Logistica** — dalle offerte in PDF al piano di uscite, squadre, mezzi e preparazioni di magazzino, con avvisi su conflitti, ZTL, patenti e assenze. **€ 8.805,00** (141 h).
2. **Catalogo prodotti** — anagrafica degli articoli a noleggio: censimento da telefono, foto e descrizioni con AI, curatela via web, dati logistici per il pianificatore. **€ 3.830,00** (66 h).

Uno sviluppo tradizionale, senza AI, costerebbe circa **€ 32.280,00** (−61 % complessivo, −69 % sul solo sviluppo). Con il **nuovo Patent Box** (§7) Oltre Il Giardino può dedurre il 110 % in più dei costi agevolabili: un risparmio fiscale stimato fino a **circa € 3.900**.

Riferimenti: `PRD_Pianificatore_Logistica.md`, `Documento_Tecnico_Sistema.md`, `PRD_Catalogo_Prodotti.md`; prototipi `Prototipo/` e `Prototipo-Catalogo/` ([demo pubblica](https://uvolpato.github.io/OltreIlGiardino/Prototipo/)).

## 2. Tariffe e attività già svolte

| Voce | Tariffa oraria |
| --- | --- |
| Analisi, consulenza e prototipazione | € 80,00 |
| Sviluppo assistito da AI | € 55,00 |
| Sviluppo tradizionale (solo riferimento) | € 70,00 |

**Già svolto** (stima del tempo impiegato, da confermare):

| # | Attività | App | Ore | Importo |
| --- | --- | --- | --- | --- |
| 1 | Analisi del processo attuale (Excel quotidiano, offerte), PRD del pianificatore e documento tecnico | Pianificatore | 8 | € 640,00 |
| 2 | Prototipo navigabile: foglio del giorno, Gantt con zoom e conflitti, ordini e micro-task, risorse con ferie, fermi e scadenze, avvisi, report di magazzino, registro modifiche con annullamento | Pianificatore | 24 | € 1.920,00 |
| 3 | Lettura delle offerte PDF (LlamaExtract, server UE): schema, conversione, revisione dei campi con il PDF e le citazioni a fianco | Pianificatore | 6 | € 480,00 |
| 4 | Dati dimostrativi su 20 giorni, guida d'uso, anonimizzazione delle offerte, pubblicazione della demo | Pianificatore | 4 | € 320,00 |
| 5 | Analisi del file articoli IBED, PRD del catalogo, prototipo e conversione del listino | Catalogo | 8 | € 640,00 |
| | **Subtotale già svolto** | | **50** | **€ 4.000,00** |

## 3. Applicazione 1 — Pianificatore Logistica

Web app (Next.js + NestJS + Prisma + PostgreSQL, lo stack già usato per il Portale B2B Luis) che porta in produzione il prototipo. Ogni calcolo (durate, proposte, avvisi) si esegue sul server. "Ore (AI)" è la stima con sviluppo assistito, "Ore (senza AI)" il riferimento tradizionale.

| # | Attività | Ore (AI) | Ore (senza AI) | Importo (AI) |
| --- | --- | --- | --- | --- |
| 1 | Setup del progetto, database PostgreSQL, pubblicazione con Caddy, ambienti di prova e produzione | 3 | 8 | € 165,00 |
| 2 | Accesso utenti e ruoli (logistica, magazzino, amministrazione), sessioni, sicurezza | 3 | 8 | € 165,00 |
| 3 | Schema dati: ordini, tratte, micro-task, addetti, assenze, mezzi, fermi, scadenze, zone ZTL, articoli logistici | 5 | 14 | € 275,00 |
| 4 | Import delle offerte PDF: lettura con LlamaExtract (UE), revisione dei campi con PDF e citazioni a fianco, creazione dell'ordine | 10 | 26 | € 550,00 |
| 5 | Motore di pianificazione: durate dei micro-task, proposta di squadre e mezzi, regole su ZTL, patenti, assenze, turni e riposi, calcolo degli avvisi | 14 | 36 | € 770,00 |
| 6 | Gantt: per ordine e per risorsa, zoom, trascinamento, conflitti evidenziati | 14 | 36 | € 770,00 |
| 7 | Foglio del giorno e dettaglio ordine e tratta | 8 | 20 | € 440,00 |
| 8 | Anagrafiche addetti e mezzi: disponibilità su timeline, archivio, scadenze dei mezzi | 6 | 16 | € 330,00 |
| 9 | Magazzino: report di preparazione e di rientro per ordine, da stampare ed esportare | 3 | 8 | € 165,00 |
| 10 | Registro modifiche con annullamento a catena e registro eventi | 4 | 10 | € 220,00 |
| 11 | Notifiche: promemoria ZTL e conferme via email | 3 | 8 | € 165,00 |
| 12 | Test automatici, collaudo con dati reali, rifiniture per tablet, messa in produzione | 6 | 16 | € 330,00 |
| | *Subtotale attività* | *79* | *206* | *€ 4.345,00* |
| 13 | **Margine di rischio (25 %)**: formati delle offerte, regole di pianificazione da tarare sui casi reali. Si usa solo se serve, rendicontato a ore | 20 | 52 | € 1.100,00 |
| | **Subtotale da svolgere** | **99** | **258** | **€ 5.445,00** |

## 4. Applicazione 2 — Catalogo prodotti

Applicazione separata, con un proprio database, che riusa l'accesso utenti del pianificatore. Se si sviluppa da sola, prima o senza il pianificatore, si aggiungono 4 ore per setup e accesso (€ 220,00).

| # | Attività | Ore (AI) | Ore (senza AI) | Importo (AI) |
| --- | --- | --- | --- | --- |
| 1 | Setup sulla stessa piattaforma, accesso condiviso, pubblicazione | 2 | 6 | € 110,00 |
| 2 | Schema dati: articoli, varianti, categorie, foto, articoli composti, dati logistici | 4 | 10 | € 220,00 |
| 3 | Migrazione dal file articoli IBED (conversione già prototipata) | 3 | 8 | € 165,00 |
| 4 | Censimento da telefono: foto, codice, misure, anche senza connessione | 8 | 20 | € 440,00 |
| 5 | Elaborazione delle foto con AI (scontorno e sfondo uniforme) | 4 | 10 | € 220,00 |
| 6 | Descrizione e classificazione degli articoli con AI, da confermare dall'operatore | 4 | 10 | € 220,00 |
| 7 | Curatela via web: elenco, scheda articolo, approvazione | 8 | 20 | € 440,00 |
| 8 | Articoli composti (kit) | 3 | 8 | € 165,00 |
| 9 | Collegamento al pianificatore: volume, peso e tempi di carico per articolo | 2 | 5 | € 110,00 |
| 10 | Distribuzione: API REST e server MCP per assistenti AI | 4 | 10 | € 220,00 |
| 11 | Test, collaudo, messa in produzione | 4 | 10 | € 220,00 |
| | *Subtotale attività* | *46* | *117* | *€ 2.530,00* |
| 12 | **Margine di rischio (25 %)**: qualità delle foto e delle descrizioni AI, dati del file IBED. Si usa solo se serve | 12 | 29 | € 660,00 |
| | **Subtotale da svolgere** | **58** | **146** | **€ 3.190,00** |

Non incluse, da fare dopo il catalogo: **gestione del magazzino e impegno degli articoli** (disponibilità per data), **officina** per gli articoli danneggiati. Si quotano a parte.

## 5. Riepilogo economico

| Voce | Pianificatore | Catalogo | Totale |
| --- | --- | --- | --- |
| Già svolto | 42 h · € 3.360,00 | 8 h · € 640,00 | 50 h · € 4.000,00 |
| Da svolgere (margine incluso) | 99 h · € 5.445,00 | 58 h · € 3.190,00 | 157 h · € 8.635,00 |
| **Totale preventivo** | **141 h · € 8.805,00** | **66 h · € 3.830,00** | **207 h · € 12.635,00** |
| Riferimento senza AI | € 21.420,00 | € 10.860,00 | € 32.280,00 |
| Risparmio fiscale Patent Box stimato (§7) | fino a € 2.700 | fino a € 1.200 | fino a € 3.900 |

Senza AI lo sviluppo richiederebbe **404 ore** invece di 157 (circa 2,6 volte): 404 h × € 70,00 = € 28.280,00, contro € 8.635,00 con sviluppo assistito (**−69 %**). Il margine di rischio (32 h, € 1.760,00) si fattura solo se usato. Importi IVA esclusa.

## 6. Valutazione di mercato

I software in abbonamento per il noleggio di attrezzature per eventi costano circa **€ 3.400–3.600 all'anno per 5 utenti**: in cinque anni superano lo sviluppo su misura, senza coprire le regole specifiche di Oltre Il Giardino.

| Soluzione | Come si paga | 5 utenti, 1 anno | 5 anni | Limiti per Oltre Il Giardino |
| --- | --- | --- | --- | --- |
| [Rentman](https://rentman.io/pricing) | € 39/mese di piattaforma + per utente: Crew Pro € 24, Inventory Pro € 19, preventivi € 9 | circa € 3.590 (circa € 3.300 con pagamento annuale) | circa € 16.500–17.900 | non legge le offerte PDF esistenti; niente regole ZTL italiane né micro-task su misura |
| [Current RMS](https://www.current-rms.com/pricing) | € 73/mese il primo utente, € 52 ogni altro | circa € 3.370 | circa € 16.860 | come sopra; interfaccia e assistenza in inglese |
| **Sviluppo su misura (questo preventivo)** | € 12.635 una tantum + hosting (stima € 30/mese) | € 12.635 + € 360 | circa € 14.400, circa € 10.500 al netto del Patent Box | manutenzione evolutiva da quotare; il software è di proprietà di Oltre Il Giardino |

Ipotesi: 5 utenti con accesso completo (logistica, magazzino, amministrazione); prezzi IVA esclusa, rilevati sulle pagine ufficiali il 25/10/2026. Gli abbonamenti includono aggiornamenti e assistenza, lo sviluppo su misura no: per un confronto equo va aggiunto un contratto di manutenzione.

## 7. Aspetti fiscali: il nuovo Patent Box

Il software sviluppato può rientrare nel **nuovo Patent Box** (art. 6 D.L. 146/2021): Oltre Il Giardino deduce, oltre al costo, un **ulteriore 110 %** delle spese di sviluppo, ai fini IRES e IRAP. Su questo preventivo il risparmio d'imposta stimato è **fino a circa € 3.900**, a condizione che il contratto sia impostato come descritto sotto.

**Come si calcola** (aliquote IRES 24 % e IRAP 3,9 %, da verificare con il commercialista):

> risparmio = costo agevolabile × 110 % × (24 % + 3,9 %) ≈ 30,7 % × costo

Su € 12.635 di costi: maggiorazione € 13.899, risparmio circa € 3.880. Il beneficio è pieno solo se c'è reddito imponibile; in caso di perdita la maggiorazione la aumenta e si recupera negli anni successivi (solo IRES).

**Requisiti e cosa ne segue per il contratto** ([circolare 5/E del 24/02/2023](https://www.agenziaentrate.gov.it/portale/documents/20143/4988552/Circolare+nuovo+Patent+Box+24.02.23.pdf/dd915ff5-4358-658a-102d-023a65dfd9a6)):

| Requisito | Cosa prevediamo |
| --- | --- |
| Software tutelato dal diritto d'autore, originale, usato nell'attività d'impresa | Il pianificatore e il catalogo sono scritti su misura e usati direttamente da Oltre Il Giardino |
| Oltre Il Giardino titolare del diritto di sfruttamento economico | Nel contratto, **cessione a Oltre Il Giardino dei diritti d'autore** su codice e documentazione |
| Ricerca commissionata a terzi non del gruppo, residenti in Italia o nell'UE | Sviluppatore residente in Italia, senza legami societari con il cliente |
| Rischio tecnico e finanziario a carico del committente: **niente obbligo di risultato** | Contratto **a ore rendicontate** su attività di sviluppo, non a corpo; gli importi di questo preventivo sono stime |
| Direzione tecnica del committente, con il suo personale | Un referente di Oltre Il Giardino approva priorità, regole e collaudi (riunioni verbalizzate) |
| Costi effettivi, inerenti, ripartiti con criteri oggettivi | Registro ore per attività e per applicazione, fatture separate per Pianificatore e Catalogo |

**Documentazione e scelte da fare con il commercialista:**

- **Opzione** nella dichiarazione dei redditi (Redditi SC, quadro OP): vale 5 anni, è irrevocabile e rinnovabile.
- **Documentazione idonea** (descrizione del software, delle attività e dei costi): non è obbligatoria, ma dichiararne il possesso evita le sanzioni in caso di rettifica. Il registro ore e lo storico delle versioni (GitHub) sono già una buona base.
- **Registrazione del software alla SIAE**: per la maggiorazione ordinaria non serve, basta provare la titolarità anche con autocertificazione ([risposta 223/2025](https://www.edotto.com/articolo/patent-box-2025-chiarimenti-entrate-su-software-e-registrazione-siae)). Serve però per il **meccanismo premiale**, che recupera i costi degli 8 anni precedenti: consigliata per dare data certa ai prototipi già fatti.
- **Credito d'imposta R&S**: si può affiancare, ma non sugli stessi costi; se gli stessi costi hanno già dato il credito, va restituito ([risposta 102/2026](https://www.fiscooggi.it/portale/-/nuovo-patent-box-e-credito-r-s-obblighi-di-restituzione-per-la-pmi)).
- **Ammissibilità delle singole attività**: le parti più innovative (lettura delle offerte con AI, motore di pianificazione, foto e descrizioni con AI) sono le più difendibili come sviluppo sperimentale; le schermate di gestione ordinaria vanno valutate. La stima di € 3.900 è il massimo, con tutte le attività ammesse.

Questa sezione è un orientamento, non una consulenza fiscale: la valutazione finale spetta al commercialista di Oltre Il Giardino.

## 8. Note, esclusioni e condizioni

- **Due applicazioni separate**: database, pubblicazione e fatturazione distinti; si possono avviare in momenti diversi. Il catalogo da solo costa 4 ore in più (setup e accesso).
- **Fatturazione a ore** sulle attività effettivamente svolte, con rendiconto mensile: gli importi sono stime, il margine di rischio si usa solo se serve. È anche la forma richiesta dal Patent Box (§7).
- **Proprietà**: codice, documentazione e diritti d'autore passano a Oltre Il Giardino al pagamento.
- **Costi ricorrenti esclusi**: server (stima € 30/mese), lettura delle offerte con LlamaExtract (a pagina), elaborazione di foto e testi con AI (a consumo). Si stimano dopo la prova sui volumi reali.
- **Esclusi**: gestione del magazzino con impegno degli articoli, officina per gli articoli danneggiati, integrazione con erpCUBE e con la fatturazione, invio WhatsApp reale, manutenzione evolutiva dopo il collaudo. Si quotano a parte.
- **Dati**: le offerte e il listino reali restano fuori dal repository pubblico; la demo usa versioni anonimizzate.
- Le ore "già svolte" sono una stima del tempo impiegato, da confermare.
- Il costo ridotto riflette la velocizzazione data dall'AI, non una riduzione di qualità o di garanzie.
- Tariffe indicative, **IVA esclusa**.
