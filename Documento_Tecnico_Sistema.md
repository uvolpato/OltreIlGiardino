# Documento Tecnico — Pianificatore Logistica Eventi

> Documento di consolidamento dell'analisi e delle decisioni architetturali.
> Controparte di prodotto: `PRD_Pianificatore_Logistica.md`.
> Stato: work-in-progress (0.1). Aggiornato al 2026-10-26.

---

## 0. Aggiornamento 26/10/2026 (prototipo)

- **Mezzi**: nuovi campi `fermi` (periodi con tipo: manutenzione, revisione, tagliando, guasto, noleggiato a terzi) e `scadenze`. Lo stato non è più un campo: si calcola (`fermo(m, s, e)` per un intervallo, `statoMezzi()` per oggi). Nel modello dati di produzione: tabella `fermi_mezzo` (mezzo, tipo, inizio, fine) e `scadenze_mezzo`, nessuna colonna `stato`.
- **Assenze e fermi** hanno lo stesso formato (giorni interi o ore) e lo stesso editor; per gli addetti vale la stessa regola: la disponibilità si calcola dai periodi.
- **Registro modifiche**: ogni modifica al piano salva la copia degli ordini toccati prima della modifica; annullare ripristina quelle copie e annulla a catena le modifiche successive sugli stessi ordini. In produzione: tabella eventi con utente, ordine, prima/dopo (delta per campo) e annullamento come evento.
- **Magazzino**: report di preparazione (carichi del giorno dopo) e di rientro per ordine, con persone schedulate sul task; quantità dall'offerta, senza impegno degli articoli (che arriva dopo il catalogo).
- **Suite**: il catalogo prodotti è un'app separata (database proprio) con gli stessi componenti; `Catalogo/build.py` li copia dal prototipo Logistica.
- **Dati pubblicabili**: offerte anonimizzate (`Estrazione/anonimizza.py`) e listino senza fornitori e prezzi (`Catalogo/pubblica.py`) per la demo su GitHub Pages.

## 0bis. Aggiornamento 25/10/2026 (prototipo)

Modifiche al prototipo `Prototipo/index.html` rilevanti per il data model e l'architettura:

- **Addetti** (§4.1): `ruolo` singolo → `ruoli` multipli; patenti e certificazioni selezionate da tabelle di lookup. I ruoli guidano l'assegnazione (`RUOLO_TASK` + `adatto()`), le patenti restano il requisito per la guida.
- **Assenze/ferie/permessi**: modello unificato in `assenze` con durata intera (`{tipo, intera:true, da, a}`) o parziale a ore (`{tipo, intera:false, giorno, dalle, alle}`). `assenza()` gestisce l'overlap orario per le parziali; gestione da CRUD addetto e da "Per risorsa".
- **Articoli** (§4.3): nel prototipo esiste ora un'anagrafica separata con `codice` come chiave (futura FK). Le righe d'ordine senza codice presente non vengono inserite ("Da censire").
- **Lookup**: tabelle di Ruoli, Patenti, Certificazioni, Stati mezzi modificabili nella vista Risorse.
- **UI**: maschere di dettaglio come modale centrata con etichette di ambito; sistema di tooltip contestuali (`UI.hint` + registro `AIUTI`).
- **Componente timeline riusabile**: `timeline(R, {corner, body, zoom})` (scala + corsie) con `scaleHtml`/`mesiHtml`/`celle` parametrizzate; barra dei mesi con etichetta sticky per mese. Usata dalla Pianificazione e dal mini-gantt assenze nel CRUD.
- Documentazione delle maschere/flusso: `Documentazione_UI.md`.

---

## 1. Contesto e obiettivo

"Oltre Il Giardino" noleggia arredi per eventi. Oggi la pianificazione logistica (chi, che mezzo, dove, quando) è fatta **a mano**, giorno per giorno, su fogli Excel/PDF.

Obiettivo: costruire da zero un **pianificatore** che:

1. carica i **PDF delle offerte**,
2. estrae i dati,
3. **posiziona l'evento sulla timeline**,
4. lo **spezza in micro-task**,
5. **stima i tempi/effort** in funzione della quantità di materiale,
6. **seleziona addetti e mezzi**,
7. mostra tutto come **Gantt** (evento → sotto-eventi) con **avvisi** su sovrapposizioni e vincoli di accesso.

---

## 2. Come si lavora oggi (AS-IS)

- **Input:** un PDF di offerta per ordine (es. `Offerta_...Golosario...pdf`). Contiene: numero offerta, referente commerciale, cliente, date consegna/ritiro, luogo, orari, tabella articoli (pos, descrizione, quantità), totali, note.
- **Output:** un foglio Excel/PDF **per giorno** (es. `10. OTTOBRE 2026.xlsx`: 31 fogli), con la tabella `RESP. OFFERTA | NR OFFERTA | CLIENTE | PERSONE INCARICATE | FURGONE | ORA PARTENZA | ORA DI ARRIVO | LOCATION | REFERENTE | COSA | COSTO TRASPORTATORE | NOTA` + blocchi `PERSONALE/ASSENTI` e `IN MAGAZZINO/RITIRANO LORO`.
- **Problemi osservati:** dati sparsi nei PDF, ricopiatura manuale, orari ambigui ("A SEGUIRE", "//"), colonne disallineate, refusi (DOUGLAS/DOUGLASS, LASSANA/LASSANE), **nessun dato di volume/peso per ordine**, sovrapposizioni scoperte solo a posteriori, nessuna verifica ZTL/permessi.

---

## 3. Obiettivo di processo (TO-BE)

```
PDF offerta ─▶ Estrazione (LLM europeo) ─▶ Ordine JSON
                                              │
        ┌─────────────────────────────────────┼────────────────────────────┐
        ▼                                     ▼                            ▼
  Anagrafiche                         Posizionamento timeline        Motore regole ZTL
  (addetti, mezzi,                    + generazione micro-task        (scoperta + geo-check)
   articoli, micro-task, zone)                 │                            │
        └─────────────────────────────────────┴────────────────────────────┘
                                              ▼
                    Stima effort (tempi carico/viaggio/allestimento)
                                              ▼
                    Selezione addetti & mezzi (CP-SAT, locale)
                                              ▼
                    Gantt UI (evento + sotto-eventi; vista risorsa)
                                              ▼
                    Avvisi: sovrapposizioni, vincoli, permessi
```

Regola di fondo: **l'unica cosa che non va mai scritta a mano a runtime è il vincolo per il solver** — nasce da formule, anagrafiche e regole.

---

## 4. Entità e anagrafiche (data model)

### 4.1 Addetti

| Campo | Note |
|---|---|
| nome, ruolo | magazziniere / montatore / autista / capo squadra |
| **patenti** | `semplice` (nessuna) · `B` · `C` · `CE` (patenti speciali) — un addetto può averne 0..N |
| abilitazioni | muletto/carrello (opzionale) |
| disponibilità | orario di lavoro, ferie, assenze, riposi |

### 4.2 Mezzi — come censirlo per il **carico autonomo**

Il mezzo va censito così che il sistema possa decidere da solo se un carico "ci sta" e chi può guidarlo:

| Gruppo | Campi | A cosa serve |
|---|---|---|
| identità | nome, targa, tipo (furgone, sponda, ducato, iveco, bilico, motrice, auto) | riconoscimento |
| **capacità** | volume utile (m³), portata (kg), dimensioni pianale L×W×H, n. bancali | **"ci sta il carico?"** |
| requisiti | patente richiesta, n. autisti | **"chi può guidarlo?"** |
| circolazione | classe Euro, massa totale, lunghezza | **vincoli ZTL/permessi** |
| origine | **interno vs corriere esterno** (se corriere: lead time + costo) | lead time di pianificazione |
| stato | libero / occupato / manutenzione | disponibilità sulla timeline |

### 4.3 Articoli (collega "quantità" → volume) 🔶 *non esiste ancora, da costruire*

| Campo | Note |
|---|---|
| codice | il `pos` dell'offerta |
| descrizione, categoria | come da offerta |
| **volume unitario (m³)**, **peso unitario (kg)** | da DDT fornitore / catalogo magazzino |
| ingombro/dimensioni, impilabile | per calcolo volume effettivo |
| **tempo carico/scarico unitario** | per la stima dei tempi |

`volume_ordine = Σ (qta × volume unitario)` — è il dato che oggi manca e che blocca la scelta di mezzo e squadra.

### 4.4 Micro-task (catalogo tipi) — SÌ, serve

| Tipo | Formula di durata |
|---|---|
| CARICO (magazzino) | f(volume totale, tempo unitario per categoria) |
| VIAGGIO | f(distanza, mezzo) |
| CONSEGNA/SCARICO | f(quantità) |
| ALLESTIMENTO | f(quantità, complessità categoria) |
| DISALLESTIMENTO | f(quantità) |
| RITIRO | f(quantità) |
| RIENTRO A MAGAZZINO | f(viaggio) — segna "merce torna disponibile" |

Ogni tipo ha: risorse coinvolte, dipendenze (allestimento dopo consegna; ritiro dopo fine evento).

### 4.5 Zone / vincoli accesso (ZTL, permessi)

| Campo | Note |
|---|---|
| nome | Area C, Area B, Cerchia dei Bastioni, Zona Isola, Quadrilatero della Moda, (Bergamo) |
| poligono | confini in coordinate (per geo-check) |
| fascia oraria attiva | es. 07:30–19:30 feriali |
| mezzi vietati | per classe Euro / massa / lunghezza |
| permesso richiesto | sosta, carico/scarico, accesso |

---

## 5. Ingest PDF offerte

### 5.1 Pipeline

1. Caricamento PDF.
2. Estrazione con **LlamaParse / LLM** (region EU) usando un **JSON schema**.
3. Revisione umana dei campi estratti (sopra soglia di confidence = automatico, sotto = verifica).

### 5.2 Principi del prompt "blindato"

- Output = **solo JSON valido**, niente testo.
- Campi mancanti/illeggibili → vuoti o assenti, **mai inventati**.
- Normalizzazione: date → ISO `AAAA-MM-GG`, orari → `HH:MM`, numeri → punto decimale, senza simboli.
- Tabella articoli: ignorare intestazioni ripetute; righe `Alt.` → `alternative: true`.
- Categorie = titoli di sezione (ARREDI, BANCONI…).
- Fonti + confidence obbligatorie dove rilevante.

> Lo schema JSON completo e il prompt sono già definiti e validati (vedi cronologia).

### 5.3 Validazione (caso reale: offerta Golosario)

- **Funziona bene:** numero/revisione, cliente, referente commerciale ("Chiara"), referente in loco, date consegna/ritiro, luogo, orari, evento, articoli (pos/descrizione/qta/dimensioni/categoria), totali, note operative (incl. "permessi a carico cliente").
- **Da correggere (fatto):** il testo del contratto (Art. 1–12) finiva dentro `note` → escluso con la `description` del campo.
- **Limite noto:** la colonna prezzi (`Nol./Sc/Sup/Noleg Netto`) si disallinea nell'estrazione a testo puro → per i prezzi serve un parser tabellare, non rilevante per la pianificazione.

---

## 6. Posizionamento timeline + micro-task

- Da `data_consegna`/`data_ritiro`/orari → l'evento occupa un intervallo sulla timeline.
- Il catalogo micro-task genera i sotto-eventi nell'ordine logico (carico → viaggio → consegna → allestimento → … → rientro a magazzino).
- Task senza orario ("A SEGUIRE") → concatenati al task precedente; se non stimabile, durata default.

---

## 7. Stima effort

| Grandezza | Formula |
|---|---|
| tempo_carico | f(volume totale, tempo unitario categoria) |
| tempo_viaggio | f(distanza, mezzo) — fonte: routing API |
| tempo_allestimento/disallestimento | f(quantità, complessità categoria) |
| persone per task | f(volume, tipo allestimento, location) 🔶 da tarare |
| mezzo | `argmin{ m : capacità ≥ volume ∧ patente compatibile }` |

---

## 8. Selezione risorse — CP-SAT

### 8.1 Cosa è

**CP-SAT** = solver di ottimizzazione di Google, dentro la libreria open-source **OR-Tools**. **Locale**: si installa e gira sul proprio PC/server, gratis, nessun cloud, nessun invio dati. CP = Constraint Programming, SAT = Satisfiability.

### 8.2 Non si "interroga" con un linguaggio

È una libreria: si scrive un programma che costruisce un **modello** (variabili → vincoli → obiettivo) e poi `Solve()`. Il "formato" che conta per il progetto è **dati strutturati in → assegnazioni fuori** (un wrapper traduce i dati nostri nel modello CP-SAT).

**Input (esempio):**

```json
{
  "task": [
    { "id": 1, "evento": "2026-31", "tipo": "VIAGGIO",
      "inizio": "2026-10-29 07:00", "fine": "2026-10-29 09:00",
      "patente": "C", "volume": 80, "opersone": 2 }
  ],
  "addetti": [
    { "nome": "Luigi", "patenti": ["C","CE"], "disponibile": ["07:00 → 17:00"] }
  ],
  "mezzi": [
    { "nome": "Iveco Grande", "volume": 90, "portata": 5000, "patente": "C" }
  ]
}
```

**Output:** `{ "assegnazioni": [ { "task": 1, "addetti": [...], "mezzo": "..." } ] }`

### 8.3 Vincoli

- **Hard:** non-sovrapposizione, patente, capacità mezzo, disponibilità (assenze/riposi), mezzo non già assegnato.
- **Soft:** bilanciamento carichi, minimo spostamento.
- **Time windows (nativo):** ogni task ha `[inizio, fine]` in minuti interi.

### 8.4 ZTL come vincolo orario

| Vincolo | CP-SAT |
|---|---|
| arrivare **entro e non oltre** le 14:00 | `arrivo ≤ 14:00` |
| **uscire entro** le X | `fine ≤ X` |
| **non prima** delle 17:00 | `inizio ≥ 17:00` |
| ZTL attiva 7:30–19:30 (mezzo non ammesso) | `fine ≤ 7:30  OR  inizio ≥ 19:30` |

### 8.5 Pianificazione incrementale

Il solver ragiona su un **orizzonte** (es. 2–4 settimane), non evento per evento. Flusso:

- si carica un **batch** di ordini confermati;
- si risolve l'orizzonte;
- i task **già confermati vengono congelati** (variabili fissate);
- all'arrivo di nuovi ordini **si ri-risolve** (per i volumi del progetto: pochi secondi).

Non serve "inserire tutto il mese e poi pianificare": si tiene il piano d'orizzonte e lo si riaggiusta.

### 8.6 Nota

CP-SAT **applica** i vincoli, non li *conosce*. La conoscenza della ZTL sta nel DB regole; il motore regole genera il vincolo, CP-SAT lo rispetta.

---

## 9. Criticità di percorso (ZTL, blocchi, permessi)

### 9.1 Due ruoli da tenere separati

| | Chi | Affidabilità |
|---|---|---|
| **Scoperta** (quali zone/permessi esistono lungo il corridoio) | LLM + web search | buona per regole stabili, debole per chiusure temporanee |
| **Precisione** (questo preciso percorso le attraversa a quest'ora?) | **geo-check deterministico** (punto/linea in poligono + sovrapposizione oraria) | alta |

### 9.2 Il percorso NON è un elenco di vie e l'LLM non lo "legge"

- L'API di routing restituisce una **polilinea** (lista di coordinate lat/lon), non nomi di strade.
- La ZTL è un **poligono** in coordinate + regole.
- Il controllo è **intersezione geometrica** (`polilinea ∩ poligono`) + **sovrapposizione oraria** (`finestra di passaggio ∩ fascia attiva`). È matematica, non lettura.

### 9.3 Pipeline "discovery criticità" (LLM + web)

| # | Passo | Risultato |
|---|---|---|
| 1 | Routing API | polilinea + durata |
| 2 | Reverse-geocoding del corridoio | **testo cercabile**: comuni/vie/quartieri attraversati |
| 3 | Agente LLM + web search (prompt blindato) | lista strutturata di vincoli con **fonte + confidence** |
| 4 | Salvataggio | cache nel DB regole |

**Output del passo 3:**

```json
{ "vincoli": [ { "tipo": "ZTL", "zona": "Area C Milano",
  "attiva": "07:30–19:30", "mezzi_vietati": ["Euro 3","Euro 4"],
  "permesso": "pass Area C", "fonte": "https://...", "confidence": "alta" } ] }
```

### 9.4 Limiti da accettare

- **ZTL stabili** (Area C, Isola, Quadrilatero): poche e ben documentate → si cercano **una volta**, si mettono in cache, poi diventa lookup.
- **Chiusure/lavori temporanei**: mutevoli e mal indicizzate → la web search è **debole**; meglio una **routing API con traffico live** (HERE/TomTom/Google) che già codifica alcune restrizioni.

---

## 10. Ruolo dell'LLM — dove sì, dove no

| Uso | Giudizio |
|---|---|
| **Estrarre** i PDF (LlamaParse/LLM) | ✅ |
| **Normalizzare** nomi/entità, quantità dalle note | ✅ |
| **Scoprire/spiegare** criticità (ZTL, permessi) con web search | ✅ (scoperta, con fonte+confidence) |
| **Filtri di retrieval** ("chi è libero giovedì?") — traducendo la domanda in query | ✅ |
| **Assistente conversazionale** sullo stato del piano | ✅ |
| **Ottimizzazione/assegnazione** (decidere chi/che mezzo/che orari) | ❌ usar e CP-SAT |
| **Fonte di verità delle norme ZTL** | ❌ (DB regole; l'LLM interpreta, non genera) |

**GDPR / AI Act:**
- AI Act: caso d'uso a rischio basso/minimo; gli oneri maggiori sono sui *provider* dei modelli.
- GDPR: il tema è **dove girano i dati** (dipendenti/clienti). LlamaCloud **region EU** risolve la residenza; se in futuro si attaccasse un LLM US via API, quella chiamata sarebbe un flusso a parte.

---

## 11. Software esistenti / riferimenti (cosa copiare/confrontare)

| Categoria | Esempi | Copre | Non copre |
|---|---|---|---|
| Gantt/PM | MS Project, Smartsheet, TeamGantt | timeline, task | debole su risorse/mezzi |
| Resource scheduling | Float, Resource Guru, Dusk IMS, Lasso | sovrapposizione persone | mezzi, ZTL, volume |
| Field service | Jobber, Simpro, Skedulo | job→tecnico→veicolo | ZTL, allestimenti multi-giorno |
| TMS/routing | Onfleet, OptimoRoute, ORTEC | routing+finerose | personale/eventi |

Nessun off-the-shelf combina *offerte PDF → volume → micro-task → assegnazione → ZTL*: è il motivo per costruire da zero.

---

## 12. Esempio end-to-end (traccia)

Scenario: ordine Golosario, consegna+allestimento a Rho Fieramilano, evento 21:00, viaggio ~3h, percorso attraversa zona con ZTL 12:00–24:00, allestimento 30 min.

| # | Passo | Chiama | Risultato atteso |
|---|---|---|---|
| 1 | Ingest PDF | LlamaParse/LLM | `ordine.json` (location, articoli, orari, evento 21:00) |
| 2 | Geocoding | API geocoding | lat/lon della location |
| 3 | Routing | API routing | durata 3h + polilinea |
| 4 | Check ZTL | DB regole + geo-check | percorso ∩ Area C, attiva 12–24, mezzo non ammesso → vincolo |
| 5 | Micro-task | catalogo + mapper | CARICO, VIAGGIO, ALLESTIMENTO(30min) con dipendenze |
| 6 | Effort | mapper su anagrafiche | durate, persone, mezzi candidati |
| 7 | Ottimizzazione | **CP-SAT** | vincolo "arrivo entro 20:30" + "passaggio fuori da 12–24" → **anticipa la partenza prima delle 12** |
| 8 | Output | Gantt + avvisi | piano + nota "viaggio anticipato per ZTL" |

---

## 13. Decisioni aperte, rischi, next step

### Aperte
- Esiste già un catalogo articoli con volume/peso, o va creato da DDT?
- Fonte del tempo di viaggio (routing API vs media manuale) e quale API.
- Numero di utenti simultanei (una o più postazioni).
- Produzione: cloud EU vs on-premise locale.
- Tipi esatti di micro-task e formule di durata (da tarare col magazzino).
- Il foglio giornaliero generato deve mantenere il layout attuale o si accetta il Gantt?
- Zone da censire effettivamente (solo Milano+Bergamo o altre).

### Rischi principali
- **Catalogo volume mancante** → assegnazione automatica non affidabile → mitig: fase 1 "proposta + conferma umana".
- **Qualità estrazione** (prezzi, righe Alt.) → mitig: revisione umana + avvisi.
- **Regole ZTL obsolete** → mitig: DB versionato con fonte; avvisi con confidence, mai blocco.
- **Adozione** → mitig: l'output deve *sostituire* il foglio quotidiano, non aggiungere passaggi.

### Next step
1. Raccogliere **volume/peso per articolo** (anagrafica articoli).
2. Tarare **formule di effort** (carico/viaggio/allestimento) col magazzino.
3. Verificare con l'operatore il comportamento del prompt di estrazione su più offerte.

---

## 14. Glossario

- **CP-SAT**: solver di ottimizzazione vincolata (OR-Tools, Google), locale.
- **Polilinea**: rappresentazione di un percorso come sequenza di coordinate lat/lon.
- **Poligono**: confine geografico di una zona (ZTL) come lista di coordinate.
- **Geo-check**: test geometrico "il percorso interseca la zona?" + test temporale.
- **ZTL**: zona a traffico limitato.
- **RAG / agente con grounding**: pattern in cui l'LLM cerca su fonti esterne e cita.
- **Effort**: tempo e risorse (persone/mezzo) richiesti da un micro-task.
- **Orizzonte**: finestra temporale (es. 2–4 settimane) su cui il solver ragiona.
- **Freeze/congelamento**: fissare un task già confermato così che il solver non lo modifichi.

---

*Fine documento*