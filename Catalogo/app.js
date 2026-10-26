/* ============================================================
   OLTRE IL GIARDINO · CATALOGO — prototipo dell'anagrafica articoli (stessa suite della Logistica)
   Componenti (UI, datatable, filtri, conferme, toast, ?) arrivano dalla Logistica tramite build.py.
   Dati: file articoli (2.194 articoli) convertito da Catalogo/converti.py.
   AI simulata: Nano Banana (foto di presentazione) e LLM (descrizione, temi) sono imitati nel browser;
   i colori della foto invece sono calcolati davvero (k-means sui pixel).
   Le modifiche restano solo in questo browser (localStorage).
   ============================================================ */
const pad=n=>String(n).padStart(2,"0");
const num=(n,d=1)=>(+n).toLocaleString("it-IT",{maximumFractionDigits:d});
const GG=["dom","lun","mar","mer","gio","ven","sab"], dm=d=>pad(d.getDate())+"/"+pad(d.getMonth()+1), hm=d=>pad(d.getHours())+":"+pad(d.getMinutes());
const oggi=()=>{const d=new Date(); return `${dm(d)}/${d.getFullYear()} ${hm(d)}`;};
Object.assign(ICON,{cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',check:'<path d="m5 12 4 4 10-10"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  upload:'<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/>',api:'<path d="M8 6 3 12l5 6M16 6l5 6-5 6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',text:'<path d="M4 6h16M4 12h10M4 18h7"/>'});

/* ---------- tabelle ---------- */
const CAT=window.CAT||{articoli:[],colori:{},colfam:{},materiali:{},matfam:{},classi:[],anomalie:{}};
const RGB={"00":"#e9eef0","01":"#ffffff","02":"#fffff0","03":"#fdf3d0","04":"#e6f2f5","05":"#faf3e0","10":"#f2d43c","11":"#d4a017","12":"#bfd641","13":"#dfff00","14":"#cc7722","15":"#ffbf00",
 "20":"#f28c28","21":"#fa8072","22":"#f5a04a","23":"#9a463d","30":"#c62828","31":"#c41e3a","32":"#6d071a","33":"#ff7f50","40":"#7b3fa0","41":"#c8a2c8","42":"#e0218a","43":"#f4a6c0","44":"#e8c4c4","45":"#f7d6dc","46":"#a99bd8",
 "50":"#1c2541","52":"#1f4e9c","53":"#30b5b0","54":"#7ec8e3","55":"#7fd1c1","60":"#2e8b3e","61":"#1b5e63","62":"#6b7f2a","63":"#9caf88","64":"#6fc3b0","65":"#39ff14","66":"#b0ff1a","67":"#8db600","68":"#0b4d2c",
 "70":"#6b4226","71":"#8b7d6b","72":"#e8dcc0","73":"#d9c7a7","74":"#c2b280","75":"#8b5a2b","76":"#4e2e1e","77":"#7a5230","80":"#8c8c8c","81":"#383e42","82":"#a89f91","83":"#c8c8c8","90":"#1a1a1a",
 "91":"#c9a227","92":"#c0c0c0","93":"#5a5a5a","94":"#8c4a2f","95":"#c8a97e","96":"#b0a0c0","97":"#b76e79","98":"#b5a642","99":"#b87333"};
const FAMCOL={bianco:"#ffffff",giallo:"#f2d43c",arancione:"#f28c28",rosso:"#c62828",viola:"#7b3fa0",blu:"#1f4e9c",verde:"#2e8b3e",marrone:"#6b4226",grigio:"#8c8c8c",nero:"#1a1a1a",liberi:"#c9a227",incolore:"#e9eef0"};
const famColore=cc=>{if(!cc) return ""; const n=+cc, k=Object.keys(CAT.colfam).sort().reverse().find(x=>+x<=n); return k?CAT.colfam[k]:"";};
const nomeColore=cc=>CAT.colori[cc]||"";
const nomeMateriale=pr=>CAT.materiali[pr]||(()=>{const k=Object.keys(CAT.matfam).sort().reverse().find(x=>+x<=+pr); return k?CAT.matfam[k]:"";})();
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)), rgb2hex=c=>"#"+c.map(x=>pad(Math.round(x).toString(16))).join("");
const vicino=rgb=>Object.entries(RGB).filter(([k])=>CAT.colori[k]).map(([k,h])=>[k,hex2rgb(h).reduce((s,v,i)=>s+(v-rgb[i])**2,0)]).sort((a,b)=>a[1]-b[1])[0][0];
const CODICI1={},CODICI2={}; CAT.classi.forEach(([c1,n1,c2,n2])=>{CODICI1[n1]=c1; CODICI2[n1+"|"+n2]=c2;});
const CLASSI1=[...new Set(CAT.classi.map(x=>x[1]))];
const classi2=k1=>[...new Set(CAT.classi.filter(x=>x[1]===k1).map(x=>x[3]))], classi3=(k1,k2)=>CAT.classi.filter(x=>x[1]===k1&&x[3]===k2).map(x=>x[5]);
const cap=s=>s?s.charAt(0)+s.slice(1).toLowerCase():"";
const FUNZIONI=["Seduta","Appoggio / tavolo","Bar e catering","Accoglienza","Illuminazione","Decorazione e scenografia","Separazione spazi","Copertura","Contenitore / espositore","Pedane e palchi","Tessili","Mise en place","Climatizzazione"];
const STILI=["Minimal","Industrial","Shabby chic","Boho","Vintage","Rustico","Luxury","Tropicale","Nordico","Mediterraneo","Contemporaneo","Pop"];
const TEMI=["Matrimonio","Gala","Aziendale / convention","Fiera e stand","Lancio prodotto","Festa privata","Natalizio","Estivo / beach","Garden party","Cerimonia","Evento culturale","Street food"];
const ATTR=["Impilabile","Smontabile","Pieghevole","Per esterni","Resiste alla pioggia","Richiede corrente"];
const RUOLI={parte:"Parte",anima:"Anima",rivestimento:"Rivestimento",struttura:"Struttura"};

/* ---------- stato, persistenza ---------- */
const LS="serra-catalogo-v1";   // chiave storica: cambiarla farebbe perdere i dati già salvati nei browser
const load=()=>{try{return JSON.parse(localStorage.getItem(LS))||{};}catch{return {};}};
const DB=Object.assign({ov:{},nuovi:[],prompt:[]},load());
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(DB));}catch{}};
const state={view:"catalogo",ruolo:DB.ruolo||null,dt:{},sel:null,mob:{step:0},vista:"griglia",drawer:null};

/* articoli: dati origine + modifiche locali + nuovi censiti */
const ARTICOLI=()=>[...CAT.articoli,...DB.nuovi];
/* il catalogo è la fonte dei dati (anche per l'ERP): dai campi del file si ricava il modello completo
   - forn: fornitori dell'articolo [{nome, codice, acquisto, condizioni, principale}] (molti-a-molti)
   - prezzi: {acquisto, vendita, noleggio}; costi: storico [{data, tipo:"produzione"|"riacquisto", importo, fornitore, nota}]
   - tipo: "finito" (si noleggia da solo) | "componente" (parte di altri articoli, es. anima o rivestimento)
   - giacenza: giacenza fisica contata a mano, giacenzaIl: data dell'ultimo conteggio */
const COMPONENTE_RX=/copertur|fodera|rivestiment|struttura |anima |imbottitur|ricambio/i;
const conOv=a=>{ const x={...a,...(DB.ov[a.c]||{})};
  x.forn??=[a.f&&{nome:a.f,principale:true},a.f2&&{nome:a.f2}].filter(Boolean);
  x.prezzi??={acquisto:null,vendita:a.pv??null,noleggio:a.pn??null};
  x.costi??=[]; x.tipo??=(COMPONENTE_RX.test(a.d)?"componente":"finito");
  return x; };
/* foto collegate a un codice diverso da quello dell'articolo (errore di mappatura nel file) */
const fotoFuori=a=>(a.foto||[]).filter(f=>!f.toUpperCase().startsWith(a.c.toUpperCase()+"_"));
const art=c=>{const a=CAT.articoli.find(x=>x.c===c)||DB.nuovi.find(x=>x.c===c); return a?conOv(a):null;};
const setArt=(c,patch,nota)=>{const prev=DB.ov[c]||{}; DB.ov[c]={...prev,...patch,storico:[...(prev.storico||[]),{q:oggi(),chi:RUOLO_N[state.ruolo]||"—",n:nota||Object.keys(patch).join(", ")}]}; save();};
/* preferenza dell'utente (nel prototipo: del ruolo): raggruppare le varianti di colore per modello */
const raggruppa=()=>(DB.pref?.[state.ruolo]?.raggruppa)!==false;
const gruppi=()=>{const m=new Map(); ARTICOLI().forEach(a0=>{const a=conOv(a0); if(!m.has(a.b)) m.set(a.b,[]); m.get(a.b).push(a);}); return [...m.values()];};

/* ---------- varianti: campi comuni e propagazione ----------
   Le varianti di colore di un modello restano articoli completi e indipendenti. I campi qui sotto sono
   «comuni» (di solito uguali in tutte le varianti): cambiandone uno si chiede se applicarlo anche alle altre,
   e «Propaga caratteristiche comuni» li copia da un articolo ad altri a scelta.
   Non sono comuni: codice, colore, nome e descrizioni (contengono il colore), foto, colori RGB, giacenza, stato, composizione. */
const CAMPI_COMUNI=[["k1","Classe"],["k2","Sottoclasse"],["k3","Tipologia"],["tipo","Tipo articolo"],["L","Lunghezza"],["P","Profondità"],["H","Altezza"],["D","Diametro"],
  ["vol","Volume imballato"],["peso","Peso"],["pila","Pezzi per pila"],["pers","Persone per spostarlo"],["tCar","Carico per pezzo"],["tMon","Montaggio per pezzo"],
  ["funz","Funzione"],["stili","Stile"],["temi","Temi"],["attr","Caratteristiche"],["prezzi","Prezzi"],["forn","Fornitori"]];
const COMUNE=Object.fromEntries(CAMPI_COMUNI);
const varianti=c=>{const a=art(c); return a?ARTICOLI().map(conOv).filter(x=>x.b===a.b&&x.c!==c):[];};
const uguale=(x,y)=>JSON.stringify(x??null)===JSON.stringify(y??null);
const mostraVal=(k,v)=>v==null||v===""||(Array.isArray(v)&&!v.length)?"—":k==="prezzi"?["acquisto","vendita","noleggio"].map(p=>v[p]!=null?`${p[0].toUpperCase()} € ${num(v[p],2)}`:null).filter(Boolean).join(" · ")||"—"
  :k==="forn"?v.map(f=>f.nome).join(", "):Array.isArray(v)?v.join(", "):k==="k1"||k==="k2"||k==="k3"?cap(String(v)):String(v);
/* scelta fino alla chiusura della scheda: "uno" | "tutti" (per non chiedere a ogni campo) */
const PROP={};
/* dialog a più scelte, stessa struttura di UI.conferma */
const scegli=({titolo,testo,scelte,ricorda})=>new Promise(res=>{
  const d=document.createElement("dialog"); d.className="confirm";
  d.innerHTML=`<div class="dlg-head"><h2 class="grow">${esc(titolo)}</h2></div><div class="dlg-body"><p>${testo}</p>${ricorda?`<label class="chk" style="margin-top:10px"><input type="checkbox" id="sc-ric"> ${esc(ricorda)}</label>`:""}</div>
    <div class="dlg-foot">${scelte.map(([v,l,cls],i)=>`<button class="btn ${cls||""}" value="${v}">${esc(l)}</button>`).join("")}</div>`;
  document.body.append(d);
  d.querySelectorAll(".dlg-foot button").forEach(b=>b.onclick=()=>{d.returnValue=b.value; closeDlg(d);});
  d.addEventListener("close",()=>{res({v:d.returnValue||scelte[0][0],ricorda:!!d.querySelector("#sc-ric")?.checked}); d.remove();});
  showDlg(d); d.querySelector(".dlg-foot .btn:last-child").focus();
});
/* salva una modifica; se tocca campi comuni e l'articolo ha varianti, chiede se applicarla anche a quelle.
   perAltri: x=>patch per ogni altra variante (per i tag si aggiunge/toglie la voce, non si sovrascrive l'elenco) */
/* le richieste vanno in coda: un campo può generare due «change» (modifica e uscita), e la seconda
   trova i valori già allineati e non chiede più nulla */
let _codaProp=Promise.resolve();
const salvaCampo=(...arg)=>(_codaProp=_codaProp.then(()=>_salvaCampo(...arg)).catch(()=>{}));
async function _salvaCampo(c,patch,nota,perAltri=()=>patch){
  const prima=art(c); if(Object.keys(patch).every(k=>uguale(prima[k],patch[k]))) return;
  setArt(c,patch,nota);
  const comuni=Object.keys(patch).filter(k=>COMUNE[k]), altre=varianti(c).filter(x=>comuni.some(k=>!uguale(x[k],perAltri(x)[k])));
  if(!comuni.length||!altre.length) return dopo("Scheda aggiornata");
  let scelta=PROP[c];
  if(!scelta){ render();
    const r=await scegli({titolo:"Applicare anche alle altre varianti?",ricorda:"Ricorda la scelta finché la scheda è aperta",
      testo:`Hai cambiato <strong>${esc(comuni.map(k=>COMUNE[k]).join(", "))}</strong>. ${altre.length===1?"Un'altra variante ha":`${altre.length} altre varianti hanno`} un valore diverso: ${altre.map(x=>`<span class="mono">${esc(x.c)}</span>`).join(", ")}.`,
      scelte:[["uno","Solo questa variante"],["tutti",`Anche alle altre ${altre.length}`,"btn-primary"]]});
    scelta=r.v; if(r.ricorda) PROP[c]=scelta; }
  if(scelta==="tutti"){ altre.forEach(x=>setArt(x.c,perAltri(x),`${nota} (propagato da ${c})`)); dopo(`Aggiornate anche ${altre.length} varianti`); }
  else dopo("Scheda aggiornata");
}
/* procedura esplicita: «Propaga caratteristiche comuni a…» */
function dialogPropaga(c){
  const a=art(c), cand=ARTICOLI().map(conOv).filter(x=>x.c!==c&&(x.b===a.b||x.k2===a.k2));
  const st={camp:new Set(CAMPI_COMUNI.map(([k])=>k).filter(k=>a[k]!=null&&!(Array.isArray(a[k])&&!a[k].length))),dest:new Set(varianti(c).map(x=>x.c)),q:""};
  const d=document.createElement("dialog"); d.className="form prop"; d.id="propDlg";
  const disegna=()=>{
    const dest=cand.filter(x=>st.dest.has(x.c)), diff=k=>dest.filter(x=>!uguale(x[k],a[k])).length;
    const elenco=cand.filter(x=>st.dest.has(x.c)||x.b===a.b||(st.q.length>1&&(x.c+" "+x.d).toLowerCase().includes(st.q.toLowerCase()))).slice(0,60);
    d.querySelector(".dlg-body").innerHTML=`<p class="small muted" style="margin:0">Da <strong>${esc(a.t||a.d)}</strong> <span class="mono">${esc(c)}</span> agli articoli scelti. Nome, descrizioni, colore, foto e giacenza non si copiano.</p>
      <div class="prop-g"><section><div class="row"><b class="small grow">Caratteristiche da copiare</b><button class="btn btn-sm btn-ghost" data-pp="tutte">Tutte</button><button class="btn btn-sm btn-ghost" data-pp="diverse">Solo le diverse</button></div>
        <div class="prop-l">${CAMPI_COMUNI.map(([k,l])=>`<label class="prop-r"><input type="checkbox" data-pk="${k}"${st.camp.has(k)?" checked":""}><span class="grow"><strong>${esc(l)}</strong><span class="small muted"> ${esc(mostraVal(k,a[k]))}</span></span>${dest.length?(diff(k)?UI.stato(`diverso in ${diff(k)}`,"warn"):UI.stato("uguale","ok")):""}</label>`).join("")}</div></section>
      <section><b class="small">Articoli che ricevono · ${dest.length}</b>
        <input type="search" id="pp-q" placeholder="Aggiungi altri articoli: cerca codice o nome…" value="${esc(st.q)}" aria-label="Cerca articoli" style="margin:8px 0">
        <div class="prop-l">${elenco.map(x=>`<label class="prop-r"><input type="checkbox" data-pd="${esc(x.c)}"${st.dest.has(x.c)?" checked":""}>${sw(RGB[x.cc]||"#ddd")}<span class="grow"><span class="mono small">${esc(x.c)}</span> <span class="small">${esc(x.t||x.d)}</span></span>${x.b===a.b?UI.stato("variante",""):""}</label>`).join("")||'<p class="small muted">Nessun articolo.</p>'}</div></section></div>`;
    const n=dest.length*[...st.camp].filter(k=>diff(k)).length;
    d.querySelector('[data-pp="ok"]').disabled=!dest.length||!st.camp.size;
    d.querySelector('[data-pp="ok"]').textContent=dest.length&&st.camp.size?`Copia su ${dest.length} ${dest.length===1?"articolo":"articoli"}`:"Copia";
    d.querySelector(".prop-n").textContent=n?`${n} valori cambieranno`:"Nessun valore cambierà";
  };
  d.innerHTML=`<div class="dlg-head"><h2 class="grow">Propaga caratteristiche comuni</h2></div><div class="dlg-body"></div>
    <div class="dlg-foot"><span class="small muted grow prop-n"></span><button class="btn" data-pp="no">Annulla</button><button class="btn btn-primary" data-pp="ok">Copia</button></div>`;
  d.addEventListener("click",ev=>{ const b=ev.target.closest("[data-pp]"); if(!b) return; const v=b.dataset.pp;
    if(v==="no") return closeDlg(d);
    if(v==="tutte"){ CAMPI_COMUNI.forEach(([k])=>st.camp.add(k)); return disegna(); }
    if(v==="diverse"){ const dest=cand.filter(x=>st.dest.has(x.c)); st.camp=new Set(CAMPI_COMUNI.map(([k])=>k).filter(k=>dest.some(x=>!uguale(x[k],a[k])))); return disegna(); }
    if(v==="ok"){ const campi=[...st.camp], dest=[...st.dest];
      dest.forEach(t=>{ const x=art(t), patch=Object.fromEntries(campi.filter(k=>!uguale(x[k],a[k])).map(k=>[k,structuredClone(a[k]??null)])); if(Object.keys(patch).length) setArt(t,patch,`caratteristiche copiate da ${c}: ${Object.keys(patch).map(k=>COMUNE[k]).join(", ")}`); });
      closeDlg(d); dopo(`Caratteristiche copiate su ${dest.length} ${dest.length===1?"articolo":"articoli"}`); } });
  d.addEventListener("change",ev=>{ const el=ev.target;
    if(el.dataset.pk){ el.checked?st.camp.add(el.dataset.pk):st.camp.delete(el.dataset.pk); disegna(); }
    if(el.dataset.pd){ el.checked?st.dest.add(el.dataset.pd):st.dest.delete(el.dataset.pd); disegna(); } });
  d.addEventListener("input",ev=>{ if(ev.target.id==="pp-q"){ st.q=ev.target.value; const pos=ev.target.selectionStart; disegna(); const q=d.querySelector("#pp-q"); q.focus(); q.setSelectionRange(pos,pos); } });
  document.body.append(d); d.addEventListener("close",()=>d.remove()); disegna(); showDlg(d);
}

/* completezza della scheda (§6 del PRD) */
const CHECK=[["foto","Foto principale",a=>a.foto?.length||a.fotoNuove?.length],["desc","Descrizione estesa",a=>(a.e||"").length>20],
  ["dim","Dimensioni strutturate",a=>a.L||a.D],["log","Volume e peso da imballato",a=>a.vol&&a.peso],["rgb","Colori RGB",a=>a.rgb?.length],
  ["temi","Almeno un tema",a=>a.temi?.length],["funz","Funzione",a=>a.funz?.length],["prezzo","Prezzo di noleggio",a=>a.tipo==="componente"||a.prezzi?.noleggio!=null]];
const compl=a=>CHECK.filter(([,,f])=>f(a)).length/CHECK.length;
const statoArt=a=>a.stato==="revisione"?["Da revisionare","warn"]:a.stato==="pubblicato"?["Pubblicato","ok"]:compl(a)===1?["Completo","info"]:["Da completare",""];
const STATI=["Da completare","Da revisionare","Completo","Pubblicato"];

/* una sola azione primaria per vista, in alto a destra (come «Carica offerta PDF» / «+ Nuovo» nella Logistica) */
/* pezzi propri del catalogo (in aggiunta a UI della Logistica) */
const sw=(hex,lab="",big=false)=>`<span class="sw${big?" big":""}" style="--sw:${hex}" title="${esc(lab||hex)}"></span>`;
/* multi-selezione a checkbox: stesso componente dei ruoli/patenti dell'anagrafica addetti */
const scelte=(campo,voci,sel=[],c,ro)=>`<div class="chipgroup">${voci.map(x=>`<label class="chk"><input type="checkbox" data-tag="${campo}" data-c="${esc(c)}" value="${esc(x)}"${sel.includes(x)?" checked":""}${ro?" disabled":""}>${esc(x)}</label>`).join("")}</div>`;
const blocco=(titolo,corpo,{azioni="",aiuto}={})=>`<div class="detail-section">${UI.sezione({titolo,azioni,corpo,aiuto})}</div>`;
/* segnaposto foto: le immagini non sono nel progetto, si mostra un riquadro col colore dell'articolo */
const ph=(a,cls="")=>{const f=a.fotoNuove?.find(x=>x.main)||a.fotoNuove?.[0];
  if(f) return `<div class="ph ${cls} has-img"><img src="${f.pres||f.orig}" alt="${esc(a.t||a.d)}"></div>`;
  return `<div class="ph ${cls}" style="--ph:${RGB[a.cc]||"#d9d9d9"}" title="${esc(a.foto?.[0]||"nessuna foto")}"><span>${esc((a.k2||a.k1||"").slice(0,14))}</span><small>${a.foto?.length?"con foto":"senza foto"}</small></div>`;};

/* ---------- aiuti (?) ---------- */
const AIUTI={
  "vista-catalogo":"<b>Catalogo</b>: tutti gli articoli raggruppati per modello (le varianti di colore stanno insieme). Cerca, filtra per stato, classe e colore; clicca un articolo per aprire la scheda.",
  "vista-censimento":"<b>Censimento</b>: il flusso da telefono — foto, nota, AI, invio in revisione. Qui è mostrato dentro un telefono; su un telefono vero occupa tutto lo schermo.",
  "vista-revisione":"<b>Revisione</b>: le schede proposte dall'AI o dai censitori. Il curatore le apre, le corregge e le approva; «Rimanda» le restituisce al censitore.",
  "vista-prompt":"<b>Prompt immagini</b>: le istruzioni per la foto di presentazione (Nano Banana). Gli standard non si modificano; i personali sì.",
  "vista-importa":"<b>Import</b>: cosa è arrivato dal file articoli attuale e le anomalie da sistemare. Clicca una riga per aprire l'articolo.",
  "vista-api":"<b>API e MCP</b>: come ERP, sito, logistica e agenti AI leggono il catalogo. Escono solo gli articoli pubblicati.",
  "sch-misure":"<b>Misure per la logistica</b>: volume e peso da imballato, pezzi per pila e tempi sono i dati che servono al pianificatore per stimare carichi e mezzi.",
  "sch-comp":"<b>Composizione</b>: distinta base (struttura, parti), anima e rivestimento, componenti condivisi tra articoli diversi."
};

/* ---------- accesso unico ---------- */
const RUOLI_U={censitore:["Censitore","magazzino e location: censisce da telefono"],curatore:["Curatore","rivede, approva, gestisce composizioni e prompt"],commerciale:["Commerciale","consulta e cerca per tema e colore"],logistica:["Logistica","completa misure e pesi"]};
const RUOLO_N=Object.fromEntries(Object.entries(RUOLI_U).map(([k,v])=>[k,v[0]]));
function viewAccesso(){
  return `<div class="login"><div class="login-card card"><img src="assets/logo-oig.png" alt="" width="120"><h1>Oltre Il Giardino</h1><p class="muted">Un solo accesso per Logistica, Catalogo e (in seguito) Magazzino, da computer e da telefono.</p>
    <div class="login-sso"><button class="btn btn-primary" disabled>Accedi con l'account aziendale</button><span class="tiny muted">SSO aziendale — nel prototipo scegli un ruolo:</span></div>
    <div class="ruoli">${Object.entries(RUOLI_U).map(([k,[n,d]])=>`<button class="ruolo" data-act="ruolo" data-v="${k}">${icon("user",18)}<strong>${n}</strong><span class="small muted">${d}</span></button>`).join("")}</div></div></div>`;
}

/* ---------- navigazione ---------- */
const VIEWS={
  catalogo:{l:"Catalogo",i:"grid",sub:"Tutti gli articoli: cerca, filtra per classe, colore e stato, apri la scheda"},
  censimento:{l:"Censimento",i:"cam",sub:"Da telefono: foto → AI → revisione"},
  revisione:{l:"Revisione",i:"check",sub:"Schede proposte dall'AI o dai censitori, da approvare prima della pubblicazione"},
  prompt:{l:"Prompt immagini",i:"spark",sub:"Prompt standard e personali per le foto di presentazione"},
  importa:{l:"Import",i:"upload",sub:"Il file articoli attuale: cosa è stato importato e le anomalie da sistemare"},
  api:{l:"API e MCP",i:"api",sub:"Come gli altri sistemi leggono il catalogo"}
};
const VISIBILI={censitore:["censimento","catalogo"],curatore:Object.keys(VIEWS),commerciale:["catalogo","api"],logistica:["catalogo","censimento","importa"]};
function topActions(){
  const a=[];
  if(state.view==="prompt"&&state.ruolo==="curatore") a.push(`<button class="btn btn-primary" data-act="prompt-new">+ Nuovo prompt</button>`);
  if(state.view==="catalogo"&&VISIBILI[state.ruolo].includes("censimento")) a.push(`<button class="btn btn-primary" data-act="view" data-v="censimento">${icon("cam",16)} Censisci</button>`);
  return a.join("");
}
/* un campo che perde il focus mentre la pagina si ridisegna genera un «change» e un secondo render annidato:
   lo si rimanda a dopo il primo */
let _rendering=false, _ancora=false;
function render(){
  if(_rendering){ _ancora=true; return; }
  _rendering=true; try{ disegna(); } finally{ _rendering=false; if(_ancora){ _ancora=false; render(); } }
}
function disegna(){
  document.body.classList.toggle("no-auth",!state.ruolo);
  if(!state.ruolo){ $("login").innerHTML=viewAccesso(); return; }
  $("login").innerHTML="";
  const vis=VISIBILI[state.ruolo]; if(!vis.includes(state.view)) state.view=vis[0];
  const tutti=ARTICOLI().map(conOv), nRev=tutti.filter(a=>a.stato==="revisione").length, nOk=tutti.filter(a=>a.stato==="pubblicato").length, nCompl=tutti.filter(a=>compl(a)===1).length;
  $("nav").innerHTML=vis.map(k=>`<button data-act="view" data-v="${k}" aria-current="${state.view===k?"page":"false"}">${icon(VIEWS[k].i)}<span class="lbl">${VIEWS[k].l}</span>${k==="revisione"&&nRev?`<span class="count">${nRev}</span>`:""}</button>`).join("");
  $("health").innerHTML=`<div class="eyebrow">Stato del catalogo</div>
    <div class="row"><span class="row"><i class="dot warn"></i>Da revisionare</span><b>${nRev}</b></div>
    <div class="row"><span class="row"><i class="dot info"></i>Schede complete</span><b>${num(nCompl,0)}</b></div>
    <div class="row"><span class="row"><i class="dot ok"></i>Pubblicati</span><b>${num(nOk,0)}</b></div>`;
  $("sideFoot").innerHTML=`Accesso come <strong>${RUOLO_N[state.ruolo]}</strong> · <button class="btn btn-sm btn-ghost" data-act="esci">Cambia</button><br>Prototipo: AI simulata, modifiche salvate solo in questo browser. <button class="btn btn-sm btn-ghost" data-act="reset">Azzera</button>`;
  $("pageTitle").textContent=VIEWS[state.view].l; $("pageSub").textContent=VIEWS[state.view].sub; $("pageHint").innerHTML=UI.hint("vista-"+state.view); $("topActions").innerHTML=topActions();
  $("view").innerHTML=({catalogo:viewCatalogo,censimento:viewCensimento,revisione:viewRevisione,prompt:viewPrompt,importa:viewImport,api:viewApi})[state.view]();
  if(state.drawer) state.drawer();
}

/* ---------- CATALOGO ---------- */
const testoGruppo=g=>g.map(x=>[x.c,x.d,x.t,x.e,x.k1,x.k2,x.k3,(x.forn||[]).map(f=>f.nome).join(" "),nomeColore(x.cc),(x.temi||[]).join(" "),(x.stili||[]).join(" ")].join(" ")).join(" ");
const CAMPI_CAT={st:g=>g.map(x=>statoArt(x)[0]),k1:g=>g[0].k1,k2:g=>g[0].k2,tipo:g=>g[0].tipo,col:g=>g.map(x=>famColore(x.cc))};
/* ordine delle categorie: prima quelle messe in testa dal curatore (nell'ordine scelto), poi alfabetico */
const ordCat=lista=>{const pin=DB.catOrd||[]; return [...lista].sort((a,b)=>{const i=pin.indexOf(a), j=pin.indexOf(b); return i>=0||j>=0?(i<0?1e9:i)-(j<0?1e9:j):a.localeCompare(b,"it");});};
/* senza ricerca si naviga a due livelli: prima la categoria, poi la sottocategoria, solo allora i prodotti */
function navCategorie(tutti,st){
  const k1=st.seg.k1, cur=state.ruolo==="curatore", pin=DB.catOrd||[];
  const conta=f=>tutti.filter(f).length;
  const voci=k1?ordCat(classi2(k1)).map(k2=>[k2,conta(g=>g[0].k1===k1&&g[0].k2===k2),"k2"]).filter(x=>x[1]):ordCat(CLASSI1).map(k=>[k,conta(g=>g[0].k1===k),"k1"]);
  const tile=([n,q,liv])=>`<div class="cat-t"><button class="pc cat-b" data-act="dt-seg" data-dt="cat" data-g="${liv}" data-v="${esc(n)}"><div class="pc-b"><div class="pc-t">${esc(cap(n))}</div><span class="small muted">${num(q,0)} ${q===1?(raggruppa()?"modello":"articolo"):(raggruppa()?"modelli":"articoli")}</span></div></button>
    ${cur&&liv==="k1"?`<button class="icon-btn cat-pin${pin.includes(n)?" on":""}" data-act="cat-pin" data-v="${esc(n)}" aria-label="${pin.includes(n)?"Togli dalla testa":"Metti in testa"}: ${esc(cap(n))}" title="${pin.includes(n)?"In testa all'elenco: clicca per tornare in ordine alfabetico":"Metti in testa all'elenco"}">★</button>`:""}</div>`;
  return `<div class="pgrid cat-grid">${voci.map(tile).join("")}</div>`;
}
const briciole=st=>`<nav class="crumbs" aria-label="Percorso"><button class="btn btn-sm btn-ghost" data-act="cat-nav" data-v="">Tutte le categorie</button>${st.seg.k1?` › <button class="btn btn-sm btn-ghost" data-act="cat-nav" data-v="k1">${esc(cap(st.seg.k1))}</button>`:""}${st.seg.k2?` › <strong>${esc(cap(st.seg.k2))}</strong>`:""}${st.q?` · <span class="muted">risultati della ricerca in ${st.seg.k2?"questa sottocategoria":st.seg.k1?"questa categoria":"tutto il catalogo"}</span>`:""}</nav>`;
function viewCatalogo(){
  const tutti=raggruppa()?gruppi():ARTICOLI().map(a=>[conOv(a)]), unita=raggruppa()?["modello","modelli"]:["articolo","articoli"], list=UI.filtra("cat",tutti,testoGruppo,CAMPI_CAT).sort((a,b)=>a[0].b.localeCompare(b[0].b)), st=dtStato("cat"), cnt=(g,v)=>UI.conta("cat",tutti,testoGruppo,CAMPI_CAT,g,v);
  const naviga=!st.q&&!st.seg.k2;
  const filtri=naviga?UI.filtri({id:"cat",cerca:"Cerca in tutto il catalogo: codice, descrizione, fornitore, tema…"}):UI.filtri({id:"cat",cerca:"Cerca codice, descrizione, fornitore, tema…",segmenti:[
      {nome:"st",etichetta:"Stato",voci:[["","Tutti",cnt("st")],...STATI.map(s=>[s,s,cnt("st",s)])]},
      {nome:"tipo",etichetta:"Tipo",voci:[["","Tutti"],["finito","Articoli finiti",cnt("tipo","finito")],["componente","Componenti",cnt("tipo","componente")]]}]})
    +(naviga?"":`<div class="row wrap colfil" role="group" aria-label="Colore"><span class="tiny muted">Colore</span>${Object.entries(FAMCOL).map(([f,h])=>`<button class="swb${st.seg.col===f?" on":""}" data-act="dt-seg" data-dt="cat" data-g="col" data-v="${st.seg.col===f?"":f}" title="${f}" aria-pressed="${st.seg.col===f}">${sw(h,f)}</button>`).join("")}</div>`);
  const vista=`<label class="chk"><input type="checkbox" id="pref-raggr"${raggruppa()?" checked":""}>Raggruppa le varianti</label><div class="seg" role="group" aria-label="Vista"><button data-act="vista" data-v="griglia" aria-pressed="${state.vista==="griglia"}">Griglia</button><button data-act="vista" data-v="tabella" aria-pressed="${state.vista==="tabella"}">Tabella</button></div>`;
  /* la datatable tratta gli array come celle: ogni gruppo va incapsulato in {g} */
  const corpo=naviga?navCategorie(tutti,st):state.vista==="tabella"?UI.datatable({id:"cat",righe:list.map(g=>({g})),perPagina:48,ordIniziale:{key:"b",dir:"asc"},vuoto:"Nessun articolo con questi filtri",suggerimento:"Cambia la ricerca o togli i filtri.",
      riga:({g})=>({act:`data-act="apri" data-c="${esc(g[0].c)}"`}),colonne:[
      {key:"b",t:"Codice",mono:true,valore:({g})=>g[0].b},{key:"t",t:"Articolo",valore:({g})=>g[0].t||g[0].d,cella:({g})=>`<strong>${esc(g[0].t||g[0].d)}</strong>`},
      {key:"k",t:"Classe",valore:({g})=>g[0].k1+" "+g[0].k2,cella:({g})=>`<span class="small">${esc(cap(g[0].k1))} › ${esc(cap(g[0].k2))}</span>`},
      {key:"n",t:"Varianti",tipo:"numero",valore:({g})=>g.length,cella:({g})=>`<span class="row" style="gap:3px;justify-content:flex-end">${g.slice(0,6).map(x=>sw(RGB[x.cc]||"#ddd",nomeColore(x.cc))).join("")}<span class="mono small">${g.length}</span></span>`},
      {key:"dim",t:"Dimensioni",valore:({g})=>g[0].dim||"",cella:({g})=>`<span class="small">${esc(g[0].dim||"—")}</span>`},
      {key:"compl",t:"Completezza",tipo:"numero",valore:({g})=>compl(g[0]),cella:({g})=>UI.misura(Math.round(compl(g[0])*100),100,"%")},
      {key:"st",t:"Stato",tipo:"stato",valore:({g})=>statoArt(g[0])[0],cella:({g})=>UI.stato(...statoArt(g[0]))}]})
    :griglia(list);
  return `<section class="kpis">${UI.kpi(num(ARTICOLI().length,0),"articoli")}${UI.kpi(num(tutti.length,0),"modelli (con varianti)")}${UI.kpi(num(ARTICOLI().filter(a=>compl(conOv(a))===1).length,0),"schede complete",["obiettivo 80%","info"])}${UI.kpi(cnt("st","Da revisionare"),"da revisionare")}</section>
    ${UI.pannello({titolo:naviga?(st.seg.k1?`${esc(cap(st.seg.k1))}: scegli la sottocategoria`:"Scegli la categoria"):`${num(list.length,0)} ${list.length===1?unita[0]:unita[1]}`,azioni:naviga?`<label class="chk"><input type="checkbox" id="pref-raggr"${raggruppa()?" checked":""}>Raggruppa le varianti</label>`:vista,aiuto:"vista-catalogo",corpo:`<div class="card-body dt-filtri">${briciole(st)}${filtri}</div>${corpo}`})}`;
}
/* griglia a schede: stessa paginazione e stesso piede della datatable (stato in dtStato("cat")) */
function griglia(list){
  const st=dtStato("cat"), per=48, pagine=Math.max(1,Math.ceil(list.length/per)); st.pag=Math.min(st.pag,pagine-1);
  const vis=list.slice(st.pag*per,(st.pag+1)*per);
  const card=g=>{const a=g[0], [s,t]=statoArt(a), c=compl(a);
    return `<button class="pc" data-act="apri" data-c="${esc(a.c)}">${ph(a)}<div class="pc-b"><div class="mono tiny muted">${esc(a.b)}</div><div class="pc-t">${esc(a.t||a.d)}</div>
      <div class="row wrap" style="gap:4px">${g.slice(0,8).map(x=>sw(RGB[x.cc]||"#ddd",nomeColore(x.cc))).join("")}${g.length>8?`<span class="tiny muted">+${g.length-8}</span>`:""}<span class="grow"></span>${UI.stato(s,t)}</div>
      <span class="meter" title="Scheda completa al ${Math.round(c*100)}%"><b style="width:${c*100}%"></b></span></div></button>`;};
  const nav=pagine>1?`<nav class="dt-pag" aria-label="Pagine">${[["‹",st.pag-1,st.pag===0,"Pagina precedente"],...Array.from({length:pagine},(_,i)=>[i+1,i,false,"Pagina "+(i+1)]).filter(([,i])=>Math.abs(i-st.pag)<4||i===0||i===pagine-1),["›",st.pag+1,st.pag===pagine-1,"Pagina successiva"]]
    .map(([t,p,dis,tit])=>`<button type="button" data-act="dt-pag" data-dt="cat" data-p="${p}"${dis?" disabled":""}${p===st.pag&&typeof t==="number"?' aria-current="page" class="on"':""} title="${tit}">${t}</button>`).join("")}</nav>`:"";
  return vis.length?`<div class="pgrid">${vis.map(card).join("")}</div><div class="dt-piede"><span>${pagine>1?`${st.pag*per+1}–${Math.min(list.length,(st.pag+1)*per)} di `:""}${list.length} ${list.length===1?"elemento":"elementi"}</span>${nav}</div>`
    :`<div class="empty"><strong>Nessun articolo con questi filtri</strong><div class="small">Cambia la ricerca o togli i filtri.</div></div>`;
}

/* ---------- SCHEDA ARTICOLO (stesso pannello del dettaglio ordine) ---------- */
function openDrawer(fn){ state.drawer=fn; fn(); $("drawer").classList.add("open"); $("scrim").classList.add("open"); }
function closeDrawer(){ Object.keys(PROP).forEach(k=>delete PROP[k]); state.drawer=null; state.sel=null; $("drawer").classList.remove("open"); $("scrim").classList.remove("open"); $("drawerFoot").hidden=true; }
function fillDrawer(kicker,title,html,foot=""){ $("drawerKicker").textContent=kicker; $("drawerTitle").textContent=title; const sc=$("drawerBody").scrollTop; $("drawerBody").innerHTML=html; $("drawerBody").scrollTop=sc; $("drawerFoot").innerHTML=foot; $("drawerFoot").hidden=!foot; }
const apri=c=>{ if(!state.drawer) state.atab="scheda"; state.sel=c; openDrawer(drawerArticolo); $("drawerBody").scrollTop=0; };
/* scheda articolo: a sinistra il riepilogo sempre visibile (foto, stato, varianti, cosa manca),
   a destra una scheda per argomento. Ogni voce di completezza porta alla scheda dove si completa. */
const SCHEDE_ART=[["scheda","Descrizione"],["uso","Uso negli eventi"],["misure","Misure"],["comp","Composizione"],["foto","Foto e colori"],["prezzi","Prezzi e fornitori"],["info","Magazzino e storico"]];
const CHECK_TAB={prezzo:"prezzi",foto:"foto",desc:"scheda",dim:"misure",log:"misure",rgb:"foto",temi:"uso",funz:"uso"};
function drawerArticolo(){
  const a=art(state.sel); if(!a) return closeDrawer();
  const g=gruppi().find(x=>x.some(y=>y.c===a.c))||[a], [s,t]=statoArt(a), c=a.c, ro=state.ruolo==="commerciale";
  const tab=state.atab||"scheda", manca=CHECK.filter(([,,fn])=>!fn(a)), mancaIn=k=>manca.filter(([m])=>CHECK_TAB[m]===k).length;
  const dis=ro?" disabled":"", at=k=>`data-f="${k}" data-c="${esc(c)}"${dis}`;
  const f=(k,et,step="any",suff="")=>UI.campo({id:"f-"+k,etichetta:et+(suff?` (${suff})`:""),valore:a[k]??"",tipo:"number",attr:`${at(k)} step="${step}"`});
  const sel=(k,et,op,v)=>`<div><label class="fl" for="f-${k}">${esc(et)}</label><select id="f-${k}" ${at(k)}>${op.map(o=>{const [val,l]=Array.isArray(o)?o:[o,cap(o)]; return `<option value="${esc(val)}"${val===v?" selected":""}>${esc(l)}</option>`;}).join("")}</select></div>`;

  const usatoIn=ARTICOLI().map(conOv).filter(x=>(x.comp||[]).some(k=>k.cod===c));
  const roP=state.ruolo!=="curatore", disP=roP?" disabled":"";   /* prezzi e fornitori: li modifica il curatore */
  const eur=v=>v==null||v===""?"—":`€ ${num(v,2)}`;
  /* ---- riepilogo (colonna sinistra) ---- */
  const riep=`<aside class="art-side">${ph(a,"side")}
    <div class="row wrap" style="gap:4px">${UI.stato(s,t)}${UI.stato(a.tipo==="componente"?"Componente":"Articolo finito",a.tipo==="componente"?"info":"")}${a.dup?UI.stato("codice duplicato","err"):""}${fotoFuori(a).length?UI.stato("foto di un altro codice","err"):""}${a.nuovo?UI.stato("censito da telefono","info"):""}${a.ai?UI.stato("proposta AI da controllare","warn"):""}</div>
    ${UI.dettagli([["Codice",`<span class="mono">${esc(c)}</span>`],["Classe",`${esc(cap(a.k1))} › ${esc(cap(a.k2))}${a.k3?` › ${esc(cap(a.k3))}`:""}`],["Colore",a.cc?`${sw(RGB[a.cc]||"#ddd")} ${esc(a.cc)} ${esc(nomeColore(a.cc))}`:"—"],["Misure",esc(a.dim||"—")]])}
    ${g.length>1?`<div><div class="eyebrow">Varianti · ${g.length}</div><div class="var">${g.map(x=>`<button class="vb${x.c===c?" on":""}" data-act="apri" data-c="${esc(x.c)}" title="${esc(x.c)}">${sw(RGB[x.cc]||"#ddd")}<span>${esc(nomeColore(x.cc)||x.cc||x.d)}</span></button>`).join("")}</div></div>`:""}
    ${ro?"":`<button class="btn btn-sm" data-act="propaga" data-c="${esc(c)}">Propaga caratteristiche comuni a…</button>`}
    <div><div class="row"><span class="eyebrow grow">Scheda completa</span>${UI.misura(Math.round(compl(a)*100),100,"%")}</div>
      ${manca.length?`<ul class="art-manca">${manca.map(([k,l])=>`<li><button class="btn btn-sm btn-ghost" data-act="tab" data-k="atab" data-v="${CHECK_TAB[k]}">○ ${esc(l)} ›</button></li>`).join("")}</ul>`:'<p class="small" style="color:var(--ok)">✓ Tutti i dati richiesti ci sono</p>'}</div>
  </aside>`;

  /* ---- contenuto delle schede ---- */
  const pesoComp=(a.comp||[]).reduce((s,k)=>s+((art(k.cod)?.peso||0)*(k.q||1)),0);
  const volAuto=a.L&&a.P&&a.H?a.L*a.P*a.H/1e6:a.D&&a.H?Math.PI*(a.D/2)**2*a.H/1e6:null;
  const corpo={
    scheda:()=>`<div class="fgrid">${UI.campo({id:"f-t",etichetta:"Nome",valore:a.t,attr:at("t"),pieno:true})}
        ${UI.campo({id:"f-e",etichetta:"Descrizione",valore:a.e,tipo:"textarea",pieno:true,attr:`rows="5" ${at("e")}`})}
        ${UI.campo({id:"f-d",etichetta:`Descrizione breve per l'ERP (${(a.d||"").length}/40)`,valore:a.d,attr:`maxlength="60" ${at("d")}`,pieno:true})}
        ${sel("k1","Classe",CLASSI1,a.k1)}${sel("k2","Sottoclasse",classi2(a.k1),a.k2)}${sel("k3","Tipo",classi3(a.k1,a.k2),a.k3)}
        ${sel("cc","Colore (scala aziendale)",Object.entries(CAT.colori).map(([k,n])=>[k,`${k} ${n}`]),a.cc)}
        ${sel("tipo","Tipo articolo",[["finito","Articolo finito (si noleggia da solo)"],["componente","Componente (parte di altri articoli)"]],a.tipo)}</div>
      ${(a.d||"").length>40?UI.nota("La descrizione breve supera i 40 caratteri ammessi dall'ERP."):""}
      ${a.tipo==="componente"&&!usatoIn.length?UI.nota("È un componente ma non è ancora collegato a nessun articolo: aprilo dall'articolo principale, scheda Composizione."):""}
      <p class="small muted">Materiale (dal codice): ${a.mat?`<span class="mono">${a.mat}</span> ${esc(nomeMateriale(a.mat))}`:"—"}</p>`,
    uso:()=>`<div class="art-uso"><div><label class="fl">Funzione</label>${scelte("funz",FUNZIONI,a.funz||[],c,ro)}</div><div><label class="fl">Temi</label>${scelte("temi",TEMI,a.temi||[],c,ro)}</div>
        <div><label class="fl">Stile</label>${scelte("stili",STILI,a.stili||[],c,ro)}</div><div><label class="fl">Caratteristiche</label>${scelte("attr",ATTR,a.attr||[],c,ro)}</div></div>`,
    misure:()=>`<p class="small">Dal file: <span class="mono">${esc(a.dim||"—")}</span></p>
      <div class="art-grp"><div class="eyebrow">Dimensioni da montato</div><div class="fgrid g4">${f("L","Lunghezza","any","cm")}${f("P","Profondità","any","cm")}${f("H","Altezza","any","cm")}${f("D","Diametro","any","cm")}</div></div>
      <div class="art-grp"><div class="eyebrow">Trasporto ${UI.hint("sch-misure")}</div><div class="fgrid g4">${f("vol","Volume imballato","0.01","m³")}${f("peso","Peso","0.1","kg")}${f("pila","Pezzi per pila","1")}${f("pers","Persone per spostarlo","1")}</div>
        ${volAuto&&!a.vol&&!ro?`<div class="row" style="margin-top:8px"><span class="small muted grow">Dalle dimensioni: ${num(volAuto,3)} m³ da montato.</span><button class="btn btn-sm" data-act="usa-vol" data-c="${esc(c)}" data-v="${volAuto.toFixed(3)}">Usa come volume</button></div>`:""}</div>
      <div class="art-grp"><div class="eyebrow">Tempi</div><div class="fgrid g4">${f("tCar","Carico per pezzo","0.5","min")}${f("tMon","Montaggio per pezzo","1","min")}</div></div>`,
    comp:()=>`${UI.tabella({colonne:[{t:"Ruolo"},{t:"Componente"},{t:"Q.tà",num:true},{t:""}],vuoto:"Nessun componente.",righe:(a.comp||[]).map((k,i)=>{const ka=k.cod&&art(k.cod);
        return [UI.stato(RUOLI[k.ruolo]||k.ruolo,k.ruolo==="rivestimento"?"info":""),ka?`<button class="btn btn-sm btn-ghost" data-act="apri" data-c="${esc(k.cod)}">${esc(ka.d)}</button> <span class="mono tiny muted">${esc(k.cod)}</span>`:esc(k.desc),k.q||1,
          ro?"":`<button class="icon-btn" data-act="rm-comp" data-c="${esc(c)}" data-i="${i}" aria-label="Togli ${esc(ka?.d||k.desc)}">${icon("x",13)}</button>`];})})}
      ${ro?"":`<div class="addc"><select id="nc-ruolo" aria-label="Ruolo">${Object.entries(RUOLI).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select>
        <input id="nc-desc" placeholder="Descrizione del componente, o cerca un articolo (es. copertura)…" list="nc-list" aria-label="Componente"><datalist id="nc-list">${suggerisciComp(a).map(x=>`<option value="${esc(x.c)} · ${esc(x.d)}">`).join("")}</datalist>
        <input id="nc-q" type="number" min="1" value="1" style="width:72px" aria-label="Quantità"><button class="btn btn-sm" data-act="add-comp" data-c="${esc(c)}">+ Aggiungi</button></div>`}
      ${pesoComp?`<p class="small muted">Peso dai componenti: ${num(pesoComp)} kg</p>`:""}
      ${usatoIn.length?`<p class="small">Usato come componente in: ${usatoIn.map(x=>`<button class="btn btn-sm btn-ghost" data-act="apri" data-c="${esc(x.c)}">${esc(x.d)}</button>`).join(" ")}</p>`:""}`,
    foto:()=>`<div class="fotos">${(a.fotoNuove||[]).map((x,i)=>`<figure class="${x.main?"main":""}"><img src="${x.pres||x.orig}" alt=""><figcaption class="tiny">${esc(x.prompt||"originale")}${x.main?" · principale":""}</figcaption>${ro||x.main?"":`<button class="btn btn-sm btn-ghost" data-act="foto-main" data-c="${esc(c)}" data-i="${i}">Rendi principale</button>`}</figure>`).join("")}
        ${(a.foto||[]).map((n,i)=>`<figure><div class="ph sm" style="--ph:${RGB[a.cc]||"#ddd"}"></div><figcaption class="tiny mono">${esc(n)}${i===0?" · principale":""}${fotoFuori(a).includes(n)?' <span class="t-err">· codice diverso</span>':""}</figcaption></figure>`).join("")||(a.fotoNuove?.length?"":'<p class="small muted">Nessuna foto.</p>')}</div>
      ${ro?"":`<div><button class="btn btn-sm" data-act="foto-da" data-c="${esc(c)}">${icon("cam",15)} Aggiungi foto da telefono</button></div>`}
      <div class="art-grp"><div class="eyebrow">Colori rilevati dalla foto</div>${a.rgb?.length?`<div class="row wrap">${a.rgb.map(x=>`${sw(x.hex,"",true)}<span class="mono tiny">${x.hex} · ${x.pct}%</span>`).join("")}</div><p class="tiny muted">Codice colore più vicino: ${vicino(hex2rgb(a.rgb[0].hex))} ${esc(nomeColore(vicino(hex2rgb(a.rgb[0].hex))))}</p>`:'<p class="small muted">Si calcolano quando si aggiunge una foto.</p>'}</div>
      ${UI.nota("Le foto del file sono indicate per nome: la cartella immagini non è ancora nel progetto.")}`,
    prezzi:()=>{ const P=a.prezzi||{}, pf=(k,l)=>UI.campo({id:"p-"+k,etichetta:l+" (€)",valore:P[k]??"",tipo:"number",attr:`data-prezzo="${k}" data-c="${esc(c)}" step="0.01" min="0"${disP}`});
        const marg=P.vendita&&P.acquisto?Math.round((P.vendita-P.acquisto)/P.vendita*100):null;
        return `<div class="art-grp"><div class="eyebrow">Prezzi</div><div class="fgrid g4">${pf("acquisto","Acquisto")}${pf("vendita","Vendita")}${pf("noleggio","Noleggio")}</div>
          ${marg!=null?`<p class="small muted">Margine sulla vendita: ${marg}%${P.noleggio&&P.acquisto?` · il noleggio ripaga l'acquisto in ${Math.ceil(P.acquisto/P.noleggio)} noleggi`:""}</p>`:""}</div>
        <div class="art-grp"><div class="eyebrow">Fornitori · ${(a.forn||[]).length}</div>
          ${UI.tabella({colonne:[{t:"Fornitore"},{t:"Codice del fornitore",mono:true},{t:"Prezzo d'acquisto",num:true},{t:"Condizioni"},{t:"Principale"},{t:""}],vuoto:"Nessun fornitore.",righe:(a.forn||[]).map((f,i)=>[
            `<strong>${esc(f.nome)}</strong>`,esc(f.codice||"—"),eur(f.acquisto),`<span class="small">${esc(f.condizioni||"—")}</span>`,
            f.principale?UI.stato("principale","ok"):roP?"":`<button class="btn btn-sm btn-ghost" data-act="forn-main" data-c="${esc(c)}" data-i="${i}">Rendi principale</button>`,
            roP?"":`<button class="icon-btn" data-act="forn-del" data-c="${esc(c)}" data-i="${i}" aria-label="Togli ${esc(f.nome)}">${icon("x",13)}</button>`])})}
          ${roP?"":`<div class="addc"><input id="nf-nome" placeholder="Fornitore" list="nf-list" aria-label="Fornitore"><datalist id="nf-list">${FORNITORI().map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
            <input id="nf-cod" placeholder="Suo codice" style="width:130px" aria-label="Codice del fornitore"><input id="nf-pr" type="number" step="0.01" min="0" placeholder="€ acquisto" style="width:110px" aria-label="Prezzo d'acquisto">
            <input id="nf-cond" placeholder="Condizioni (es. 15 gg, minimo 10 pz)" aria-label="Condizioni"><button class="btn btn-sm" data-act="forn-add" data-c="${esc(c)}">+ Aggiungi</button></div>`}</div>
        <div class="art-grp"><div class="eyebrow">Storico costi di produzione e di riacquisto · ${(a.costi||[]).length}</div>
          ${UI.tabella({colonne:[{t:"Data",mono:true},{t:"Tipo"},{t:"Importo",num:true},{t:"Fornitore"},{t:"Nota"}],vuoto:"Nessun costo registrato.",righe:(a.costi||[]).slice().sort((x,y)=>y.data.localeCompare(x.data)).map(k=>[esc(k.data),UI.stato(k.tipo==="produzione"?"Produzione":"Riacquisto",k.tipo==="produzione"?"info":""),eur(k.importo),esc(k.fornitore||"—"),`<span class="small">${esc(k.nota||"")}</span>`])})}
          ${roP?"":`<div class="addc"><input id="nk-data" type="date" value="${new Date().toISOString().slice(0,10)}" aria-label="Data"><select id="nk-tipo" aria-label="Tipo"><option value="riacquisto">Riacquisto</option><option value="produzione">Produzione</option></select>
            <input id="nk-imp" type="number" step="0.01" min="0" placeholder="€" style="width:100px" aria-label="Importo"><select id="nk-forn" aria-label="Fornitore"><option value="">—</option>${(a.forn||[]).map(f=>`<option>${esc(f.nome)}</option>`).join("")}</select>
            <input id="nk-nota" placeholder="Nota" aria-label="Nota"><button class="btn btn-sm" data-act="costo-add" data-c="${esc(c)}">+ Registra</button></div>`}</div>
        ${a.f==null&&a.pn==null&&!(a.forn||[]).length?UI.nota("Nella versione pubblica fornitori e prezzi del file sono esclusi."):""}`; },
    info:()=>`<div class="art-grp"><div class="eyebrow">Giacenza</div><div class="fgrid g4">${f("giacenza","Giacenza fisica","1","pz")}</div>
        <p class="small muted">${a.giacenzaIl?`Ultimo conteggio: ${esc(a.giacenzaIl)}`:"Mai contata: va allineata articolo per articolo prima del nuovo magazzino."}</p>
        ${ro||a.giacenza==null?"":`<div><button class="btn btn-sm" data-act="giac-ok" data-c="${esc(c)}">Conferma il conteggio di oggi</button></div>`}</div>
      <div class="art-grp"><div class="eyebrow">Codice</div><p class="small"><span class="mono">${esc(c)}</span> — classe ${esc(CODICI1[a.k1]||"?")} · sottoclasse ${esc(CODICI2[a.k1+"|"+a.k2]||"?")} · materiale ${esc(a.mat||"?")} · colore ${esc(a.cc||"?")}</p>
        ${a.dup?UI.nota("Questo codice compare su più righe del file: va reso univoco prima della pubblicazione (vedi Import)."):""}</div>
      <div class="art-grp"><div class="eyebrow">Storico modifiche · ${(a.storico||[]).length}</div>${(a.storico||[]).slice().reverse().map(h=>`<div class="small"><span class="mono tiny muted">${h.q}</span> ${esc(h.chi)} — ${esc(h.n)}</div>`).join("")||'<p class="small muted">Nessuna modifica: dati originali.</p>'}</div>`
  };
  const schede=`<div class="tabbar" role="tablist">${SCHEDE_ART.map(([k,l])=>`<button role="tab" data-act="tab" data-k="atab" data-v="${k}" aria-selected="${tab===k}">${l}${mancaIn(k)?`<span class="tab-n warn" title="${mancaIn(k)} dati mancanti">${mancaIn(k)}</span>`:""}${k==="comp"&&a.comp?.length?`<span class="tab-n">${a.comp.length}</span>`:""}</button>`).join("")}</div>`;
  const foot=`<button class="btn" data-act="close-drawer">Chiudi</button><span class="grow"></span>${ro?"":`<button class="btn btn-ghost" data-act="ai" data-c="${esc(c)}">${icon("spark",15)} Arricchisci con AI</button>
      ${a.stato==="revisione"&&state.ruolo==="curatore"?`<button class="btn" data-act="scarta" data-c="${esc(c)}">Rimanda</button><button class="btn btn-primary" data-act="approva" data-c="${esc(c)}">Approva e pubblica</button>`:a.stato!=="pubblicato"&&a.stato!=="revisione"?`<button class="btn btn-primary" data-act="invia" data-c="${esc(c)}">Invia in revisione</button>`:""}`}`;
  fillDrawer(`${a.b} · ${cap(a.k1)} › ${cap(a.k2)}`,a.t||a.d,`<div class="art">${riep}<section class="art-main">${schede}<div class="art-pane">${corpo[tab]()}</div></section></div>`,foot);
}
const FORNITORI=()=>[...new Set(ARTICOLI().map(conOv).flatMap(x=>(x.forn||[]).map(f=>f.nome)))].sort();
const suggerisciComp=a=>{const parola=(a.t||a.d).split(/\s+/).find(w=>w.length>3&&!/poltrona|divano|pouf|tavolo|sedia/i.test(w))||"";
  return ARTICOLI().map(conOv).filter(x=>x.b!==a.b&&(x.tipo==="componente"||/piano|gamba|telo|zavorr|cuscin/i.test(x.d))&&(!parola||x.d.toLowerCase().includes(parola.toLowerCase())||x.k1===a.k1)).slice(0,40);};

/* ---------- AI simulata ---------- */
const KW=[[/pallet|legno|rustic|botte|cassett/i,"Rustico"],[/ferro|metall|industr|acciaio|corten/i,"Industrial"],[/velluto|oro|ottone|crist|specchi/i,"Luxury"],[/bamb|rattan|vimini|midollino|juta|paglia/i,"Boho"],[/tropic|palm|jungle|mare|righe/i,"Tropicale"],[/vintage|retr|anni/i,"Vintage"],[/bianc|minimal|plexi|metacril/i,"Minimal"],[/shabby|provenz|decap/i,"Shabby chic"]];
const FUNZ_K1={SEDUTE:["Seduta"],TAVOLI:["Appoggio / tavolo"],BANCONI:["Bar e catering"],LUCI:["Illuminazione"],"MISE EN PLACE":["Mise en place"],COPERTURE:["Copertura"],TESSUTI:["Tessili"],CUSCINI:["Tessili","Seduta"],"VASI E PIANTE":["Decorazione e scenografia"],"PAVIMENTI E TAPPETI":["Pedane e palchi","Decorazione e scenografia"],ACCESSORI:["Accoglienza"],MOBILI:["Contenitore / espositore"],BAMBINI:["Decorazione e scenografia"]};
function aiProponi(a,nota=""){
  const testo=[a.t,a.d,a.e,nota,nomeColore(a.cc),nomeMateriale(a.mat||"")].join(" ");
  const stili=[...new Set(KW.filter(([r])=>r.test(testo)).map(x=>x[1]))]; if(!stili.length) stili.push("Contemporaneo");
  const temi=new Set(); if(stili.includes("Luxury")) temi.add("Gala").add("Matrimonio"); if(stili.includes("Rustico")) temi.add("Garden party").add("Matrimonio");
  if(stili.some(s=>["Tropicale","Boho"].includes(s))) temi.add("Estivo / beach"); if(/ross|oro|verde bott/i.test(nomeColore(a.cc))) temi.add("Natalizio"); temi.add("Aziendale / convention");
  const attr=[]; if(/sedia|sgabello|bicchier|piatt|calic/i.test(testo)) attr.push("Impilabile"); if(/ester|giardin|outdoor|polipropil|ombrell/i.test(testo)) attr.push("Per esterni"); if(/lampad|luce|led|frigo/i.test(testo)) attr.push("Richiede corrente");
  const mis=a.L?`Misure ${a.L}×${a.P}${a.H?"×"+a.H:""} cm.`:a.D?`Diametro ${a.D} cm${a.H?", altezza "+a.H+" cm":""}.`:"";
  const e=`${a.t||a.d}${a.mat?" in "+nomeMateriale(a.mat).toLowerCase():""}${a.cc?", colore "+nomeColore(a.cc).toLowerCase():""}. ${a.e&&a.e.length>20?a.e.replace(/\s+$/,"")+" ":""}${mis} ${nota?"Note del censitore: "+nota+". ":""}Adatto ad allestimenti in stile ${stili.join(", ").toLowerCase()}, in particolare per ${[...temi].slice(0,3).join(", ").toLowerCase()}.`.replace(/\s+/g," ").trim();
  return {e,stili,temi:[...temi],funz:FUNZ_K1[a.k1]||[],attr};
}
/* colori reali dalla foto: k-means sui pixel centrali, si scarta il cluster dello sfondo (bordi) */
function coloriDaImmagine(img){
  const N=64, cv=document.createElement("canvas"); cv.width=cv.height=N; const x=cv.getContext("2d",{willReadFrequently:true}); x.drawImage(img,0,0,N,N);
  const d=x.getImageData(0,0,N,N).data, px=[], bordo=[];
  for(let y=0;y<N;y++) for(let i=0;i<N;i++){const k=(y*N+i)*4, p=[d[k],d[k+1],d[k+2]]; (y<3||y>N-4||i<3||i>N-4?bordo:px).push(p);}
  const K=5; let c=Array.from({length:K},(_,i)=>px[Math.floor(i*px.length/K)]); let lab=[];
  for(let it=0;it<10;it++){ lab=px.map(p=>c.reduce((b,q,j)=>{const dd=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2; return dd<b[1]?[j,dd]:b;},[0,1e9])[0]);
    c=c.map((q,j)=>{const m=px.filter((_,i)=>lab[i]===j); return m.length?[0,1,2].map(t=>m.reduce((s,p)=>s+p[t],0)/m.length):q;}); }
  const bg=[0,1,2].map(t=>bordo.reduce((s,p)=>s+p[t],0)/bordo.length);
  const cl=c.map((q,j)=>({q,n:lab.filter(l=>l===j).length})).filter(o=>Math.hypot(...o.q.map((v,i)=>v-bg[i]))>40);
  const tot=cl.reduce((s,o)=>s+o.n,0)||1;
  return cl.sort((a,b)=>b.n-a.n).slice(0,3).map(o=>({hex:rgb2hex(o.q),rgb:o.q.map(Math.round),pct:Math.round(o.n/tot*100)}));
}
/* "Nano Banana" simulato: oggetto centrato su sfondo pulito con ombra, secondo il prompt */
function presentazione(img,prompt){
  const S=640, cv=document.createElement("canvas"); cv.width=cv.height=S; const x=cv.getContext("2d");
  const amb=/giardin|ambient/i.test(prompt), grigio=/grigio|ombra/i.test(prompt);
  const g=x.createLinearGradient(0,0,0,S); if(amb){g.addColorStop(0,"#dfe9d6");g.addColorStop(1,"#9fb98a");} else if(grigio){g.addColorStop(0,"#f4f4f2");g.addColorStop(1,"#dcdcd8");} else {g.addColorStop(0,"#fff");g.addColorStop(1,"#f6f6f6");}
  x.fillStyle=g; x.fillRect(0,0,S,S);
  const r=Math.min(S*.78/img.width,S*.78/img.height), w=img.width*r, h=img.height*r;
  x.save(); x.shadowColor="rgba(0,0,0,.22)"; x.shadowBlur=30; x.shadowOffsetY=16; x.drawImage(img,(S-w)/2,(S-h)/2-10,w,h); x.restore();
  x.fillStyle="rgba(0,0,0,.45)"; x.font="12px system-ui"; x.fillText("simulazione Nano Banana",12,S-12);
  return cv.toDataURL("image/jpeg",.85);
}
const caricaImg=src=>new Promise((ok,ko)=>{const i=new Image(); i.onload=()=>ok(i); i.onerror=ko; i.src=src;});
const leggiFile=f=>new Promise(ok=>{const r=new FileReader(); r.onload=()=>ok(r.result); r.readAsDataURL(f);});
/* foto di esempio (nessuna foto reale nel progetto): un pouf disegnato su fondo grigio */
function fotoEsempio(){const cv=document.createElement("canvas"); cv.width=640; cv.height=480; const x=cv.getContext("2d");
  x.fillStyle="#9a9a96"; x.fillRect(0,0,640,480); x.fillStyle="#7d7c78"; x.fillRect(0,330,640,150);
  x.fillStyle="#d4a017"; x.beginPath(); x.ellipse(320,250,150,110,0,0,Math.PI*2); x.fill();
  x.fillStyle="#b88a10"; x.beginPath(); x.ellipse(320,180,140,45,0,0,Math.PI*2); x.fill();
  x.strokeStyle="#7a5a08"; x.lineWidth=4; for(let i=-2;i<=2;i++){x.beginPath(); x.moveTo(320+i*55,170); x.quadraticCurveTo(320+i*62,260,320+i*50,350); x.stroke();}
  return cv.toDataURL("image/jpeg",.9);}

/* ---------- PROMPT ---------- */
const PROMPT_STD=[
  {id:"bianco",n:"Sfondo bianco da catalogo",t:"Scontorna l'oggetto e posizionalo al centro su sfondo bianco puro (#FFFFFF), luce diffusa da studio, ombra di contatto leggera. Non modificare forma, proporzioni, colori, materiali o dettagli dell'oggetto. Inquadratura frontale tre quarti, formato quadrato."},
  {id:"ombra",n:"Ombra morbida su grigio chiaro",t:"Scontorna l'oggetto e presentalo su fondo grigio chiaro uniforme con ombra morbida realistica. Non alterare forma, colori e materiali. Formato quadrato, oggetto all'80% dell'inquadratura."},
  {id:"giardino",n:"Ambientato in un giardino",t:"Inserisci l'oggetto, identico all'originale, in un giardino curato al tramonto, come allestimento per un evento all'aperto. L'oggetto resta protagonista e in primo piano; non cambiarne colori né proporzioni."},
  {id:"scheda",n:"Scheda tecnica con misure",t:"Scontorna l'oggetto su fondo bianco e aggiungi quote di larghezza, profondità e altezza con linee sottili grigie, secondo le misure indicate nella descrizione. Stile tecnico pulito."}];
const prompts=()=>[...PROMPT_STD.map(p=>({...p,std:true})),...DB.prompt.map((p,i)=>({...p,i}))];
function viewPrompt(){
  const cur=state.ruolo==="curatore", righe=UI.filtra("prompt",prompts(),p=>p.n+" "+p.t,{tipo:p=>p.std?"Standard":"Personale"});
  return UI.pannello({titolo:"Prompt per le foto di presentazione",aiuto:"vista-prompt",
    corpo:`<div class="card-body dt-filtri">${UI.filtri({id:"prompt",cerca:"Cerca nome o testo…",segmenti:[{nome:"tipo",etichetta:"Tipo",voci:[["","Tutti",prompts().length],["Standard","Standard",PROMPT_STD.length],["Personale","Personali",DB.prompt.length]]}]})}</div>
      ${UI.datatable({id:"prompt",righe,vuoto:"Nessun prompt",colonne:[{key:"n",t:"Nome",cella:p=>`<strong>${esc(p.n)}</strong>`},{key:"tipo",t:"Tipo",tipo:"stato",valore:p=>p.std?"Standard":"Personale",cella:p=>UI.stato(p.std?"Standard":"Personale",p.std?"ok":"info")},
        {key:"autore",t:"Autore",valore:p=>p.std?"—":p.autore||"—"},{key:"t",t:"Testo",sort:false,cella:p=>`<span class="small">${esc(p.t)}</span>`},
        {key:"az",t:"Azioni",sort:false,cella:p=>p.std||!cur?"—":`<div class="row" style="gap:4px"><button class="btn btn-sm" data-act="prompt-edit" data-i="${p.i}">Modifica</button><button class="btn btn-sm btn-ghost" data-act="prompt-del" data-i="${p.i}" style="color:var(--err)">Elimina</button></div>`}]})}`,
    piede:"Ogni immagine generata conserva prompt, modello, data e autore. Modello: Nano Banana (Gemini 2.5 Flash Image), da valutare su Vertex AI in region UE; nel prototipo l'immagine è imitata nel browser."});
}
/* dialog di inserimento/modifica: stessa struttura dei dialog anagrafica della Logistica */
function dialogPrompt(i=-1){
  const p=i>=0?DB.prompt[i]:{n:"",t:PROMPT_STD[0].t};
  const d=document.createElement("dialog"); d.className="form"; d.id="promptDlg";
  d.innerHTML=`<div class="dlg-head"><h2 class="grow">${i<0?"Nuovo":"Modifica"} prompt</h2></div>
    <div class="dlg-body"><div class="fgrid">${UI.campo({id:"np-n",etichetta:"Nome",valore:p.n,pieno:true})}
      ${i<0?`<div class="full"><label class="fl" for="np-base">Parti da</label><select id="np-base">${PROMPT_STD.map((x,k)=>`<option value="${k}">${esc(x.n)}</option>`).join("")}</select></div>`:""}
      ${UI.campo({id:"np-t",etichetta:"Testo del prompt",valore:p.t,tipo:"textarea",pieno:true})}</div></div>
    <div class="dlg-foot"><button class="btn" data-act="dlg-close">Annulla</button><button class="btn btn-primary" data-act="prompt-save" data-i="${i}">${i<0?"Crea":"Salva"}</button></div>`;
  document.body.append(d); d.addEventListener("close",()=>d.remove()); showDlg(d); $("np-n").focus();
}

/* ---------- CENSIMENTO (telefono) ---------- */
function viewCensimento(){
  return `<div class="cens"><div class="phone"><div class="phone-notch"></div><div class="phone-scr" id="mob">${mobile()}</div></div>
    ${UI.pannello({titolo:"Come funziona",aiuto:"vista-censimento",corpo:`<div class="card-body"><ol class="small steps-l"><li><strong>Scegli</strong>: nuovo articolo, completa un esistente, aggiungi solo foto.</li><li><strong>Scatta</strong> una o più foto (dal telefono si apre la fotocamera).</li><li>Una <strong>nota facoltativa</strong> e il <strong>prompt</strong> per la foto di presentazione.</li>
      <li>L'AI produce: foto di presentazione (Nano Banana), descrizione dettagliata, fino a 3 colori RGB, funzione, stili, temi (LLM). Propone anche gli articoli simili per evitare doppioni.</li><li><strong>Invii in revisione</strong>: il curatore approva da computer.</li></ol>
      ${UI.nota("I colori sono calcolati davvero dai pixel della foto; immagine di presentazione e descrizione sono imitate. Senza rete le foto resterebbero in coda sul telefono.")}</div>`,
      piede:"Su un telefono vero questa schermata occupa tutto lo schermo: è la stessa applicazione, con lo stesso accesso.",classe:"cens-note"})}</div>`;
}
const M=()=>state.mob;
function mobile(){
  const m=M(), head=(t,back=true)=>`<div class="m-head">${back?`<button class="m-back" data-act="m-back" aria-label="Indietro">‹</button>`:""}<strong>${t}</strong></div>`;
  if(m.step===0) return `${head("Censisci",false)}<div class="m-body"><p class="small muted">Cosa vuoi fare?</p>
    ${[["nuovo","Nuovo articolo","Un oggetto che non è in catalogo"],["completa","Completa un articolo","Foto, misure, componenti di un articolo esistente"],["foto","Solo foto","Aggiungi foto a un articolo"]].map(([k,t,d])=>`<button class="m-opt" data-act="m-mode" data-v="${k}"><strong>${t}</strong><span class="small muted">${d}</span></button>`).join("")}
    <div class="m-coda"><span class="tiny muted">In coda (senza rete): 0</span></div></div>`;
  if(m.step===1&&m.mode!=="nuovo"&&!m.target){ const q=(m.q||"").toLowerCase(), r=q.length>1?gruppi().filter(g=>g.some(a=>(a.c+" "+a.d+" "+a.t).toLowerCase().includes(q))).slice(0,12):[];
    return `${head("Quale articolo?")}<div class="m-body"><input type="search" id="m-q" placeholder="Cerca per nome o codice…" value="${esc(m.q||"")}" data-mq="1" aria-label="Cerca articolo">
      <div class="m-list">${r.map(g=>`<button class="m-it" data-act="m-target" data-c="${esc(g[0].c)}">${ph(g[0],"xs")}<span><strong>${esc(g[0].t||g[0].d)}</strong><span class="tiny muted mono">${esc(g[0].b)} · ${g.length} var.</span></span></button>`).join("")||`<p class="small muted">${q.length>1?"Nessun risultato":"Scrivi almeno due lettere"}</p>`}</div></div>`; }
  if(m.step===1) return `${head(m.mode==="nuovo"?"Nuovo articolo":"Foto per "+(art(m.target)?.d||""))}<div class="m-body">
    <label class="m-shot">${icon("cam",34)}<strong>Scatta o scegli foto</strong><input type="file" accept="image/*" capture="environment" multiple id="m-file" class="sr"></label>
    <button class="btn btn-sm" data-act="m-demo">Usa una foto di esempio</button>
    <div class="m-thumbs">${(m.foto||[]).map((f,i)=>`<div class="m-th"><img src="${f}" alt=""><button data-act="m-rmfoto" data-i="${i}" aria-label="Togli foto">×</button></div>`).join("")}</div>
    ${m.foto?.length?`<button class="btn btn-primary m-next" data-act="m-step" data-v="2">Avanti</button>`:""}</div>`;
  if(m.step===2){ const p=prompts(), cur=m.pid??0;
    return `${head("Dettagli")}<div class="m-body"><label class="fl" for="m-nota">Nota (facoltativa)</label><textarea id="m-nota" placeholder="Es. pouf in velluto senape, cuciture a spicchi, fodera sfilabile" data-mn="1">${esc(m.nota||"")}</textarea>
      <label class="fl" for="m-p" style="margin-top:10px">Foto di presentazione</label><select id="m-p" data-mp="1">${p.map((x,i)=>`<option value="${i}"${i===cur?" selected":""}>${esc(x.n)}</option>`).join("")}<option value="-1"${cur===-1?" selected":""}>Nessuna elaborazione</option></select>
      ${cur>=0?UI.piegabile({titolo:"Modifica il prompt",corpo:`<textarea id="m-pt" data-mpt="1" aria-label="Testo del prompt">${esc(m.ptesto??p[cur].t)}</textarea>`}):""}
      <button class="btn btn-primary m-next" data-act="m-elabora">${icon("spark",16)} Elabora con AI</button></div>`; }
  if(m.step===3) return `${head("Elaborazione",false)}<div class="m-body m-wait"><div class="spin"></div><p class="small">${m.msg||"Invio foto…"}</p></div>`;
  if(m.step===4){ const r=m.res;
    return `${head("Proposta")}<div class="m-body"><div class="m-imgs"><figure><img src="${m.foto[0]}" alt=""><figcaption class="tiny">originale</figcaption></figure>${r.pres?`<figure><img src="${r.pres}" alt=""><figcaption class="tiny">presentazione</figcaption></figure>`:""}</div>
      <div class="eyebrow">Colori rilevati</div><div class="row wrap">${r.rgb.map(c=>`${sw(c.hex,"",true)}<span class="mono tiny">${c.hex} ${c.pct}%</span>`).join("")}</div>
      <p class="tiny muted">Codice aziendale più vicino: <strong>${r.cc} ${esc(nomeColore(r.cc))}</strong></p>
      ${m.mode==="nuovo"&&r.simili.length?`<div class="m-sim"><div class="eyebrow">È uno di questi?</div>${r.simili.map(g=>`<button class="m-it" data-act="m-simile" data-c="${esc(g[0].c)}">${ph(g[0],"xs")}<span><strong>${esc(g[0].t||g[0].d)}</strong><span class="tiny muted">${g.length} varianti · aggiungi come variante o foto</span></span></button>`).join("")}</div>`:""}
      ${m.mode==="nuovo"?`<div class="fgrid one">${UI.campo({id:"m-t",etichetta:"Nome",valore:r.t,attr:'data-mr="t"'})}
        <div><label class="fl" for="m-k1">Classe</label><select id="m-k1" data-mr="k1">${CLASSI1.map(k=>`<option value="${esc(k)}"${k===r.k1?" selected":""}>${esc(cap(k))}</option>`).join("")}</select></div>
        <div><label class="fl" for="m-k2">Sottoclasse</label><select id="m-k2" data-mr="k2">${classi2(r.k1).map(k=>`<option value="${esc(k)}"${k===r.k2?" selected":""}>${esc(cap(k))}</option>`).join("")}</select></div></div>`:""}
      <div class="eyebrow" style="margin-top:8px">Descrizione</div><p class="small">${esc(r.e)}</p>
      <div class="row wrap" style="gap:4px">${[...r.funz,...r.stili,...r.temi].map(x=>UI.stato(x,"info")).join("")}</div>
      <button class="btn btn-primary m-next" data-act="m-invia">Invia in revisione</button></div>`; }
  return `${head("Fatto",false)}<div class="m-body m-wait"><div class="m-ok">${icon("check",40)}</div><p><strong>Inviato in revisione</strong></p><p class="small muted">${esc(m.fatto||"")}</p>
    <button class="btn" data-act="m-apri">Apri la scheda</button><button class="btn btn-primary" data-act="m-reset">Censisci un altro</button></div>`;
}
function rm(){ const el=$("mob"); if(el) el.innerHTML=mobile(); }
const simili=(testo,k1,cc)=>{const w=testo.toLowerCase().split(/[^a-zàèéìòù0-9]+/).filter(x=>x.length>3); if(!w.length) return [];
  return gruppi().map(g=>[g,w.filter(x=>(g[0].t+" "+g[0].d+" "+g[0].k3).toLowerCase().includes(x)).length+(g[0].k1===k1?.5:0)+(cc&&g.some(x=>x.cc===cc)?1:0)]).filter(x=>x[1]>=1).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);};
const indovinaClasse=t=>{t=t.toLowerCase(); const c=CAT.classi.find(x=>t.includes(String(x[5]).toLowerCase().replace(/e$|i$/,"")))||CAT.classi.find(x=>t.includes(String(x[3]).toLowerCase().slice(0,5)));
  return c?[c[1],c[3]]:["SEDUTE",classi2("SEDUTE")[0]];};
async function elabora(){
  const m=M(); m.step=3; m.msg="Lettura della foto…"; rm();
  const img=await caricaImg(m.foto[0]), p=prompts()[m.pid??0];
  await new Promise(r=>setTimeout(r,500)); m.msg="Nano Banana: foto di presentazione…"; rm();
  const pres=(m.pid??0)>=0?presentazione(img,(m.ptesto??p?.t)||""):null;
  await new Promise(r=>setTimeout(r,600)); m.msg="LLM: descrizione, colori e temi…"; rm();
  const rgb=coloriDaImmagine(img), cc=rgb.length?vicino(rgb[0].rgb):"96";
  const base=m.target?art(m.target):(()=>{const [k1,k2]=indovinaClasse(m.nota||""); return {t:(m.nota||"Nuovo articolo").split(/[,.]/)[0].replace(/^\w/,c=>c.toUpperCase()).slice(0,40),d:"",e:"",k1,k2,cc};})();
  const ai=aiProponi({...base,cc},m.nota||"");
  await new Promise(r=>setTimeout(r,500));
  m.res={pres,rgb,cc,...ai,t:base.t||base.d,k1:base.k1,k2:base.k2,simili:m.mode==="nuovo"?simili(m.nota||"",base.k1,cc):[]}; m.step=4; rm();
}
function inviaCensimento(){
  const m=M(), r=m.res, fn=[{orig:m.foto[0],pres:r.pres,prompt:r.pres?(prompts()[m.pid??0]?.n||"prompt"):null,main:true},...m.foto.slice(1).map(f=>({orig:f}))];
  const rgb=r.rgb.map(({hex,pct})=>({hex,pct}));
  if(m.target){ const a=art(m.target);
    setArt(m.target,{fotoNuove:[...(a.fotoNuove||[]).map(x=>({...x,main:false})),...fn],...(m.mode==="foto"?{}:{e:r.e,rgb,stili:r.stili,temi:r.temi,funz:r.funz,attr:r.attr,ai:true}),stato:m.mode==="foto"?a.stato:"revisione"},m.mode==="foto"?"foto aggiunte da telefono":"completato da telefono con AI");
    m.fatto=`${a.t||a.d}: ${fn.length} foto${m.mode==="foto"?"":" e scheda proposta"}`; m.nuovo=m.target;
  } else {
    const k1=$("m-k1")?.value||r.k1, k2=$("m-k2")?.value||r.k2, t=$("m-t")?.value||r.t;
    const x1=CODICI1[k1]||"XX", x2=CODICI2[k1+"|"+k2]||"XXX", mat="99";
    const usati=ARTICOLI().filter(a=>a.c.startsWith(x1+x2+mat)).map(a=>+a.c.slice(7,10)), prg=pad(Math.max(0,...usati)+1).padStart(3,"0");
    const c=`${x1}${x2}${mat}${prg}-${r.cc}`;
    const nuovo={c,b:c.split("-")[0],d:t.slice(0,40),t,e:r.e,k1,k2,k3:classi3(k1,k2)[0]||"",cc:r.cc,mat,um:"NR",nuovo:true,fotoNuove:fn,rgb,stili:r.stili,temi:r.temi,funz:r.funz,attr:r.attr,ai:true,stato:"revisione",storico:[{q:oggi(),chi:RUOLO_N[state.ruolo],n:"censito da telefono"}]};
    DB.nuovi.push(nuovo); save(); m.fatto=`Codice proposto ${c} (materiale da definire: 99)`; m.nuovo=c;
  }
  m.step=5; toast("Inviato in revisione"); render();
}

/* ---------- REVISIONE ---------- */
function viewRevisione(){
  const l=ARTICOLI().map(conOv).filter(a=>a.stato==="revisione"), cur=state.ruolo==="curatore";
  const ori=a=>a.nuovo?"Nuovo":"Esistente", righe=UI.filtra("rev",l,a=>[a.c,a.t,a.d,a.e].join(" "),{ori,ai:a=>a.ai?"AI":"Manuale"});
  const ultimo=a=>a.storico?.at(-1)||{};
  return UI.pannello({titolo:`${l.length} schede da revisionare`,aiuto:"vista-revisione",
    corpo:`<div class="card-body dt-filtri">${UI.filtri({id:"rev",cerca:"Cerca codice o descrizione…",segmenti:[{nome:"ori",etichetta:"Origine",voci:[["","Tutte",l.length],["Nuovo","Nuovi",l.filter(a=>a.nuovo).length],["Esistente","Esistenti",l.filter(a=>!a.nuovo).length]]},{nome:"ai",etichetta:"Proposta",voci:[["","Tutte"],["AI","Da AI",l.filter(a=>a.ai).length],["Manuale","Manuali",l.filter(a=>!a.ai).length]]}]})}</div>
      ${UI.datatable({id:"rev",righe,vuoto:"Coda vuota",suggerimento:"Le schede arrivano qui dal censimento da telefono o con «Arricchisci con AI» + «Invia in revisione».",riga:a=>({act:`data-act="apri" data-c="${esc(a.c)}"`}),colonne:[
        {key:"ph",t:"Foto",sort:false,cella:a=>ph(a,"xs")},{key:"t",t:"Articolo",valore:a=>a.t||a.d,cella:a=>`<strong>${esc(a.t||a.d)}</strong><div class="mono tiny muted">${esc(a.c)}</div>`},
        {key:"ori",t:"Origine",tipo:"stato",valore:ori,cella:a=>UI.stato(ori(a),a.nuovo?"info":"")+(a.ai?" "+UI.stato("proposta AI","warn"):"")},
        {key:"e",t:"Descrizione",sort:false,cella:a=>`<span class="small">${esc((a.e||"").slice(0,140))}${(a.e||"").length>140?"…":""}</span>`},
        {key:"q",t:"Inviata",valore:a=>ultimo(a).q||"",cella:a=>`<span class="small">${esc(ultimo(a).chi||"")}</span><div class="mono tiny muted">${esc(ultimo(a).q||"")}</div>`},
        {key:"az",t:"Azioni",sort:false,cella:a=>cur?`<div class="row" style="gap:4px"><button class="btn btn-sm btn-primary" data-act="approva" data-c="${esc(a.c)}">Approva</button><button class="btn btn-sm btn-ghost" data-act="scarta" data-c="${esc(a.c)}">Rimanda</button></div>`:"—"}]})}`});
}

/* ---------- IMPORT ---------- */
const ANOMALIE={duplicati:["Codice duplicato","Lo stesso codice compare su più righe","Decidere quale riga tenere o assegnare un nuovo codice colore"],
  fuori_schema:["Codice fuori schema","Non rispetta XXFFFprprg-CC","Ricodificare"],breve_lunga:["Descrizione breve oltre 40 caratteri","Il tracciato ERP ammette 40 caratteri","Accorciare: il resto va nel titolo o nella descrizione estesa"],
  dimensioni:["Dimensioni non leggibili","Testo non interpretabile come misure","Misurare o correggere il testo"],coperture:["Copertura o fodera","È il rivestimento di un altro articolo","Collegarla come componente «rivestimento» dell'articolo principale"],
  foto_codice:["Foto di un altro codice","Il nome del file foto non inizia con il codice dell'articolo","Rinominare la foto o collegarla all'articolo giusto"]};
function viewImport(){
  const A=CAT.anomalie, g=gruppi(), multi=g.filter(x=>x.length>1).length, dimOk=CAT.articoli.filter(a=>a.L||a.D).length;
  const tutte=[...Object.entries(A).flatMap(([k,l])=>(l||[]).map(c=>({c,k,a:art(c)}))),...CAT.articoli.filter(a=>fotoFuori(a).length).map(a=>({c:a.c,k:"foto_codice",a:conOv(a)}))], campi={k:r=>r.k};
  const righe=UI.filtra("imp",tutte,r=>[r.c,r.a?.d,ANOMALIE[r.k]?.[0]].join(" "),campi);
  return `<section class="kpis">${UI.kpi(num(CAT.articoli.length,0),"articoli importati")}${UI.kpi(num(multi,0),"modelli con varianti di colore")}${UI.kpi(Math.round(dimOk/(CAT.articoli.length||1)*100)+"%","dimensioni leggibili")}${UI.kpi(num(tutte.length,0),"anomalie",["da sistemare","warn"])}</section>
    ${UI.pannello({titolo:"Dal file al catalogo",corpo:`<div class="card-body">${UI.dettagli([["File","<span class='mono'>Articoli_13_10_25_rev2_mod.xlsx</span>"],["Codice","spazi rimossi; dal codice si ricavano classe, sottoclasse, <strong>materiale</strong> e <strong>colore</strong>"],
      ["Varianti","stesso codice prima di «-CC» → stesso modello; «-CC» è la variante di colore"],["Dimensioni","testo libero convertito in L/P/H/Ø dove possibile, il resto va misurato"],["Foto","solo i nomi file: la cartella immagini va caricata"],
      ["Nuovi campi","volume e peso, impilabilità, tempi, componenti, colori RGB, funzione, stili, temi: vuoti per tutti, da completare"]])}</div>`})}
    ${UI.pannello({titolo:"Anomalie trovate",aiuto:"vista-importa",corpo:`<div class="card-body dt-filtri">${UI.filtri({id:"imp",cerca:"Cerca codice o descrizione…",segmenti:[{nome:"k",etichetta:"Tipo",voci:[["","Tutte",UI.conta("imp",tutte,r=>[r.c,r.a?.d].join(" "),campi,"k")],...Object.keys(ANOMALIE).map(k=>[k,ANOMALIE[k][0],UI.conta("imp",tutte,r=>[r.c,r.a?.d].join(" "),campi,"k",k)])]}]})}</div>
      ${UI.datatable({id:"imp",righe,vuoto:"Nessuna anomalia",riga:r=>r.a?{act:`data-act="apri" data-c="${esc(r.c)}"`}:{},colonne:[{key:"c",t:"Codice",mono:true},{key:"d",t:"Articolo",valore:r=>r.a?.t||r.a?.d||"",cella:r=>esc(r.a?.t||r.a?.d||"—")},
        {key:"k",t:"Anomalia",tipo:"stato",valore:r=>ANOMALIE[r.k]?.[0]||r.k,cella:r=>UI.stato(ANOMALIE[r.k]?.[0]||r.k,"warn",ANOMALIE[r.k]?.[1])},{key:"az",t:"Cosa fare",sort:false,cella:r=>`<span class="small">${esc(ANOMALIE[r.k]?.[2]||"")}</span>`}]})}`})}`;
}

/* ---------- API ---------- */
function viewApi(){
  const a=art(state.sel||"SEPOU83006-11")||CAT.articoli[0], ex={codice:a.c,modello:a.b,nome:a.t||a.d,descrizione:a.e,classificazione:[a.k1,a.k2,a.k3],colore:{codice:a.cc,nome:nomeColore(a.cc),rgb:a.rgb||[]},materiale:a.mat?{codice:a.mat,nome:nomeMateriale(a.mat)}:null,
    tipo:a.tipo,dimensioni_cm:{L:a.L,P:a.P,H:a.H,D:a.D},logistica:{volume_m3:a.vol??(a.L&&a.P&&a.H?+(a.L*a.P*a.H/1e6).toFixed(3):null),volume_stimato:!a.vol,peso_kg:a.peso??null,pezzi_per_pila:a.pila??null,persone:a.pers??null},prezzi:a.prezzi,fornitori:(a.forn||[]).map(f=>({nome:f.nome,codice:f.codice||null,principale:!!f.principale})),giacenza_fisica:a.giacenza??null,funzione:a.funz||[],stili:a.stili||[],temi:a.temi||[],componenti:a.comp||[],
    varianti:(gruppi().find(g=>g.some(x=>x.c===a.c))||[]).map(x=>x.c),foto:(a.foto||[]).map(f=>"https://…/foto/"+f),stato:statoArt(a)[0]};
  return `<div class="ptwo">${UI.pannello({titolo:"API REST (sola lettura)",aiuto:"vista-api",corpo:UI.tabella({colonne:[{t:"Metodo"},{t:"Percorso",mono:true},{t:"Cosa restituisce"}],righe:[
      ["GET","/articoli","elenco con filtri: testo, classe, funzione, stile, tema, colore vicino a un RGB, stato, aggiornati dopo il…"],["GET","/articoli/{codice}","scheda completa con varianti, componenti, foto, misure"],
      ["GET","/articoli/{codice}/foto","foto originali e di presentazione"],["GET","/modelli/{codice}","modello con tutte le varianti di colore"],["GET","/tassonomie","categorie e sottocategorie in ordine, colori, materiali, funzioni, stili, temi"],["GET","/articoli/{codice}/logistica","volume, peso, L×P×H, pezzi per pila, persone, tempi: per dimensionare i mezzi"],["GET","/logistica/articoli?codici=…","gli stessi dati per tutte le righe di un'offerta, in una chiamata"],["GET","/fornitori, /fornitori/{id}/articoli","fornitori e articoli che forniscono, con codici e prezzi"],["GET","/export/erp","tracciato per l'ERP: il catalogo è la fonte, l'ERP riceve"],["POST","webhook","articolo.pubblicato / articolo.modificato / prezzo.modificato (anche verso l'ERP)"]].map(r=>[UI.stato(r[0],r[0]==="GET"?"ok":"info"),esc(r[1]),`<span class="small">${esc(r[2])}</span>`])}),
      piede:"Lettura: escono solo gli articoli pubblicati; prezzi d'acquisto e fornitori solo con le chiavi di ERP e amministrazione. Scrittura (CRUD di articoli, fornitori, composizioni, categorie): solo l'applicazione. Chiavi per sistema, registro degli accessi."})}
    ${UI.pannello({titolo:"Server MCP per gli agenti AI",corpo:UI.tabella({colonne:[{t:"Strumento",mono:true},{t:"Uso"}],righe:[["cerca_articoli","ricerca libera con filtri"],["dettaglio_articolo","scheda di un codice"],["articoli_per_tema","es. «matrimonio rustico all'aperto»"],["articoli_per_colore","vicini a un RGB o a un codice colore"],["composizione","componenti e configurazioni di un articolo"]].map(r=>[r[0],r[1]])})})}</div>
    ${UI.pannello({titolo:`Esempio: GET /articoli/${esc(a.c)}`,azioni:'<span class="small muted">apri un articolo dal catalogo per cambiarlo</span>',corpo:`<pre class="json">${esc(JSON.stringify(ex,null,2))}</pre>`})}`;
}

/* ---------- eventi ---------- */
const dopo=(msg,kind="")=>{ render(); if(msg) toast(msg,kind); };
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]"); if(!b) return; const v=b.dataset.v, c=b.dataset.c, m=M();
  switch(b.dataset.act){
    case "ruolo": state.ruolo=DB.ruolo=v; save(); state.view=VISIBILI[v][0]; render(); break;
    case "esci": state.ruolo=null; DB.ruolo=null; save(); closeDrawer(); render(); break;
    case "reset": if(await UI.conferma({titolo:"Azzerare le modifiche?",testo:"Si torna ai dati originali: articoli censiti, foto e modifiche fatte in questo browser vanno persi.",ok:"Azzera",pericolo:true})){ try{localStorage.removeItem(LS);}catch{} location.reload(); } break;
    case "view": state.view=v; closeDrawer(); if(v==="censimento"&&m.step===5) state.mob={step:0}; render(); $("view").scrollTop=0; break;
    case "tab": state[b.dataset.k]=v; render(); break;
    /* datatable e filtri: stesse azioni della Logistica */
    case "dt-sort": { const st=dtStato(b.dataset.dt), k=b.dataset.k; st.ord=st.ord?.key===k?(st.ord.dir==="asc"?{key:k,dir:"desc"}:null):{key:k,dir:"asc"}; st.pag=0; render(); break; }
    case "dt-pag": dtStato(b.dataset.dt).pag=+b.dataset.p; render(); $("view").scrollTop=0; break;
    case "dt-seg": { const st=dtStato(b.dataset.dt); st.seg[b.dataset.g]=b.dataset.v; st.pag=0; render(); break; }
    case "dt-reset": { const st=dtStato(b.dataset.dt); st.q=""; st.seg={}; st.pag=0; render(); break; }
    case "vista": state.vista=v; render(); break;
    case "propaga": dialogPropaga(c); break;
    case "cat-nav": { const st=dtStato("cat"); st.seg.k2=""; if(!v) st.seg.k1=""; st.q=""; st.pag=0; render(); break; }
    case "cat-pin": { const pin=DB.catOrd||[]; DB.catOrd=pin.includes(v)?pin.filter(x=>x!==v):[...pin,v]; save(); render(); break; }
    case "forn-add": { const n=$("nf-nome").value.trim(); if(!n) return toast("Scrivi il nome del fornitore","warn"); const a=art(c);
      if(a.forn.some(f=>f.nome.toLowerCase()===n.toLowerCase())) return toast("Questo fornitore c'è già","warn");
      setArt(c,{forn:[...a.forn,{nome:n,codice:$("nf-cod").value.trim(),acquisto:$("nf-pr").value===""?null:+$("nf-pr").value,condizioni:$("nf-cond").value.trim(),principale:!a.forn.length}]},`fornitore aggiunto: ${n}`); dopo("Fornitore aggiunto"); break; }
    case "forn-main": { const a=art(c); setArt(c,{forn:a.forn.map((f,i)=>({...f,principale:i===+b.dataset.i}))},"fornitore principale"); dopo("Fornitore principale aggiornato"); break; }
    case "forn-del": { const a=art(c), f=a.forn[+b.dataset.i]; if(!await UI.conferma({titolo:"Togliere il fornitore?",testo:`«${f.nome}» non sarà più tra i fornitori di questo articolo.`,ok:"Togli",pericolo:true})) return;
      const resto=a.forn.filter((_,i)=>i!==+b.dataset.i); if(f.principale&&resto[0]) resto[0]={...resto[0],principale:true}; setArt(c,{forn:resto},`fornitore tolto: ${f.nome}`); dopo("Fornitore tolto"); break; }
    case "costo-add": { const imp=$("nk-imp").value; if(imp===""||!$("nk-data").value) return toast("Data e importo sono obbligatori","warn"); const a=art(c);
      setArt(c,{costi:[...a.costi,{data:$("nk-data").value,tipo:$("nk-tipo").value,importo:+imp,fornitore:$("nk-forn").value,nota:$("nk-nota").value.trim()}]},"costo registrato"); dopo("Costo registrato"); break; }
    case "giac-ok": setArt(c,{giacenzaIl:oggi()},"conteggio confermato"); dopo("Conteggio confermato"); break;
    case "apri": apri(c); break;
    case "close-drawer": closeDrawer(); break;
    case "dlg-close": closeDlg(b.closest("dialog")); break;
    case "ai": { const a=art(c), p=aiProponi(a); setArt(c,{e:p.e,stili:p.stili,temi:p.temi,funz:p.funz,attr:[...new Set([...(a.attr||[]),...p.attr])],ai:true},"proposta AI (simulata)"); dopo("Proposta AI applicata: controllala e invia in revisione"); break; }
    case "invia": setArt(c,{stato:"revisione"},"inviato in revisione"); dopo("Inviato in revisione"); break;
    case "approva": setArt(c,{stato:"pubblicato",ai:false},"approvato e pubblicato"); dopo("Pubblicato: ora è visibile via API"); break;
    case "scarta": { const a=art(c); if(!await UI.conferma({titolo:"Rimandare la scheda?",testo:`«${a.t||a.d}» torna al censitore e esce dalla coda di revisione.`,ok:"Rimanda"})) return;
      setArt(c,{stato:""},"rimandato al censitore"); dopo("Scheda rimandata al censitore"); break; }
    case "usa-vol": setArt(c,{vol:+v},"volume dalle dimensioni"); dopo("Volume aggiornato"); break;
    case "add-comp": { const d=$("nc-desc").value.trim(); if(!d) return toast("Scrivi la descrizione o scegli un articolo","warn");
      const cod=d.split(" · ")[0], ka=art(cod), a=art(c); setArt(c,{comp:[...(a.comp||[]),{ruolo:$("nc-ruolo").value,q:+$("nc-q").value||1,...(ka?{cod}:{desc:d})}]},"componente aggiunto"); dopo("Componente aggiunto"); break; }
    case "rm-comp": { const a=art(c), k=a.comp[+b.dataset.i]; if(!await UI.conferma({titolo:"Togliere il componente?",testo:`«${art(k.cod)?.d||k.desc}» viene tolto dalla composizione.`,ok:"Togli",pericolo:true})) return;
      setArt(c,{comp:a.comp.filter((_,i)=>i!==+b.dataset.i)},"componente tolto"); dopo("Componente tolto"); break; }
    case "foto-main": { const a=art(c); setArt(c,{fotoNuove:a.fotoNuove.map((x,i)=>({...x,main:i===+b.dataset.i}))},"foto principale"); dopo("Foto principale aggiornata"); break; }
    case "foto-da": closeDrawer(); state.view="censimento"; state.mob={step:1,mode:"completa",target:c}; render(); break;
    case "prompt-new": dialogPrompt(); break;
    case "prompt-edit": dialogPrompt(+b.dataset.i); break;
    case "prompt-save": { const n=$("np-n").value.trim(), t=$("np-t").value.trim(), i=+b.dataset.i; if(!n||!t) return toast("Nome e testo sono obbligatori","warn");
      if(i>=0) Object.assign(DB.prompt[i],{n,t}); else DB.prompt.push({n,t,autore:RUOLO_N[state.ruolo]}); save(); closeDlg($("promptDlg")); dopo(i>=0?"Prompt aggiornato":"Prompt creato"); break; }
    case "prompt-del": { const i=+b.dataset.i; if(!await UI.conferma({titolo:"Eliminare il prompt?",testo:`Confermi l'eliminazione di «${DB.prompt[i].n}»?`,ok:"Elimina",pericolo:true})) return;
      DB.prompt.splice(i,1); save(); dopo("Prompt eliminato"); break; }
    /* telefono */
    case "m-mode": Object.assign(m,{mode:v,step:1,target:null,foto:[],nota:"",pid:0,ptesto:null}); rm(); break;
    case "m-back": if(m.step===1&&m.target&&m.mode!=="nuovo") m.target=null; else m.step=Math.max(0,m.step-1); rm(); break;
    case "m-target": m.target=c; rm(); break;
    case "m-demo": (m.foto=m.foto||[]).push(fotoEsempio()); if(!m.nota&&m.mode==="nuovo") m.nota="pouf velluto senape a spicchi"; rm(); break;
    case "m-rmfoto": m.foto.splice(+b.dataset.i,1); rm(); break;
    case "m-step": m.step=+v; rm(); break;
    case "m-elabora": elabora(); break;
    case "m-simile": Object.assign(m,{mode:"completa",target:c}); m.step=3; elabora(); break;
    case "m-invia": inviaCensimento(); break;
    case "m-apri": apri(m.nuovo); break;
    case "m-reset": state.mob={step:0}; rm(); break;
  }
});
document.addEventListener("change",async ev=>{
  const el=ev.target, m=M();
  if(el.dataset.f&&el.dataset.c){ const k=el.dataset.f, val=el.type==="number"?(el.value===""?null:+el.value):el.value;
    const patch={[k]:val}; if(k==="k1"){patch.k2=classi2(val)[0]; patch.k3=classi3(val,patch.k2)[0];} if(k==="k2") patch.k3=classi3(art(el.dataset.c).k1,val)[0];
    if(k==="giacenza") patch.giacenzaIl=oggi();
    return salvaCampo(el.dataset.c,patch,`${COMUNE[k]||k} modificato`); }
  if(el.dataset.prezzo&&el.dataset.c){ const a=art(el.dataset.c), k=el.dataset.prezzo, v=el.value===""?null:+el.value;
    if(v!=null&&v<0) return toast("Il prezzo non può essere negativo","warn");
    return salvaCampo(el.dataset.c,{prezzi:{...a.prezzi,[k]:v}},`prezzo di ${k}: ${v==null?"tolto":"€ "+num(v,2)}`,x=>({prezzi:{...x.prezzi,[k]:v}})); }
  if(el.dataset.tag&&el.dataset.c){ const a=art(el.dataset.c), f=el.dataset.tag, cur=a[f]||[];
    const tog=l=>el.checked?[...new Set([...(l||[]),el.value])]:(l||[]).filter(x=>x!==el.value);
    return salvaCampo(el.dataset.c,{[f]:tog(cur)},`${COMUNE[f]}: ${el.checked?"+":"−"} ${el.value}`,x=>({[f]:tog(x[f])})); }
  if(el.id==="pref-raggr"){ DB.pref={...DB.pref,[state.ruolo]:{...(DB.pref?.[state.ruolo]||{}),raggruppa:el.checked}}; save(); dtStato("cat").pag=0; render(); }
  if(el.id==="np-base") $("np-t").value=PROMPT_STD[+el.value].t;
  if(el.id==="m-file"&&el.files.length){ m.foto=[...(m.foto||[]),...await Promise.all([...el.files].map(leggiFile))]; rm(); }
  if(el.dataset.mp){ m.pid=+el.value; m.ptesto=null; rm(); }
  if(el.dataset.mr==="k1"){ m.res.k1=el.value; m.res.k2=classi2(el.value)[0]; rm(); }
});
document.addEventListener("input",ev=>{
  const el=ev.target, m=M();
  if(el.dataset?.dtq){ const id=el.dataset.dtq, st=dtStato(id); st.q=el.value; st.pag=0; const pos=el.selectionStart; render(); const q=$("dtq-"+id); q.focus(); q.setSelectionRange(pos,pos); }
  if(el.dataset.mq){ m.q=el.value; const p=el.selectionStart; rm(); const q=$("m-q"); q.focus(); q.setSelectionRange(p,p); }
  if(el.dataset.mn) m.nota=el.value;
  if(el.dataset.mpt) m.ptesto=el.value;
});
document.addEventListener("keydown",ev=>{
  if(ev.key==="Escape"&&state.drawer&&!document.querySelector("dialog[open]")) closeDrawer();
  if((ev.key==="Enter"||ev.key===" ")&&ev.target.matches("tr[data-act]")){ev.preventDefault(); ev.target.click();}
});
render();
