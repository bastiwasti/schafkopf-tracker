export const PERSONALITIES = {
  dramatic: { label: "Dramatischer Stadion-Reporter", icon: "🎙️", pitch: 1.2, rate: 0.95 },
  tagesschau: { label: "Nüchterner Tagesschau-Sprecher", icon: "📺", pitch: 0.88, rate: 0.78 },
  bavarian: { label: "Bayerischer Opa", icon: "🍺", pitch: 0.82, rate: 0.72 },
  fan: { label: "Aufgeregter Fan im Biergarten", icon: "🤩", pitch: 1.3, rate: 1.1 },
};

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}
