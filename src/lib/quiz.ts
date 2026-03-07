export type Color = "rosso" | "giallo" | "verde" | "blu";
export type QuizVariant = "full" | "short";

export type Option = {
  id: string;
  label: string;
  weight: number;
};

export type Question = {
  id: string;
  text: string;
  color: Color;
  options: Option[];
};

export const colorMeta: Record<
  Color,
  {
    label: string;
    description: string;
    who: string;
    how: string[];
    strengths: string[];
    blindSpots: string[];
    withOthers: string[];
    stress: string;
    stressTrap: string;
    stressSignal: string;
    accent: string;
  }
> = {
  rosso: {
    label: "Concreto",
    description:
      "Sei orientato all'azione, ai risultati e all'impatto immediato. Trasformi le idee in piani operativi prima ancora che gli altri finiscano di discuterne.",
    who:
      "Sei orientato all'azione, ai risultati e all'impatto immediato. La tua energia primaria è fare: trasformi le idee in piani operativi prima ancora che gli altri finiscano di discuterne. Corrispondente al tipo Dominante nel modello DISC e al temperamento Collerico della tradizione ippocratica, il profilo Rosso è quello del costruttore, dell'esecutore, del leader naturale che guida col esempio più che con le parole. Psicologicamente, la tua motivazione principale è il controllo sull'ambiente: ti senti bene quando le cose si muovono, quando c'è progresso misurabile, quando puoi influenzare concretamente l'esito di una situazione. L'incertezza non ti paralizza — ti irrita.",
    how: [
      "Elabori le informazioni per sintesi operativa: vuoi sapere cosa fare, non perché. I dettagli teorici li deleghi volentieri.",
      "Il tuo processo decisionale è rapido e diretto: preferisci un errore corretto in corsa a un'analisi lunga.",
      "Hai alta tolleranza al rischio e bassa tolleranza alla lentezza altrui.",
      "Impari meglio sul campo: tentativi, errori, correzioni veloci. Il feedback immediato è il tuo carburante.",
      "Sei spinto da obiettivi sfidanti, competizione e senso di autonomia.",
    ],
    strengths: [
      "Capacità esecutiva fuori dal comune.",
      "Leadership naturale in situazioni di crisi o urgenza.",
      "Pragmatismo che taglia la burocrazia inutile.",
      "Alta energia e resistenza alla fatica mentale.",
      "Decisionalità sotto pressione.",
    ],
    blindSpots: [
      "Puoi percepire come \"lento\" o \"inutile\" chi ha bisogno di più tempo per riflettere.",
      "Tendi a interrompere o concludere le frasi degli altri.",
      "Rischi di trascurare la componente emotiva nelle relazioni.",
      "L'impazienza può generare errori evitabili o tensioni nel team.",
      "Fai fatica a valorizzare processi, routine e metodo.",
    ],
    withOthers: [
      "Con il Giallo (Entusiasta): condividete l'energia e la velocità. Attenzione: il Giallo vuole coinvolgimento emotivo, tu vai dritto all'obiettivo. Concedigli il momento di entusiasmo prima di chiudere l'azione.",
      "Con il Verde (Riflessivo): è il tuo opposto più critico. Non interpretare il suo silenzio come passività: sta elaborando. Se lo premi troppo, si chiude. Dagli tempo e ascolta le sue riserve — spesso individua rischi che tu hai saltato.",
      "Con il Blu (Preciso): apprezza la sua competenza ma trova frustrante la sua lentezza. Sii chiaro sulle priorità e sui tempi. Il Blu lavora meglio con aspettative definite.",
    ],
    stress:
      "Sotto stress, il Rosso amplifica i suoi tratti dominanti fino alla tossicità: diventa autoritario, brusco e intollerante. La sua soglia di frustrazione si abbassa drasticamente — ciò che in condizioni normali è impazienza, sotto pressione diventa aggressività verbale o controllo micromanageriale. Tende a prendere il comando anche quando non è il suo ruolo, a scavalcare gli altri \"per efficienza\", a interpretare la lentezza altrui come incompetenza o sabotaggio. Il paradosso del Rosso sotto stress è che rallenta i processi accelerando i conflitti: genera tensioni che poi deve gestire, perdendo il tempo che voleva risparmiare.",
    stressTrap:
      "Se non lo faccio io, non viene fatto bene. Questa convinzione lo porta a non delegare, a creare dipendenza nel team e a burnout personale. Gli altri smettono di prendere iniziativa perché sanno che il Rosso interverrà comunque. Il risultato è un team passivo guidato da un leader esausto.",
    stressSignal:
      "Quando inizia a parlare solo in imperativo e a saltare i saluti.",
    accent: "#ef4444",
  },
  giallo: {
    label: "Entusiasta",
    description:
      "Ottimista, curioso e relazionale: il tuo motore è il contatto umano e la novità.",
    who:
      "Sei la persona che porta energia nella stanza. Ottimista per natura, curioso, relazionale: il tuo motore è il contatto umano e la novità. Corrisponde al tipo Influente nel DISC e al temperamento Sanguinico. Taylor Hartman lo descrive come il colore della vitalità: i Gialli sono persone che ispirano, motivano, contagiano gli altri con la propria energia. La tua motivazione primaria è l'approvazione sociale e la stimolazione: hai bisogno di sentirti apprezzato, di essere al centro di esperienze nuove, di connessioni autentiche. L'isolamento e la routine sono per te fonti di stress reale.",
    how: [
      "Sei un pensatore associativo e laterale: passi da un'idea all'altra velocemente, spesso trovando connessioni che gli altri non vedono.",
      "Decidi per intuizione emotiva: se qualcosa ti entusiasma, sei dentro. L'analisi arriva dopo — o non arriva.",
      "Comunichi con naturalezza: sei persuasivo, narrativo, capace di vendere idee prima ancora che siano pronte.",
      "Il tuo apprendimento è esperienziale e sociale: impari meglio in gruppo, attraverso storie, esempi, discussione.",
      "Hai cicli energetici intensi: grande slancio iniziale, calo nella fase di follow-through.",
    ],
    strengths: [
      "Comunicazione e persuasione naturali.",
      "Capacità di costruire relazioni veloci e solide.",
      "Pensiero creativo e visione ottimistica.",
      "Leadership per ispirazione.",
      "Alta adattabilità nei contesti dinamici.",
    ],
    blindSpots: [
      "Puoi sovrastimare il tuo impegno e sottostimare i dettagli operativi.",
      "La noia e la routine portano a dispersione o abbandono.",
      "La necessità di approvazione può rendere difficile dare feedback negativi.",
      "Tendi a iniziare molte cose e finirne poche.",
      "L'entusiasmo può essere percepito come superficialità.",
    ],
    withOthers: [
      "Con il Rosso (Concreto): condividete la velocità, ma il Rosso vuole risultati, non entusiasmo. Vai dritto al punto quando parli con lui, mostra impatto concreto.",
      "Con il Verde (Riflessivo): il Verde può trovarti sopraffacente. Abbassa i giri, ascolta davvero, non riempire tutti i silenzi. Lui ti ripaga con lealtà profonda.",
      "Con il Blu (Preciso): è il tuo opposto più difficile. Il Blu percepisce la tua improvvisazione come mancanza di rispetto. Porta dati quando puoi, rispetta i processi che ha definito.",
    ],
    stress:
      "Sotto stress, il Giallo non diventa aggressivo — scompare o si disperde. La sua risposta primaria è la fuga verso la stimolazione: nuovi progetti, nuove conversazioni, nuove idee. È il meccanismo di difesa più difficile da riconoscere perché sembra ancora entusiasmo, ma è evitamento. Oppure passa all'estremo opposto: cerca disperatamente approvazione, diventa iperattivo socialmente, bisognoso di rassicurazione. Sotto pressione prolungata può diventare drammatizzante e reattivo emotivamente, percependo ogni critica come un attacco personale.",
    stressTrap:
      "Se tutti stanno bene, il problema non esiste. Il Giallo usa il clima emotivo positivo come proxy della realtà. Evita conversazioni difficili, rimanda i conflitti, glissa i problemi con ottimismo. Le persone intorno a lui imparano a non portargli bad news — un disastro per chi ha ruoli decisionali.",
    stressSignal:
      "Quando comincia a cambiare argomento ogni volta che si tocca un problema specifico.",
    accent: "#f59e0b",
  },
  verde: {
    label: "Riflessivo",
    description:
      "Empatico, paziente, orientato alla relazione: il tuo valore primario è l'armonia.",
    who:
      "Sei il collante emotivo dei gruppi. Empatico, paziente, orientato alla relazione: il tuo valore primario è l'armonia. Corrisponde al tipo Stabile nel DISC e al temperamento Flemmatico. Sei il tipo che tiene insieme le persone nei momenti di tensione, che ascolta davvero, che ricorda come si sentivano gli altri mesi fa. La tua motivazione primaria è la sicurezza e la stabilità relazionale: hai bisogno di contesti prevedibili, di rapporti di fiducia consolidati, di sapere che le tue azioni non rompono l'equilibrio del gruppo.",
    how: [
      "Elabori le decisioni in modo olistico e relazionale: prima di decidere, pesi l'impatto sulle persone, non solo il risultato.",
      "Il tuo processo è lento ma profondo: raramente ti penti delle scelte, perché le hai considerate da ogni angolazione.",
      "Sei un ascoltatore eccezionale: le persone si fidano di te naturalmente.",
      "Lavori meglio in contesti collaborativi, con ruoli chiari e aspettative stabili.",
      "Il conflitto diretto ti crea disagio fisico reale: lo eviti, a volte a danno tuo.",
    ],
    strengths: [
      "Intelligenza emotiva elevata.",
      "Capacità di mediare e tenere uniti i gruppi.",
      "Affidabilità e coerenza nel tempo.",
      "Ascolto attivo e memoria relazionale.",
      "Lealtà profonda.",
    ],
    blindSpots: [
      "Procrastinazione decisionale mascherata da approfondimento.",
      "Difficoltà a dire no, a porre limiti, a gestire conflitti.",
      "Rischi di accumulare risentimento piuttosto che esprimere disaccordo.",
      "Puoi sembrare indeciso o passivo a chi non ti conosce.",
      "Il cambiamento rapido ti destabilizza anche quando è positivo.",
    ],
    withOthers: [
      "Con il Rosso (Concreto): il suo ritmo ti può intimidire. Non lasciare che la sua urgenza ti faccia saltare la tua elaborazione. Dì chiaramente di cosa hai bisogno: più tempo, più contesto.",
      "Con il Giallo (Entusiasta): condividete il calore relazionale. Il Giallo però ha bisogno di stimoli che tu non sempre vuoi fornire. Lascia che si sfoghi, poi porta la conversazione a atterrare.",
      "Con il Blu (Preciso): siete entrambi riflessivi ma per motivi diversi. Lui analizza i dati, tu le relazioni. È una coppia potente se entrambi rispettate il diverso focus.",
    ],
    stress:
      "Sotto stress, il Verde si ritira e tace. Non esplode, non fugge — si chiude. Risponde ai messaggi in ritardo, diventa monosillabico, smette di partecipare attivamente. Dall'esterno sembra calmo; internamente sta accumulando. È il profilo con la maggiore capacità di risentimento silenzioso: può portare un disagio per mesi senza mai nominarlo esplicitamente. Il rischio più grave è la passiva resistenza: non dice no, ma non fa. Non si oppone, ma rallenta. Non critica, ma non supporta.",
    stressTrap:
      "Prima gli altri, poi io — sempre. Il Verde antepone sistematicamente i bisogni altrui ai propri, fino all'esaurimento. Poi, quando esplode (raramente, ma accade), la reazione appare sproporzionata agli altri che non hanno visto l'accumulo. Viene percepito come inaffidabile proprio nel momento in cui sta semplicemente raggiungendo il limite.",
    stressSignal:
      "Quando smette di fare domande e inizia a rispondere solo \"ok\" o \"come vuoi\".",
    accent: "#22c55e",
  },
  blu: {
    label: "Preciso",
    description:
      "Analitico, sistematico, esigente: il tuo valore primario è la verità verificabile.",
    who:
      "Sei il guardiano della qualità e della coerenza. Analitico, sistematico, esigente con te stesso prima che con gli altri: il tuo valore primario è la verità verificabile. Corrisponde al tipo Coscienzioso nel DISC e al temperamento Malinconico. Sei il tipo che individua l'errore nel foglio Excel alle 23:00, che ricorda la clausola contrattuale dimenticata, che costruisce sistemi che reggono nel tempo. La tua motivazione primaria è la competenza e la correttezza: hai bisogno di fare le cose bene, di capire in profondità, di non essere colto in fallo. Il giudizio negativo sulla qualità del tuo lavoro è la tua kryptonite.",
    how: [
      "Elabori le informazioni in modo sequenziale e critico: costruisci modelli mentali complessi prima di agire.",
      "Le decisioni richiedono dati sufficienti: l'ambiguità non è creatività per te, è un problema da risolvere.",
      "Comunichi in modo preciso, a volte percepito come freddo o distante — ma è rispetto, non distanza.",
      "Il tuo apprendimento è sistematico: manuali, schemi, processi chiari. L'improvvisazione ti disturba.",
      "Hai standard altissimi che a volte diventano perfezionismo paralizzante.",
    ],
    strengths: [
      "Pensiero analitico e problem solving strutturato.",
      "Attenzione ai dettagli che altri non vedono.",
      "Affidabilità procedurale.",
      "Capacità di costruire sistemi scalabili.",
      "Resistenza all'influenza emotiva nelle decisioni complesse.",
    ],
    blindSpots: [
      "Il perfezionismo può bloccare l'esecuzione.",
      "Difficoltà ad adattarti quando le regole cambiano velocemente.",
      "Puoi essere percepito come critico, rigido o freddo.",
      "La critica al tuo lavoro è difficile da separare dalla critica alla tua persona.",
      "Rischi di over-analizzare situazioni che richiedono azione rapida.",
    ],
    withOthers: [
      "Con il Rosso (Concreto): accetta che lui decida con meno dati di quanti ne vorresti tu. Non è ignoranza: è un diverso rapporto con l'incertezza. Dai le tue analisi in formato sintetico, con raccomandazione esplicita.",
      "Con il Giallo (Entusiasta): il suo caos creativo ti può disturbare. Prima di correggere, riconosci il valore dell'idea. Lui recepisce bene il feedback se lo sente come collaborativo, non valutativo.",
      "Con il Verde (Riflessivo): siete entrambi cauti e riflessivi. La differenza è che lui decide con il cuore, tu con la testa. Rispetta le sue preoccupazioni relazionali: spesso individuano rischi umani che i tuoi modelli non catturano.",
    ],
    stress:
      "Sotto stress, il Blu diventa ipercritico e paralizzato. La sua risposta è aumentare il controllo: più analisi, più verifiche, più standard. Entra in loop perfezionistici che bloccano l'output. Allo stesso tempo, diventa più chiuso emotivamente e più intransigente sulle procedure — proprio quando la situazione richiederebbe flessibilità. Può anche scivolare nel pessimismo sistemico: inizia a vedere difetti ovunque, anticipa fallimenti, costruisce scenari negativi dettagliati. Non è catastrofismo — è il suo modello analitico applicato senza bilanciamento emotivo.",
    stressTrap:
      "Se non è perfetto, è sbagliato. Il Blu applica ai rapporti umani gli stessi standard che applica ai dati. Le persone si sentono costantemente valutate e mai abbastanza. Col tempo, smettono di condividere lavori in corso, idee incomplete, processi non ancora a regime — esattamente il materiale grezzo su cui il Blu potrebbe dare il suo contributo più utile.",
    stressSignal:
      "Quando inizia ogni frase con \"sì, ma...\" oppure quando chiede una quinta revisione su qualcosa che andava bene alla seconda.",
    accent: "#3b82f6",
  },
};

const scaleOptions = (prefix: string): Option[] => [
  { id: `${prefix}-1`, label: "Sì", weight: 1 },
  { id: `${prefix}-0`, label: "No", weight: 0 },
];

export const questions: Question[] = [
  {
    id: "q1",
    text: "Cerco di cogliere le differenze.",
    color: "blu",
    options: scaleOptions("q1"),
  },
  {
    id: "q2",
    text: "Prediligo la sperimentazione rispetto alla teoria.",
    color: "giallo",
    options: scaleOptions("q2"),
  },
  {
    id: "q3",
    text: "Preferisco relazionarmi con poche persone selezionate.",
    color: "verde",
    options: scaleOptions("q3"),
  },
  {
    id: "q4",
    text: "Mi attengo ai fatti.",
    color: "blu",
    options: scaleOptions("q4"),
  },
  {
    id: "q5",
    text: "Tendo a risolvere i problemi utilizzando un approccio graduale.",
    color: "verde",
    options: scaleOptions("q5"),
  },
  {
    id: "q6",
    text: "Mi applico con energia.",
    color: "giallo",
    options: scaleOptions("q6"),
  },
  {
    id: "q7",
    text: "Vivo i conflitti con difficoltà.",
    color: "verde",
    options: scaleOptions("q7"),
  },
  {
    id: "q8",
    text: "Procedo seguendo la razionalità.",
    color: "blu",
    options: scaleOptions("q8"),
  },
  {
    id: "q9",
    text: "Analizzo i fatti.",
    color: "blu",
    options: scaleOptions("q9"),
  },
  {
    id: "q10",
    text: "L'esperienza è fondamentale.",
    color: "rosso",
    options: scaleOptions("q10"),
  },
  {
    id: "q11",
    text: "Sono una persona riservata.",
    color: "verde",
    options: scaleOptions("q11"),
  },
  {
    id: "q12",
    text: "Mi motivano gli obiettivi sfidanti.",
    color: "rosso",
    options: scaleOptions("q12"),
  },
  {
    id: "q13",
    text: "Rifletto sui fatti.",
    color: "blu",
    options: scaleOptions("q13"),
  },
  {
    id: "q14",
    text: "Vivo con intensità le esperienze.",
    color: "giallo",
    options: scaleOptions("q14"),
  },
  {
    id: "q15",
    text: "Mi interessa aiutare gli altri.",
    color: "verde",
    options: scaleOptions("q15"),
  },
  {
    id: "q16",
    text: "Guardo ai risultati.",
    color: "rosso",
    options: scaleOptions("q16"),
  },
  {
    id: "q17",
    text: "Prima la teoria poi la pratica.",
    color: "blu",
    options: scaleOptions("q17"),
  },
  {
    id: "q18",
    text: "Mi attraggono le cose nuove e diverse.",
    color: "giallo",
    options: scaleOptions("q18"),
  },
  {
    id: "q19",
    text: "Ricerco armonia e pace.",
    color: "verde",
    options: scaleOptions("q19"),
  },
  {
    id: "q20",
    text: "Ho senso di responsabilità.",
    color: "blu",
    options: scaleOptions("q20"),
  },
  {
    id: "q21",
    text: "Prima approfondisco poi sperimento.",
    color: "blu",
    options: scaleOptions("q21"),
  },
  {
    id: "q22",
    text: "Mi piace lavorare in team.",
    color: "giallo",
    options: scaleOptions("q22"),
  },
  {
    id: "q23",
    text: "Ascolto i punti di vista degli altri prima di esprimere il mio.",
    color: "verde",
    options: scaleOptions("q23"),
  },
  {
    id: "q24",
    text: "Mi piace la concretezza.",
    color: "rosso",
    options: scaleOptions("q24"),
  },
  {
    id: "q25",
    text: "Agisco e prendo le decisioni cautamente e con attenzione.",
    color: "blu",
    options: scaleOptions("q25"),
  },
  {
    id: "q26",
    text: "Faccio affidamento sulle mie emozioni ed esperienze.",
    color: "giallo",
    options: scaleOptions("q26"),
  },
  {
    id: "q27",
    text: "Tendo a pensare a diversi scenari prima di agire.",
    color: "blu",
    options: scaleOptions("q27"),
  },
  {
    id: "q28",
    text: "Sono una persona dinamica.",
    color: "giallo",
    options: scaleOptions("q28"),
  },
  {
    id: "q29",
    text: "Affronto le situazioni con la logica.",
    color: "blu",
    options: scaleOptions("q29"),
  },
  {
    id: "q30",
    text: "Mi faccio guidare dall’intuito.",
    color: "giallo",
    options: scaleOptions("q30"),
  },
  {
    id: "q31",
    text: "Mi piace prendere decisioni con calma dopo aver riflettuto su molte alternative.",
    color: "verde",
    options: scaleOptions("q31"),
  },
  {
    id: "q32",
    text: "Mi servono le informazioni essenziali per prendere le decisioni.",
    color: "rosso",
    options: scaleOptions("q32"),
  },
  {
    id: "q33",
    text: "Mi motiva la precisione.",
    color: "blu",
    options: scaleOptions("q33"),
  },
  {
    id: "q34",
    text: "In generale parlo più di quanto ascolti.",
    color: "giallo",
    options: scaleOptions("q34"),
  },
  {
    id: "q35",
    text: "Mi baso sulle mie emozioni.",
    color: "giallo",
    options: scaleOptions("q35"),
  },
  {
    id: "q36",
    text: "Mi piace l'azione.",
    color: "giallo",
    options: scaleOptions("q36"),
  },
  {
    id: "q37",
    text: "Elaboro teorie.",
    color: "blu",
    options: scaleOptions("q37"),
  },
  {
    id: "q38",
    text: "Mi annoiano i dettagli.",
    color: "giallo",
    options: scaleOptions("q38"),
  },
  {
    id: "q39",
    text: "Tendo ad accettare le idee altrui.",
    color: "verde",
    options: scaleOptions("q39"),
  },
  {
    id: "q40",
    text: "Quello che apprendo lo metto alla prova.",
    color: "rosso",
    options: scaleOptions("q40"),
  },
  {
    id: "q41",
    text: "Mi pongo molte domande prima di agire.",
    color: "blu",
    options: scaleOptions("q41"),
  },
  {
    id: "q42",
    text: "Spesso prendo delle decisioni d’istinto.",
    color: "giallo",
    options: scaleOptions("q42"),
  },
  {
    id: "q43",
    text: "Di solito ascolto più di quanto parlo.",
    color: "verde",
    options: scaleOptions("q43"),
  },
  {
    id: "q44",
    text: "Mi baso sui risultati che ottengo.",
    color: "rosso",
    options: scaleOptions("q44"),
  },
  {
    id: "q45",
    text: "Analizzo con accuratezza le situazioni.",
    color: "blu",
    options: scaleOptions("q45"),
  },
  {
    id: "q46",
    text: "Cerco di capire facendo le cose.",
    color: "rosso",
    options: scaleOptions("q46"),
  },
  {
    id: "q47",
    text: "Con gli altri sono disponibile.",
    color: "verde",
    options: scaleOptions("q47"),
  },
  {
    id: "q48",
    text: "Mi ritengo una persona efficiente.",
    color: "rosso",
    options: scaleOptions("q48"),
  },
  {
    id: "q49",
    text: "Valuto equamente.",
    color: "verde",
    options: scaleOptions("q49"),
  },
  {
    id: "q50",
    text: "Mi concentro sul presente.",
    color: "rosso",
    options: scaleOptions("q50"),
  },
  {
    id: "q51",
    text: "Rifletto molto prima di agire.",
    color: "verde",
    options: scaleOptions("q51"),
  },
  {
    id: "q52",
    text: "Mi viene facile seguire un processo.",
    color: "blu",
    options: scaleOptions("q52"),
  },
  {
    id: "q53",
    text: "Faccio attente osservazioni.",
    color: "blu",
    options: scaleOptions("q53"),
  },
  {
    id: "q54",
    text: "Mi piace l’azione.",
    color: "giallo",
    options: scaleOptions("q54"),
  },
  {
    id: "q55",
    text: "Spesso prendo decisioni seguendo onde emotive.",
    color: "giallo",
    options: scaleOptions("q55"),
  },
  {
    id: "q56",
    text: "Prediligo gli scambi di informazioni brevi e diretti.",
    color: "rosso",
    options: scaleOptions("q56"),
  },
  {
    id: "q57",
    text: "Mi piace comprendere le cose.",
    color: "blu",
    options: scaleOptions("q57"),
  },
  {
    id: "q58",
    text: "Con gli altri sono disponibile.",
    color: "verde",
    options: scaleOptions("q58"),
  },
  {
    id: "q59",
    text: "Sono le emozioni a guidarmi.",
    color: "giallo",
    options: scaleOptions("q59"),
  },
  {
    id: "q60",
    text: "Sono una persona pragmatica e concreta.",
    color: "rosso",
    options: scaleOptions("q60"),
  },
  {
    id: "q61",
    text: "Preferisco un approccio razionale.",
    color: "blu",
    options: scaleOptions("q61"),
  },
  {
    id: "q62",
    text: "Non ho paura di correre dei rischi.",
    color: "giallo",
    options: scaleOptions("q62"),
  },
  {
    id: "q63",
    text: "Ascolto le mie emozioni prima di prendere delle decisioni.",
    color: "giallo",
    options: scaleOptions("q63"),
  },
  {
    id: "q64",
    text: "Approccio le cose con logica e razionalità.",
    color: "blu",
    options: scaleOptions("q64"),
  },
  {
    id: "q65",
    text: "Soppeso i pro e i contro.",
    color: "blu",
    options: scaleOptions("q65"),
  },
  {
    id: "q66",
    text: "Mi baso sull’intuizione per risolvere situazioni critiche.",
    color: "giallo",
    options: scaleOptions("q66"),
  },
  {
    id: "q67",
    text: "Approccio alle cose con intuito e sensazioni.",
    color: "giallo",
    options: scaleOptions("q67"),
  },
  {
    id: "q68",
    text: "Mi assumo dei rischi senza paura.",
    color: "giallo",
    options: scaleOptions("q68"),
  },
  {
    id: "q69",
    text: "Analizzo le situazioni.",
    color: "blu",
    options: scaleOptions("q69"),
  },
  {
    id: "q70",
    text: "Imparo le cose facendo.",
    color: "rosso",
    options: scaleOptions("q70"),
  },
  {
    id: "q71",
    text: "Tendo a mediare nei conflitti.",
    color: "verde",
    options: scaleOptions("q71"),
  },
  {
    id: "q72",
    text: "Imparo facendo.",
    color: "rosso",
    options: scaleOptions("q72"),
  },
  {
    id: "q73",
    text: "Mi interessano i dettagli.",
    color: "blu",
    options: scaleOptions("q73"),
  },
  {
    id: "q74",
    text: "Mi piace fare tante cose diverse.",
    color: "giallo",
    options: scaleOptions("q74"),
  },
  {
    id: "q75",
    text: "Rimugino sulle cose passate.",
    color: "verde",
    options: scaleOptions("q75"),
  },
  {
    id: "q76",
    text: "Sono una persona proiettata nel futuro.",
    color: "giallo",
    options: scaleOptions("q76"),
  },
  {
    id: "q77",
    text: "Approfondisco e rifletto sulle situazioni.",
    color: "verde",
    options: scaleOptions("q77"),
  },
  {
    id: "q78",
    text: "Mi sento a mio agio nei cambiamenti.",
    color: "giallo",
    options: scaleOptions("q78"),
  },
  {
    id: "q79",
    text: "Prima di agire ci penso bene.",
    color: "verde",
    options: scaleOptions("q79"),
  },
  {
    id: "q80",
    text: "Analizzo i dati in mio possesso, valutando pro e contro.",
    color: "blu",
    options: scaleOptions("q80"),
  },
];

const shortQuestionIds = new Set([
  "q1",
  "q4",
  "q8",
  "q13",
  "q17",
  "q2",
  "q6",
  "q14",
  "q18",
  "q22",
  "q3",
  "q5",
  "q7",
  "q11",
  "q15",
  "q10",
  "q12",
  "q16",
  "q24",
  "q32",
]);

export const quizVariants: Record<
  QuizVariant,
  { label: string; description: string }
> = {
  full: {
    label: "Completo (80)",
    description: "Profilo dettagliato, ideale per analisi complete.",
  },
  short: {
    label: "Rapido (20)",
    description: "Versione compatta per una prima lettura.",
  },
};

export const getQuestionsForVariant = (variant: QuizVariant): Question[] =>
  variant === "short"
    ? questions.filter((question) => shortQuestionIds.has(question.id))
    : questions;

export type ScoreSummary = {
  scores: Record<Color, number>;
  sectionTotals: Record<Color, number>;
  percentages: Record<Color, number>;
  total: number;
  topColor: Color | null;
  secondaryColor: Color | null;
  orderedColors: Color[];
  coDominantColors: Color[];
  balanced: boolean;
  zeroColors: Color[];
};

export const scoreAnswers = (
  answers: Record<string, number>,
  questionSet: Question[] = questions,
): ScoreSummary => {
  const scores: Record<Color, number> = {
    rosso: 0,
    giallo: 0,
    verde: 0,
    blu: 0,
  };
  const sectionTotals: Record<Color, number> = {
    rosso: 0,
    giallo: 0,
    verde: 0,
    blu: 0,
  };

  questionSet.forEach((question) => {
    const weight = answers[question.id] ?? 0;
    scores[question.color] += weight;
    sectionTotals[question.color] += 1;
  });

  const percentages: Record<Color, number> = {
    rosso: sectionTotals.rosso
      ? Math.round((scores.rosso / sectionTotals.rosso) * 100)
      : 0,
    giallo: sectionTotals.giallo
      ? Math.round((scores.giallo / sectionTotals.giallo) * 100)
      : 0,
    verde: sectionTotals.verde
      ? Math.round((scores.verde / sectionTotals.verde) * 100)
      : 0,
    blu: sectionTotals.blu
      ? Math.round((scores.blu / sectionTotals.blu) * 100)
      : 0,
  };

  const orderedColors = (Object.keys(percentages) as Color[]).sort(
    (a, b) => percentages[b] - percentages[a],
  );

  const topPercent = percentages[orderedColors[0]];
  const balanced = orderedColors.every(
    (color) => percentages[color] === topPercent,
  );
  const coDominantColors = balanced
    ? (Object.keys(percentages) as Color[])
    : orderedColors.filter(
        (color) => Math.abs(percentages[color] - topPercent) <= 5,
      );
  const topColor = balanced ? null : orderedColors[0];
  const secondaryColor =
    balanced || coDominantColors.length > 1 ? null : orderedColors[1];
  const zeroColors = (Object.keys(scores) as Color[]).filter(
    (color) => scores[color] === 0,
  );
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);

  return {
    scores,
    sectionTotals,
    percentages,
    total,
    topColor,
    secondaryColor,
    orderedColors,
    coDominantColors,
    balanced,
    zeroColors,
  };
};
