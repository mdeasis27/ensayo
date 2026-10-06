import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface EnsayoStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (tasters: number) => string; yes: string; no: string; tastersLabel: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; gate: string; majority: string; approved: string; notYet: string; ships: string; staysOut: string; sentence: (newer: number, n: number) => string; enough: string; notEnough: string; verdict: (approved: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; statusLabels: { active: string; danger: string; success: string }; tapeLabel: string; nodes: { tasters: NodeCopy; test: NodeCopy; launch: NodeCopy; wait: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; preferOf: (newer: number, n: number) => string };
}

export const STORY: Record<"en" | "es", EnsayoStory> = {
  en: {
    name: "Release evidence",
    oneLiner: "Most people liking it isn't enough: you need enough tasters to know it wasn't luck.",
    chips: ["A/B testing", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "A kitchen wants to change a recipe. In a blind taste test, six of ten people pick the new one. Sounds like a win, but with ten people a coin could land six to four. With forty the result is harder to explain away.",
        "Here the recipes are two versions of an assistant's instructions and each taster is one scored answer. The slider decides how many tasters you wait for before deciding.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the recipes", means: "two versions of the instructions" },
        { term: "a taster", means: "one score from each version, set side by side" },
        { term: "the blind test", means: "a statistical test on the scores" },
        { term: "launching", means: "switching everyone to the new version" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Each recipe has forty scores, from two separate groups. You choose how many of them the decision waits for. The test asks for 95% confidence.",
      question: (n) => `Before you run it, place a bet: with ${n} ${n === 1 ? "taster" : "tasters"}, does the new recipe get approved?`,
      yes: "Yes, it launches",
      no: "No, not yet",
      tastersLabel: "Tasters",
      note: "Each square is one taster. Green preferred the new recipe, red the old one, blue couldn't tell them apart.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The tasting could not be scored. Try another number of tasters.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "The test", accent: "or a show of hands" },
      lead: "Same tasters. One way asks for evidence; the other launches as soon as more people preferred the new recipe.",
      gate: "With the statistical test",
      majority: "If a majority were enough",
      approved: "Approved",
      notYet: "Not yet",
      ships: "Launches",
      staysOut: "Doesn't launch",
      sentence: (newer, n) => `${newer} of ${n} ${n === 1 ? "taster" : "tasters"} preferred the new recipe.`,
      enough: "With that many, the difference no longer looks like luck.",
      notEnough: "With that few, the difference could still be luck, so the test waits.",
      verdict: (approved) => approved ? "The new recipe was approved" : "The new recipe was not approved yet",
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "Before switching every customer to a new version of something that talks to them. I think of a support assistant whose instructions change every few weeks.",
      notLabel: "Not needed",
      not: "When the change is easy to undo and nobody will notice a bad week, or when the new version is clearly better on every single case.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I separated looking better from being proven better. A panel where most people preferred the new version still waited until there were enough of them to rule out luck.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "Welch's t-test, two-sided, alpha 0.05. Launch needs p below alpha and a positive difference; a significant negative difference rolls back.",
        "The 40-taster panel is a fixed synthetic set added for this page. With the first 5 to 20 tasters the test holds; from 25 it approves.",
        "The test is unpaired. Pairing taster i's two scores in the squares is for display only.",
        "The statistics and all three experiments are pinned in a fixture shared by TypeScript and Python.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "What each taster preferred",
      caption: "Watch the tasters vote five at a time.",
      statusLabels: { active: "tasting", success: "in use", danger: "not proven" },
      tapeLabel: "Tasters, in order",
      nodes: {
        tasters: { name: "Tasters", sub: "blind scores", analogy: "the panel" },
        test: { name: "Test", sub: "95% confidence", analogy: "the blind test" },
        launch: { name: "Launch", sub: "new recipe for all", analogy: "the new menu" },
        wait: { name: "Wait", sub: "keep the old one", analogy: "more tasting" },
      },
      tape: { served: "preferred the new one", rerouted: "couldn't tell", lost: "preferred the old one" },
      preferOf: (newer, n) => `Preferred the new recipe: ${newer} of ${n}`,
    },
  },
  es: {
    name: "Ensayo",
    oneLiner: "Que a la mayoría le guste no basta: hay que probar con suficientes personas para saber que no fue suerte.",
    chips: ["Pruebas A/B", "2 min", "Demo en vivo"],
    analogy: {
      heading: { accent: "La analogía" },
      paragraphs: [
        "Una cocina quiere cambiar una receta. En una prueba a ciegas, seis de diez personas eligen la nueva. Parece victoria, pero con diez personas una moneda podría caer seis a cuatro. Con cuarenta, el resultado es más difícil de explicar como suerte.",
        "Aquí las recetas son dos versiones de las instrucciones de un asistente, y cada catador es una respuesta calificada. El slider decide a cuántos catadores esperas antes de decidir.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "las recetas", means: "dos versiones de las instrucciones" },
        { term: "un catador", means: "una calificación de cada versión, puestas lado a lado" },
        { term: "la prueba a ciegas", means: "una prueba estadística sobre las calificaciones" },
        { term: "lanzar", means: "pasar a todos a la versión nueva" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Cada receta tiene cuarenta calificaciones, de dos grupos distintos. Tú eliges a cuántos espera la decisión. La prueba pide 95% de confianza.",
      question: (n) => `Antes de correrlo, apuesta: con ${n} ${n === 1 ? "catador" : "catadores"}, ¿se aprueba la receta nueva?`,
      yes: "Sí, se lanza",
      no: "No, todavía no",
      tastersLabel: "Catadores",
      note: "Cada cuadrito es un catador. Verde prefirió la receta nueva, rojo la anterior y azul no notó diferencia.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudo calificar la prueba. Prueba con otro número de catadores.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "La prueba", accent: "o alzar la mano" },
      lead: "Mismos catadores. Una forma pide evidencia; la otra lanza en cuanto más gente prefirió la receta nueva.",
      gate: "Con la prueba estadística",
      majority: "Si bastara con la mayoría",
      approved: "Aprobada",
      notYet: "Todavía no",
      ships: "Se lanza",
      staysOut: "No se lanza",
      sentence: (newer, n) => `${newer} de ${n} ${n === 1 ? "catador" : "catadores"} ${newer === 1 ? "prefirió" : "prefirieron"} la receta nueva.`,
      enough: "Con tantos, la diferencia ya no parece suerte.",
      notEnough: "Con tan pocos, la diferencia todavía puede ser suerte, así que la prueba espera.",
      verdict: (approved) => approved ? "La receta nueva se aprobó" : "La receta nueva todavía no se aprueba",
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve", after: "?" },
      worthLabel: "Vale la pena",
      worth: "Antes de pasar a todos los clientes a una versión nueva de algo que les habla. Pienso en un asistente de soporte cuyas instrucciones cambian cada pocas semanas.",
      notLabel: "No hace falta",
      not: "Cuando el cambio es fácil de deshacer y nadie notaría una mala semana, o cuando la versión nueva es claramente mejor en cada caso.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Separé verse mejor de estar demostrado mejor. Un panel donde la mayoría prefirió la versión nueva igual esperó a tener suficientes catadores para descartar la suerte.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Prueba t de Welch, de dos colas, alfa 0.05. Lanzar exige p menor que alfa y una diferencia positiva; una diferencia negativa significativa regresa a la versión anterior.",
        "El panel de 40 catadores es un conjunto sintético fijo creado para esta página. Con los primeros 5 a 20 catadores la prueba espera; desde 25 aprueba.",
        "La prueba no es pareada. Emparejar las dos calificaciones del catador i en los cuadritos es solo para mostrarlo.",
        "La estadística y los tres experimentos los fija un fixture que comparten TypeScript y Python.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Lo que prefirió cada catador",
      caption: "Mira cómo votan los catadores de cinco en cinco.",
      statusLabels: { active: "probando", success: "en uso", danger: "sin demostrar" },
      tapeLabel: "Catadores, en orden",
      nodes: {
        tasters: { name: "Catadores", sub: "calificaciones a ciegas", analogy: "el panel" },
        test: { name: "Prueba", sub: "95% de confianza", analogy: "la prueba a ciegas" },
        launch: { name: "Lanzar", sub: "receta nueva para todos", analogy: "el menú nuevo" },
        wait: { name: "Esperar", sub: "se queda la anterior", analogy: "seguir probando" },
      },
      tape: { served: "prefirió la nueva", rerouted: "no notó diferencia", lost: "prefirió la anterior" },
      preferOf: (newer, n) => `Prefirieron la receta nueva: ${newer} de ${n}`,
    },
  },
};
