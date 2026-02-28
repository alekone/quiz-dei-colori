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
  { label: string; description: string; details: string[]; accent: string }
> = {
  rosso: {
    label: "Concreto",
    description:
      "Pragmatico e orientato ai risultati, prova subito a trasformare le idee in azioni concrete. Predilige ciò che funziona nella pratica e ama soluzioni rapide e applicabili.",
    details: [
      "Sperimenta sul campo, preferisce esempi reali e feedback immediati.",
      "Si focalizza su obiettivi misurabili e sull'efficienza operativa.",
      "Può mostrare impazienza verso discussioni teoriche molto lunghe.",
    ],
    accent: "#ef4444",
  },
  giallo: {
    label: "Entusiasta",
    description:
      "Energia, azione e curiosità: si coinvolge volentieri in nuove esperienze e trae stimolo dal contatto con gli altri. Predilige il qui e ora e la varietà.",
    details: [
      "Agisce con slancio e tende a sperimentare prima di analizzare.",
      "Ama il lavoro dinamico, il confronto e le situazioni stimolanti.",
      "Può annoiarsi con attività ripetitive o troppo strutturate.",
    ],
    accent: "#f59e0b",
  },
  verde: {
    label: "Riflessivo",
    description:
      "Calmo e osservatore, raccoglie informazioni da più punti di vista prima di decidere. Cerca armonia nelle relazioni e preferisce tempi adeguati per riflettere.",
    details: [
      "Ascolta con attenzione e valuta alternative prima di agire.",
      "Predilige contesti sereni, senza pressioni eccessive.",
      "Può rimandare le decisioni per approfondire meglio.",
    ],
    accent: "#22c55e",
  },
  blu: {
    label: "Preciso",
    description:
      "Analitico e razionale, ricerca coerenza, modelli e spiegazioni solide. Ama capire in profondità e organizzare le idee in modo logico.",
    details: [
      "Si affida a dati, analisi e ragionamento strutturato.",
      "Preferisce processi chiari, metodo e rigore.",
      "Può essere poco tollerante verso ambiguità o improvvisazione.",
    ],
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
  percentages: Record<Color, number>;
  total: number;
  topColor: Color;
  orderedColors: Color[];
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

  questionSet.forEach((question) => {
    const weight = answers[question.id] ?? 0;
    scores[question.color] += weight;
  });

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const percentages: Record<Color, number> = {
    rosso: total ? Math.round((scores.rosso / total) * 100) : 0,
    giallo: total ? Math.round((scores.giallo / total) * 100) : 0,
    verde: total ? Math.round((scores.verde / total) * 100) : 0,
    blu: total ? Math.round((scores.blu / total) * 100) : 0,
  };

  const orderedColors = (Object.keys(scores) as Color[]).sort(
    (a, b) => scores[b] - scores[a],
  );

  return {
    scores,
    percentages,
    total,
    topColor: orderedColors[0],
    orderedColors,
  };
};
