"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Category = "growth" | "behavior" | "training" | "achievement" | "health";
type Language = "es" | "en";
type Theme = "light" | "dark";

type KiwiEntry = {
  id: string;
  date: string;
  category: Category;
  title: string;
  notes: string;
  titleEn?: string;
  notesEn?: string;
  weightKg?: number;
};

const STORAGE_KEY = "kiwi-diary-v1";
const LANGUAGE_KEY = "kiwi-language";
const THEME_KEY = "kiwi-theme";
const BIRTH_DATE = "2026-04-02";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${BASE_PATH}${path}`;

const categories: Record<Category, { label: Record<Language, string>; icon: string; className: string }> = {
  growth: { label: { es: "Crecimiento", en: "Growth" }, icon: "↗", className: "growth" },
  behavior: { label: { es: "Comportamiento", en: "Behaviour" }, icon: "◌", className: "behavior" },
  training: { label: { es: "Entrenamiento", en: "Training" }, icon: "✓", className: "training" },
  achievement: { label: { es: "Logro", en: "Achievement" }, icon: "★", className: "achievement" },
  health: { label: { es: "Salud", en: "Health" }, icon: "+", className: "health" },
};

const initialEntries: KiwiEntry[] = [
  {
    id: "born",
    date: "2026-04-02",
    category: "achievement",
    title: "Nació Kiwi",
    notes: "Nació en Valdemorillo, Comunidad de Madrid, España 🇪🇸.",
    titleEn: "Kiwi was born",
    notesEn: "She was born in Valdemorillo, Community of Madrid, Spain 🇪🇸.",
  },
  {
    id: "home",
    date: "2026-05-22",
    category: "achievement",
    title: "Llegó a casa",
    notes: "Primer día de Kiwi con Nico y Melina.",
    titleEn: "She arrived home",
    notesEn: "Kiwi's first day with Nico and Melina.",
  },
  {
    id: "weight-arrival",
    date: "2026-05-22",
    category: "growth",
    title: "Primer peso registrado",
    notes: "La pesaron el día que llegó a casa.",
    titleEn: "First recorded weight",
    notesEn: "She was weighed on the day she arrived home.",
    weightKg: 1,
  },
  {
    id: "name",
    date: "2026-05-22",
    category: "achievement",
    title: "Ya tiene nombre: Kiwi",
    notes: "Carey gris, con una franja crema en la cara y botitas blancas.",
    titleEn: "She already had a name: Kiwi",
    notesEn: "Grey tortoiseshell, with a cream stripe on her face and white paws.",
  },
  {
    id: "weight-1",
    date: "2026-06-16",
    category: "growth",
    title: "Segundo control de peso",
    notes: "Subió 400 g desde que llegó a casa.",
    titleEn: "Second weight check",
    notesEn: "She gained 400 g since arriving home.",
    weightKg: 1.4,
  },
  {
    id: "vaccine-trivalent-1",
    date: "2026-06-27",
    category: "health",
    title: "Primera dosis de vacuna trivalente",
    notes: "Primer registro de su pauta de vacunación trivalente.",
    titleEn: "First dose of the trivalent vaccine",
    notesEn: "The first record in her trivalent vaccination schedule.",
  },
  {
    id: "kneading",
    date: "2026-07-09",
    category: "behavior",
    title: "Amasa su camita",
    notes: "Lo hace a diario durante un rato y ronronea.",
    titleEn: "She kneads her bed",
    notesEn: "She does it every day for a while and purrs.",
  },
  {
    id: "weight-2",
    date: "2026-07-10",
    category: "growth",
    title: "Nuevo control de peso",
    notes: "Subió 500 g desde el registro anterior.",
    titleEn: "New weight check",
    notesEn: "She gained 500 g since the previous record.",
    weightKg: 1.9,
  },
  {
    id: "harness",
    date: "2026-07-11",
    category: "training",
    title: "Exploró el ático con arnés",
    notes: "Paseo supervisado; se mostró curiosa y contenta.",
    titleEn: "She explored the attic in her harness",
    notesEn: "A supervised walk; she was curious and happy.",
  },
  {
    id: "first-vomit",
    date: "2026-07-14",
    category: "health",
    title: "Primer vómito",
    notes: "Hoy Kiwi vomitó por primera vez.",
    titleEn: "First time vomiting",
    notesEn: "Today Kiwi vomited for the first time.",
  },
];

const galleryItems = [
  { src: "/gallery/07-1000301712.webp", alt: "Kiwi recostada en el sofá mirando a cámara", caption: "Esa mirada que lo dice todo" },
  { src: "/gallery/02-1000305232.webp", alt: "Kiwi durmiendo boca arriba en su camita", caption: "Modo siesta activado" },
  { src: "/gallery/08-1000300449.webp", alt: "Kiwi observando desde una ventana protegida con red", caption: "Exploradora desde un lugar seguro" },
  { src: "/gallery/03-1000305195.webp", alt: "Kiwi dormida junto al portátil", caption: "Supervisando el trabajo" },
  { src: "/gallery/06-1000303440.webp", alt: "Kiwi acurrucada con Melina en el sofá", caption: "Tarde de sofá con Melina" },
  { src: "/gallery/09-1000299463.webp", alt: "Kiwi estirada sobre la mesa junto al portátil", caption: "Una pausa entre reuniones" },
  { src: "/gallery/01-1000305265.webp", alt: "Kiwi apoyada sobre Nico en el suelo", caption: "Siempre cerca de Nico" },
  { src: "/gallery/04-1000305189.webp", alt: "Kiwi dormida sobre el teclado del portátil", caption: "El teclado más cómodo de la casa" },
  { src: "/gallery/05-1000303808.webp", alt: "Kiwi recostada sobre el portátil mirando a cámara", caption: "La verdadera jefa de la oficina" },
  { src: "/gallery/10-1000299539.webp", alt: "Kiwi estirada sobre la mesa junto al termo y el mate", caption: "Mate, trabajo y compañía" },
  { src: "/gallery/11-kiwi-rascador.webp", alt: "Kiwi recostada en el suelo junto a su rascador", caption: "Junto a su rascador" },
  { src: "/gallery/12-kiwi-cazando.webp", alt: "Kiwi jugando boca arriba con un juguete", caption: "Cazadora en acción" },
  { src: "/gallery/13-kiwi-raton.webp", alt: "Kiwi dormida abrazando su ratoncito de juguete", caption: "Siesta con su ratoncito" },
  { src: "/gallery/14-kiwi-tablet.webp", alt: "Kiwi observando una pantalla sobre la mesa del sofá", caption: "Control de pantalla" },
  { src: "/gallery/15-kiwi-caja.webp", alt: "Kiwi escondida dentro de una caja", caption: "La mejor caja de la casa" },
  { src: "/gallery/16-kiwi-arnes.webp", alt: "Kiwi explorando el patio con su arnés", caption: "Exploradora con arnés" },
];

const galleryEnglish = [
  { alt: "Kiwi lying on the sofa looking at the camera", caption: "A look that says it all" },
  { alt: "Kiwi sleeping on her back in her bed", caption: "Nap mode activated" },
  { alt: "Kiwi looking out of a window protected by a safety net", caption: "Exploring from a safe place" },
  { alt: "Kiwi asleep beside the laptop", caption: "Supervising the work" },
  { alt: "Kiwi cuddled up with Melina on the sofa", caption: "An afternoon on the sofa with Melina" },
  { alt: "Kiwi stretched out on the table beside the laptop", caption: "A break between meetings" },
  { alt: "Kiwi resting on Nico while he lies on the floor", caption: "Always close to Nico" },
  { alt: "Kiwi asleep on the laptop keyboard", caption: "The most comfortable keyboard in the house" },
  { alt: "Kiwi lying on the laptop and looking at the camera", caption: "The real boss of the office" },
  { alt: "Kiwi stretched out on the table beside a flask and mate", caption: "Mate, work and company" },
  { alt: "Kiwi lying on the floor beside her scratching post", caption: "Beside her scratching post" },
  { alt: "Kiwi playing on her back with a toy", caption: "Hunter in action" },
  { alt: "Kiwi asleep while hugging her toy mouse", caption: "A nap with her little mouse" },
  { alt: "Kiwi watching a screen on the sofa table", caption: "Screen inspection" },
  { alt: "Kiwi hiding inside a box", caption: "The best box in the house" },
  { alt: "Kiwi exploring the patio in her harness", caption: "Explorer in a harness" },
];

const ui = {
  es: {
    brand: "El diario de Kiwi", backup: "Respaldo", newRecord: "Nuevo registro",
    language: "Idioma", appearance: "Apariencia", light: "Claro", dark: "Oscuro",
    home: "Ir al inicio", storyEyebrow: "Su pequeña gran historia", heroFirst: "Kiwi está creciendo", heroSecond: "demasiado rápido.",
    heroDescription: "Guardá sus cambios, aprendizajes y momentos especiales en un solo lugar privado.", viewStory: "Ver su historia",
    portraitAria: "Retrato de Kiwi", portraitAlt: "Gatita carey gris con franja crema en la cara y botitas blancas", portraitCaption: "carey gris · botitas blancas",
    summary: "Resumen de Kiwi", ageToday: "Edad hoy", latestWeight: "Último peso", memories: "Recuerdos", achievements: "Logros",
    personality: "Personalidad de Kiwi", favouriteToys: "Juguetes favoritos", favouriteToysValue: "Cazar ratones de mentira, los resortes y el túnel.",
    specialSkill: "Habilidad especial", specialSkillValue: "Saludar a mis padres cuando llegan, esconderme en los placares y maullar casi por todo.",
    album: "Álbum", kiwiMoments: "Momentos de Kiwi", previousPhoto: "Foto anterior", nextPhoto: "Foto siguiente", enlarge: "Ampliar", enlargePhoto: "Ampliar foto",
    everydayScene: "Una de sus pequeñas grandes escenas cotidianas.", choosePhoto: "Elegir una foto", viewPhoto: "Ver foto", closePhoto: "Cerrar foto ampliada", of: "de",
    evolution: "Evolución", growing: "Cómo está creciendo", weightChart: "Peso de Kiwi a lo largo del tiempo", noWeight: "Aún no hay datos de peso", addTwo: "Agregá dos registros para empezar a ver la curva.",
    timeline: "Cronología", kiwiStory: "La historia de Kiwi", addMoment: "Agregar momento", filterTimeline: "Filtrar cronología", all: "Todo", edit: "Editar", delete: "Eliminar",
    noMoments: "Todavía no hay momentos en esta categoría.", dataTools: "Herramientas de respaldo", localData: "Tus datos se quedan acá",
    localDataDescription: "Se guardan en este navegador. Descargá un respaldo antes de cambiar de dispositivo o borrar sus datos.", exportJson: "Exportar JSON", importBackup: "Importar respaldo",
    footerOne: "Hecho para Kiwi con paciencia, juegos y Churu.", footerTwo: "Datos locales · Sin cuentas · Sin servicios externos",
    editRecord: "Editar registro", date: "Fecha", category: "Categoría", title: "Título", titlePlaceholder: "¿Qué pasó hoy?", notes: "Notas", notesPlaceholder: "Un detalle que quieras recordar…",
    weight: "Peso", optional: "opcional", cancel: "Cancelar", saveChanges: "Guardar cambios", saveMemory: "Guardar recuerdo", close: "Cerrar",
    updated: "Registro actualizado", saved: "Nuevo recuerdo guardado", deleteConfirm: "¿Eliminar este registro de la historia de Kiwi?", deleted: "Registro eliminado",
    backupDownloaded: "Respaldo descargado", backupImported: "Respaldo importado correctamente", invalidBackup: "Ese archivo no parece un respaldo válido de Kiwi", unreadableBackup: "No pudimos leer el respaldo guardado en este navegador.",
    months: "meses", days: "días", and: "y",
  },
  en: {
    brand: "Kiwi's diary", backup: "Backup", newRecord: "New entry",
    language: "Language", appearance: "Appearance", light: "Light", dark: "Dark",
    home: "Go to the top", storyEyebrow: "Her little big story", heroFirst: "Kiwi is growing up", heroSecond: "far too quickly.",
    heroDescription: "Keep track of her changes, discoveries and special moments in one private place.", viewStory: "View her story",
    portraitAria: "Portrait of Kiwi", portraitAlt: "Grey tortoiseshell kitten with a cream stripe on her face and white paws", portraitCaption: "grey tortoiseshell · white paws",
    summary: "Kiwi at a glance", ageToday: "Age today", latestWeight: "Latest weight", memories: "Memories", achievements: "Achievements",
    personality: "Kiwi's personality", favouriteToys: "Favourite toys", favouriteToysValue: "Hunting pretend mice, springs and her tunnel.",
    specialSkill: "Special skill", specialSkillValue: "Greeting my parents when they arrive, hiding in wardrobes and meowing about almost everything.",
    album: "Album", kiwiMoments: "Kiwi's moments", previousPhoto: "Previous photo", nextPhoto: "Next photo", enlarge: "Enlarge", enlargePhoto: "Enlarge photo",
    everydayScene: "One of her small but wonderful everyday moments.", choosePhoto: "Choose a photo", viewPhoto: "View photo", closePhoto: "Close enlarged photo", of: "of",
    evolution: "Progress", growing: "How she is growing", weightChart: "Kiwi's weight over time", noWeight: "No weight data yet", addTwo: "Add two entries to start seeing her growth curve.",
    timeline: "Timeline", kiwiStory: "Kiwi's story", addMoment: "Add moment", filterTimeline: "Filter timeline", all: "All", edit: "Edit", delete: "Delete",
    noMoments: "There are no moments in this category yet.", dataTools: "Backup tools", localData: "Your data stays here",
    localDataDescription: "It is stored in this browser. Download a backup before changing devices or clearing browser data.", exportJson: "Export JSON", importBackup: "Import backup",
    footerOne: "Made for Kiwi with patience, playtime and Churu.", footerTwo: "Local data · No accounts · No external services",
    editRecord: "Edit entry", date: "Date", category: "Category", title: "Title", titlePlaceholder: "What happened today?", notes: "Notes", notesPlaceholder: "A detail you would like to remember…",
    weight: "Weight", optional: "optional", cancel: "Cancel", saveChanges: "Save changes", saveMemory: "Save memory", close: "Close",
    updated: "Entry updated", saved: "New memory saved", deleteConfirm: "Delete this entry from Kiwi's story?", deleted: "Entry deleted",
    backupDownloaded: "Backup downloaded", backupImported: "Backup imported successfully", invalidBackup: "This file does not look like a valid Kiwi backup", unreadableBackup: "We could not read the backup saved in this browser.",
    months: "months", days: "days", and: "and",
  },
} as const;

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  category: "growth" as Category,
  title: "",
  notes: "",
  weightKg: "",
};

function safeDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function formatDate(date: string, language: Language, long = false) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", long
    ? { day: "numeric", month: "long", year: "numeric" }
    : { day: "2-digit", month: "short" }).format(safeDate(date));
}

function getAge(language: Language) {
  const start = safeDate(BIRTH_DATE).getTime();
  const today = new Date();
  const days = Math.max(0, Math.floor((today.getTime() - start) / 86400000));
  const months = Math.floor(days / 30.44);
  const rest = Math.max(0, Math.round(days - months * 30.44));
  const t = ui[language];
  return { days, label: months > 0 ? `${months} ${t.months} ${t.and} ${rest} ${t.days}` : `${days} ${t.days}` };
}

function GrowthChart({ entries, language }: { entries: KiwiEntry[]; language: Language }) {
  const t = ui[language];
  const points = entries
    .filter((entry) => typeof entry.weightKg === "number")
    .sort((a, b) => a.date.localeCompare(b.date));

  const values = points.map((point) => point.weightKg as number);
  const max = values.length ? Math.max(...values) : 2;
  const min = values.length ? Math.min(...values) : 0;
  const spread = Math.max(max - min, 0.5);
  const low = Math.max(0, min - spread * 0.35);
  const high = max + spread * 0.35;
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? 260 : 48 + (index / (points.length - 1)) * 424;
    const value = point.weightKg as number;
    const y = 176 - ((value - low) / (high - low)) * 126;
    return { x, y, point, value };
  });
  const line = coords.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <section className="panel growth-panel" aria-labelledby="growth-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.evolution}</p>
          <h2 id="growth-title">{t.growing}</h2>
        </div>
      </div>

      {points.length ? (
        <div className="chart-shell">
          <svg viewBox="0 0 520 220" role="img" aria-label={t.weightChart}>
            {[0, 1, 2].map((lineIndex) => {
              const y = 50 + lineIndex * 63;
              return <line key={lineIndex} x1="48" x2="472" y1={y} y2={y} className="grid-line" />;
            })}
            {coords.length > 1 && <polyline points={line} className="chart-line" />}
            {coords.map(({ x, y, point, value }) => (
              <g key={point.id} className="chart-point">
                <circle cx={x} cy={y} r="6" />
                <text x={x} y={y - 14} textAnchor="middle">{value.toLocaleString(language === "es" ? "es-ES" : "en-GB")} kg</text>
                <text x={x} y="204" textAnchor="middle" className="axis-text">{formatDate(point.date, language)}</text>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <div className="empty-chart">
          <span>⚖</span>
          <strong>{t.noWeight}</strong>
          <p>{t.addTwo}</p>
        </div>
      )}
    </section>
  );
}

function PhotoCarousel({ language }: { language: Language }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<number | null>(null);
  const t = ui[language];
  const sourceItem = galleryItems[active];
  const item = language === "es" ? sourceItem : { ...sourceItem, ...galleryEnglish[active] };

  function move(direction: number) {
    setActive((current) => (current + direction + galleryItems.length) % galleryItems.length);
  }

  function finishSwipe(endX: number) {
    if (touchStart.current === null) return;
    const distance = endX - touchStart.current;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
    touchStart.current = null;
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!expanded) return;
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  return (
    <section className="panel gallery-panel" aria-labelledby="gallery-title">
      <div className="section-heading gallery-heading">
        <div>
          <p className="eyebrow">{t.album}</p>
          <h2 id="gallery-title">{t.kiwiMoments}</h2>
        </div>
        <span className="gallery-count">{String(active + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}</span>
      </div>

      <div
        className="carousel-stage"
        onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}
      >
        <button className="carousel-arrow previous" onClick={() => move(-1)} aria-label={t.previousPhoto}>←</button>
        <button className="carousel-photo" onClick={() => setExpanded(true)} aria-label={`${t.enlargePhoto}: ${item.caption}`}>
          <img src={asset(item.src)} alt={item.alt} />
          <span className="zoom-hint">{t.enlarge} ↗</span>
        </button>
        <button className="carousel-arrow next" onClick={() => move(1)} aria-label={t.nextPhoto}>→</button>
      </div>
      <div className="carousel-caption" aria-live="polite">
        <strong>{item.caption}</strong>
        <span>{t.everydayScene}</span>
      </div>

      <div className="thumbnail-row" aria-label={t.choosePhoto}>
        {galleryItems.map((photo, index) => (
          <button
            key={photo.src}
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
            aria-label={`${t.viewPhoto} ${index + 1}: ${language === "es" ? photo.caption : galleryEnglish[index].caption}`}
            aria-current={index === active ? "true" : undefined}
          >
            <img src={asset(photo.src)} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {expanded && (
        <div className="photo-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpanded(false); }}>
          <section className="lightbox-content" role="dialog" aria-modal="true" aria-label={item.caption}>
            <button className="lightbox-close" onClick={() => setExpanded(false)} aria-label={t.closePhoto}>×</button>
            <button className="lightbox-arrow previous" onClick={() => move(-1)} aria-label={t.previousPhoto}>←</button>
            <img src={asset(item.src)} alt={item.alt} />
            <button className="lightbox-arrow next" onClick={() => move(1)} aria-label={t.nextPhoto}>→</button>
            <p>{item.caption} <span>{active + 1} {t.of} {galleryItems.length}</span></p>
          </section>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [entries, setEntries] = useState<KiwiEntry[]>(initialEntries);
  const [language, setLanguage] = useState<Language>("es");
  const [theme, setTheme] = useState<Theme>("light");
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const languageReady = useRef(false);
  const themeReady = useRef(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "es";
    const savedTheme = window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    setLanguage(savedLanguage);
    setTheme(savedTheme);
    document.documentElement.lang = savedLanguage;
    document.documentElement.dataset.theme = savedTheme;
    document.title = ui[savedLanguage].brand;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { entries?: KiwiEntry[] };
      if (Array.isArray(parsed.entries)) {
        const requiredIds = new Set(["vaccine-trivalent-1", "weight-2", "weight-arrival", "first-vomit"]);
        const savedIds = new Set(parsed.entries.map((entry) => entry.id));
        const newKnownEntries = initialEntries.filter((entry) => requiredIds.has(entry.id) && !savedIds.has(entry.id));
        const correctedEntries = parsed.entries.map((entry) => {
          const knownEntry = initialEntries.find((known) => known.id === entry.id);
          const withTranslation = knownEntry ? { ...entry, titleEn: knownEntry.titleEn, notesEn: knownEntry.notesEn } : entry;
          if (entry.id === "name") {
            return { ...withTranslation, date: "2026-05-22", notes: "Carey gris, con una franja crema en la cara y botitas blancas." };
          }
          if (entry.id === "weight-1") {
            return { ...withTranslation, title: "Segundo control de peso", notes: "Subió 400 g desde que llegó a casa." };
          }
          if (entry.id === "born") {
            return { ...withTranslation, date: "2026-04-02", notes: "Nació en Valdemorillo, Comunidad de Madrid, España 🇪🇸." };
          }
          if (entry.id === "vaccine-trivalent-1") {
            return { ...withTranslation, category: "health" as Category };
          }
          return withTranslation;
        });
        setEntries([...correctedEntries, ...newKnownEntries]);
      }
    } catch {
      setNotice(ui[savedLanguage].unreadableBackup);
    }
  }, []);

  useEffect(() => {
    if (!languageReady.current) { languageReady.current = true; return; }
    window.localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    document.title = ui[language].brand;
  }, [language]);

  useEffect(() => {
    if (!themeReady.current) { themeReady.current = true; return; }
    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries }));
  }, [entries]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );
  const filtered = filter === "all" ? sorted : sorted.filter((entry) => entry.category === filter);
  const latestWeight = sorted.find((entry) => typeof entry.weightKg === "number");
  const achievements = entries.filter((entry) => entry.category === "achievement").length;
  const age = getAge(language);
  const t = ui[language];

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function openNew(category: Category = "growth") {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10), category });
    setModalOpen(true);
  }

  function openEdit(entry: KiwiEntry) {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      category: entry.category,
      title: language === "en" ? entry.titleEn ?? entry.title : entry.title,
      notes: language === "en" ? entry.notesEn ?? entry.notes : entry.notes,
      weightKg: entry.weightKg?.toString() ?? "",
    });
    setModalOpen(true);
  }

  function submitEntry(event: FormEvent) {
    event.preventDefault();
    const previous = editingId ? entries.find((item) => item.id === editingId) : undefined;
    const entry: KiwiEntry = {
      ...previous,
      id: editingId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: form.date,
      category: form.category,
      title: language === "es" ? form.title.trim() : previous?.title ?? form.title.trim(),
      notes: language === "es" ? form.notes.trim() : previous?.notes ?? form.notes.trim(),
      ...(language === "en" ? { titleEn: form.title.trim(), notesEn: form.notes.trim() } : {}),
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
    };
    setEntries((current) => editingId
      ? current.map((item) => item.id === editingId ? entry : item)
      : [...current, entry]);
    setModalOpen(false);
    flash(editingId ? t.updated : t.saved);
  }

  function deleteEntry(id: string) {
    if (!window.confirm(t.deleteConfirm)) return;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    flash(t.deleted);
  }

  function exportData() {
    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), kiwi: { birthDate: BIRTH_DATE }, entries }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `kiwi-diary-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    flash(t.backupDownloaded);
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { entries?: KiwiEntry[] };
        if (!Array.isArray(parsed.entries)) throw new Error("invalid");
        setEntries(parsed.entries);
        flash(t.backupImported);
      } catch {
        flash(t.invalidBackup);
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label={t.home}>
          <span className="brand-mark">K</span>
          <span>{t.brand}</span>
        </a>
        <div className="preference-controls">
          <div className="preference-toggle" role="group" aria-label={t.language}>
            <button className={language === "es" ? "active" : ""} onClick={() => setLanguage("es")} aria-pressed={language === "es"}><span className="flag-icon flag-es" aria-hidden="true" /><span>ES</span></button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}><span className="flag-icon flag-uk" aria-hidden="true" /><span>EN</span></button>
          </div>
          <div className="preference-toggle theme-toggle" role="group" aria-label={t.appearance}>
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")} aria-label={t.light} aria-pressed={theme === "light"}>☀</button>
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")} aria-label={t.dark} aria-pressed={theme === "dark"}>☾</button>
          </div>
        </div>
        <div className="header-actions">
          <button className="quiet-button desktop-action" onClick={exportData}>↓ {t.backup}</button>
          <button className="primary-button new-entry-button" onClick={() => openNew()}>＋ <span>{t.newRecord}</span></button>
        </div>
      </header>

      <div className="page" id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{t.storyEyebrow}</p>
            <h1>{t.heroFirst}<br /><em>{t.heroSecond}</em></h1>
            <p className="hero-description">{t.heroDescription}</p>
            <button className="text-button" onClick={() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })}>{t.viewStory} <span>→</span></button>
          </div>
          <div className="kiwi-portrait" aria-label={t.portraitAria}>
            <div className="sun-dot dot-one" />
            <div className="sun-dot dot-two" />
            <img className="kiwi-kitten-image" src={asset("/kiwi-carey-gris.png")} alt={t.portraitAlt} />
            <span className="portrait-caption">{t.portraitCaption}</span>
          </div>
        </section>

        <section className="stats" aria-label={t.summary}>
          <article>
            <span className="stat-icon age">✦</span>
            <div><p>{t.ageToday}</p><strong>{age.label}</strong></div>
          </article>
          <article>
            <span className="stat-icon weight">◒</span>
            <div><p>{t.latestWeight}</p><strong>{latestWeight ? `${latestWeight.weightKg?.toLocaleString(language === "es" ? "es-ES" : "en-GB")} kg` : "—"}</strong>{latestWeight && <small>{formatDate(latestWeight.date, language)}</small>}</div>
          </article>
          <article>
            <span className="stat-icon records">⌁</span>
            <div><p>{t.memories}</p><strong>{entries.length}</strong></div>
          </article>
          <article>
            <span className="stat-icon wins">★</span>
            <div><p>{t.achievements}</p><strong>{achievements}</strong></div>
          </article>
        </section>

        <section className="kiwi-facts" aria-label={t.personality}>
          <article>
            <span className="fact-icon">◉</span>
            <div><p>{t.favouriteToys}</p><strong>{t.favouriteToysValue}</strong></div>
          </article>
          <article>
            <span className="fact-icon">✦</span>
            <div><p>{t.specialSkill}</p><strong>{t.specialSkillValue}</strong></div>
          </article>
        </section>

        <PhotoCarousel language={language} />

        <GrowthChart entries={entries} language={language} />

        <section className="panel timeline-panel" id="timeline" aria-labelledby="timeline-title">
          <div className="section-heading timeline-heading">
            <div>
              <p className="eyebrow">{t.timeline}</p>
              <h2 id="timeline-title">{t.kiwiStory}</h2>
            </div>
            <button className="outline-button" onClick={() => openNew("achievement")}>＋ {t.addMoment}</button>
          </div>

          <div className="filters" role="group" aria-label={t.filterTimeline}>
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{t.all} <span>{entries.length}</span></button>
            {(Object.keys(categories) as Category[]).map((key) => (
              <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>
                {categories[key].label[language]} <span>{entries.filter((entry) => entry.category === key).length}</span>
              </button>
            ))}
          </div>

          <div className="timeline-list">
            {filtered.map((entry) => {
              const category = categories[entry.category];
              const entryTitle = language === "en" ? entry.titleEn ?? entry.title : entry.title;
              const entryNotes = language === "en" ? entry.notesEn ?? entry.notes : entry.notes;
              return (
                <article className="timeline-entry" key={entry.id}>
                  <div className={`timeline-symbol ${category.className}`}>{category.icon}</div>
                  <div className="timeline-body">
                    <div className="entry-meta"><time>{formatDate(entry.date, language, true)}</time><span className={`tag ${category.className}`}>{category.label[language]}</span></div>
                    <h3>{entryTitle}</h3>
                    {entryNotes && <p>{entryNotes}</p>}
                    {entry.weightKg && (
                      <div className="measurements">
                        <span>⚖ {entry.weightKg.toLocaleString(language === "es" ? "es-ES" : "en-GB")} kg</span>
                      </div>
                    )}
                  </div>
                  <div className="entry-actions">
                    <button aria-label={`${t.edit} ${entryTitle}`} onClick={() => openEdit(entry)}>{t.edit}</button>
                    <button aria-label={`${t.delete} ${entryTitle}`} onClick={() => deleteEntry(entry.id)}>×</button>
                  </div>
                </article>
              );
            })}
            {!filtered.length && <div className="empty-list"><span>🐾</span><p>{t.noMoments}</p></div>}
          </div>
        </section>

        <section className="data-tools" aria-label={t.dataTools}>
          <div>
            <strong>{t.localData}</strong>
            <p>{t.localDataDescription}</p>
          </div>
          <div className="data-actions">
            <button className="quiet-button" onClick={exportData}>↓ {t.exportJson}</button>
            <button className="quiet-button" onClick={() => importRef.current?.click()}>↑ {t.importBackup}</button>
            <input ref={importRef} type="file" accept="application/json" onChange={importData} hidden />
          </div>
        </section>
      </div>

      <footer><span>{t.footerOne}</span><span>{t.footerTwo}</span></footer>

      {notice && <div className="toast" role="status">✓ {notice}</div>}

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><p className="eyebrow">{t.brand}</p><h2 id="modal-title">{editingId ? t.editRecord : t.newRecord}</h2></div>
              <button className="close-button" onClick={() => setModalOpen(false)} aria-label={t.close}>×</button>
            </div>
            <form onSubmit={submitEntry}>
              <div className="form-row">
                <label>{t.date}<input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
                <label>{t.category}<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })}>{(Object.keys(categories) as Category[]).map((key) => <option value={key} key={key}>{categories[key].label[language]}</option>)}</select></label>
              </div>
              <label>{t.title}<input type="text" required maxLength={80} placeholder={t.titlePlaceholder} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>{t.notes}<textarea rows={3} maxLength={400} placeholder={t.notesPlaceholder} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              <label>{t.weight} <span>(kg, {t.optional})</span><input type="number" min="0" step="0.01" inputMode="decimal" placeholder={language === "es" ? "1,40" : "1.40"} value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} /></label>
              <div className="modal-actions">
                <button type="button" className="quiet-button" onClick={() => setModalOpen(false)}>{t.cancel}</button>
                <button type="submit" className="primary-button">{editingId ? t.saveChanges : t.saveMemory}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
