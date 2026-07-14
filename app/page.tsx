"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Category = "growth" | "behavior" | "training" | "achievement" | "health";

type KiwiEntry = {
  id: string;
  date: string;
  category: Category;
  title: string;
  notes: string;
  weightKg?: number;
};

const STORAGE_KEY = "kiwi-diary-v1";
const BIRTH_DATE = "2026-04-02";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${BASE_PATH}${path}`;

const categories: Record<Category, { label: string; icon: string; className: string }> = {
  growth: { label: "Crecimiento", icon: "↗", className: "growth" },
  behavior: { label: "Comportamiento", icon: "◌", className: "behavior" },
  training: { label: "Entrenamiento", icon: "✓", className: "training" },
  achievement: { label: "Logro", icon: "★", className: "achievement" },
  health: { label: "Salud", icon: "+", className: "health" },
};

const initialEntries: KiwiEntry[] = [
  {
    id: "born",
    date: "2026-04-02",
    category: "achievement",
    title: "Nació Kiwi",
    notes: "Nació en Valdemorillo, Comunidad de Madrid, España 🇪🇸.",
  },
  {
    id: "home",
    date: "2026-05-22",
    category: "achievement",
    title: "Llegó a casa",
    notes: "Primer día de Kiwi con Nico y Melina.",
  },
  {
    id: "weight-arrival",
    date: "2026-05-22",
    category: "growth",
    title: "Primer peso registrado",
    notes: "La pesaron el día que llegó a casa.",
    weightKg: 1,
  },
  {
    id: "name",
    date: "2026-05-22",
    category: "achievement",
    title: "Ya tiene nombre: Kiwi",
    notes: "Carey gris, con una franja crema en la cara y botitas blancas.",
  },
  {
    id: "weight-1",
    date: "2026-06-16",
    category: "growth",
    title: "Segundo control de peso",
    notes: "Subió 400 g desde que llegó a casa.",
    weightKg: 1.4,
  },
  {
    id: "vaccine-trivalent-1",
    date: "2026-06-27",
    category: "health",
    title: "Primera dosis de vacuna trivalente",
    notes: "Primer registro de su pauta de vacunación trivalente.",
  },
  {
    id: "kneading",
    date: "2026-07-09",
    category: "behavior",
    title: "Amasa su camita",
    notes: "Lo hace a diario durante un rato y ronronea.",
  },
  {
    id: "weight-2",
    date: "2026-07-10",
    category: "growth",
    title: "Nuevo control de peso",
    notes: "Subió 500 g desde el registro anterior.",
    weightKg: 1.9,
  },
  {
    id: "harness",
    date: "2026-07-11",
    category: "training",
    title: "Exploró el ático con arnés",
    notes: "Paseo supervisado; se mostró curiosa y contenta.",
  },
  {
    id: "first-vomit",
    date: "2026-07-14",
    category: "health",
    title: "Primer vómito",
    notes: "Hoy Kiwi vomitó por primera vez.",
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

function formatDate(date: string, long = false) {
  return new Intl.DateTimeFormat("es-ES", long
    ? { day: "numeric", month: "long", year: "numeric" }
    : { day: "2-digit", month: "short" }).format(safeDate(date));
}

function getAge() {
  const start = safeDate(BIRTH_DATE).getTime();
  const today = new Date();
  const days = Math.max(0, Math.floor((today.getTime() - start) / 86400000));
  const months = Math.floor(days / 30.44);
  const rest = Math.max(0, Math.round(days - months * 30.44));
  return { days, label: months > 0 ? `${months} meses y ${rest} días` : `${days} días` };
}

function GrowthChart({ entries }: { entries: KiwiEntry[] }) {
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
          <p className="eyebrow">Evolución</p>
          <h2 id="growth-title">Cómo está creciendo</h2>
        </div>
      </div>

      {points.length ? (
        <div className="chart-shell">
          <svg viewBox="0 0 520 220" role="img" aria-label="Peso de Kiwi a lo largo del tiempo">
            {[0, 1, 2].map((lineIndex) => {
              const y = 50 + lineIndex * 63;
              return <line key={lineIndex} x1="48" x2="472" y1={y} y2={y} className="grid-line" />;
            })}
            {coords.length > 1 && <polyline points={line} className="chart-line" />}
            {coords.map(({ x, y, point, value }) => (
              <g key={point.id} className="chart-point">
                <circle cx={x} cy={y} r="6" />
                <text x={x} y={y - 14} textAnchor="middle">{value.toLocaleString("es-ES")} kg</text>
                <text x={x} y="204" textAnchor="middle" className="axis-text">{formatDate(point.date)}</text>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <div className="empty-chart">
          <span>⚖</span>
          <strong>Aún no hay datos de peso</strong>
          <p>Agregá dos registros para empezar a ver la curva.</p>
        </div>
      )}
    </section>
  );
}

function PhotoCarousel() {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<number | null>(null);
  const item = galleryItems[active];

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
          <p className="eyebrow">Álbum</p>
          <h2 id="gallery-title">Momentos de Kiwi</h2>
        </div>
        <span className="gallery-count">{String(active + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}</span>
      </div>

      <div
        className="carousel-stage"
        onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}
      >
        <button className="carousel-arrow previous" onClick={() => move(-1)} aria-label="Foto anterior">←</button>
        <button className="carousel-photo" onClick={() => setExpanded(true)} aria-label={`Ampliar foto: ${item.caption}`}>
          <img src={asset(item.src)} alt={item.alt} />
          <span className="zoom-hint">Ampliar ↗</span>
        </button>
        <button className="carousel-arrow next" onClick={() => move(1)} aria-label="Foto siguiente">→</button>
      </div>
      <div className="carousel-caption" aria-live="polite">
        <strong>{item.caption}</strong>
        <span>Una de sus pequeñas grandes escenas cotidianas.</span>
      </div>

      <div className="thumbnail-row" aria-label="Elegir una foto">
        {galleryItems.map((photo, index) => (
          <button
            key={photo.src}
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
            aria-label={`Ver foto ${index + 1}: ${photo.caption}`}
            aria-current={index === active ? "true" : undefined}
          >
            <img src={asset(photo.src)} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {expanded && (
        <div className="photo-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpanded(false); }}>
          <section className="lightbox-content" role="dialog" aria-modal="true" aria-label={item.caption}>
            <button className="lightbox-close" onClick={() => setExpanded(false)} aria-label="Cerrar foto ampliada">×</button>
            <button className="lightbox-arrow previous" onClick={() => move(-1)} aria-label="Foto anterior">←</button>
            <img src={asset(item.src)} alt={item.alt} />
            <button className="lightbox-arrow next" onClick={() => move(1)} aria-label="Foto siguiente">→</button>
            <p>{item.caption} <span>{active + 1} de {galleryItems.length}</span></p>
          </section>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [entries, setEntries] = useState<KiwiEntry[]>(initialEntries);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { entries?: KiwiEntry[] };
      if (Array.isArray(parsed.entries)) {
        const requiredIds = new Set(["vaccine-trivalent-1", "weight-2", "weight-arrival", "first-vomit"]);
        const savedIds = new Set(parsed.entries.map((entry) => entry.id));
        const newKnownEntries = initialEntries.filter((entry) => requiredIds.has(entry.id) && !savedIds.has(entry.id));
        const correctedEntries = parsed.entries.map((entry) => {
          if (entry.id === "name") {
            return { ...entry, date: "2026-05-22", notes: "Carey gris, con una franja crema en la cara y botitas blancas." };
          }
          if (entry.id === "weight-1") {
            return { ...entry, title: "Segundo control de peso", notes: "Subió 400 g desde que llegó a casa." };
          }
          if (entry.id === "born") {
            return { ...entry, date: "2026-04-02", notes: "Nació en Valdemorillo, Comunidad de Madrid, España 🇪🇸." };
          }
          if (entry.id === "vaccine-trivalent-1") {
            return { ...entry, category: "health" as Category };
          }
          return entry;
        });
        setEntries([...correctedEntries, ...newKnownEntries]);
      }
    } catch {
      setNotice("No pudimos leer el respaldo guardado en este navegador.");
    }
  }, []);

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
  const age = getAge();

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
      title: entry.title,
      notes: entry.notes,
      weightKg: entry.weightKg?.toString() ?? "",
    });
    setModalOpen(true);
  }

  function submitEntry(event: FormEvent) {
    event.preventDefault();
    const entry: KiwiEntry = {
      id: editingId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: form.date,
      category: form.category,
      title: form.title.trim(),
      notes: form.notes.trim(),
      ...(form.weightKg ? { weightKg: Number(form.weightKg) } : {}),
    };
    setEntries((current) => editingId
      ? current.map((item) => item.id === editingId ? entry : item)
      : [...current, entry]);
    setModalOpen(false);
    flash(editingId ? "Registro actualizado" : "Nuevo recuerdo guardado");
  }

  function deleteEntry(id: string) {
    if (!window.confirm("¿Eliminar este registro de la historia de Kiwi?")) return;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    flash("Registro eliminado");
  }

  function exportData() {
    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), kiwi: { birthDate: BIRTH_DATE }, entries }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `kiwi-diario-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    flash("Respaldo descargado");
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
        flash("Respaldo importado correctamente");
      } catch {
        flash("Ese archivo no parece un respaldo válido de Kiwi");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <span className="brand-mark">K</span>
          <span>El diario de Kiwi</span>
        </a>
        <div className="header-actions">
          <button className="quiet-button desktop-action" onClick={exportData}>↓ Respaldo</button>
          <button className="primary-button" onClick={() => openNew()}>＋ Nuevo registro</button>
        </div>
      </header>

      <div className="page" id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Su pequeña gran historia</p>
            <h1>Kiwi está creciendo<br /><em>demasiado rápido.</em></h1>
            <p className="hero-description">Guardá sus cambios, aprendizajes y momentos especiales en un solo lugar privado.</p>
            <button className="text-button" onClick={() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })}>Ver su historia <span>→</span></button>
          </div>
          <div className="kiwi-portrait" aria-label="Retrato ilustrado de Kiwi">
            <div className="sun-dot dot-one" />
            <div className="sun-dot dot-two" />
            <img className="kiwi-kitten-image" src={asset("/kiwi-carey-gris.png")} alt="Gatita carey gris con franja crema en la cara y botitas blancas" />
            <span className="portrait-caption">carey gris · botitas blancas</span>
          </div>
        </section>

        <section className="stats" aria-label="Resumen de Kiwi">
          <article>
            <span className="stat-icon age">✦</span>
            <div><p>Edad hoy</p><strong>{age.label}</strong></div>
          </article>
          <article>
            <span className="stat-icon weight">◒</span>
            <div><p>Último peso</p><strong>{latestWeight ? `${latestWeight.weightKg?.toLocaleString("es-ES")} kg` : "—"}</strong>{latestWeight && <small>{formatDate(latestWeight.date)}</small>}</div>
          </article>
          <article>
            <span className="stat-icon records">⌁</span>
            <div><p>Recuerdos</p><strong>{entries.length}</strong></div>
          </article>
          <article>
            <span className="stat-icon wins">★</span>
            <div><p>Logros</p><strong>{achievements}</strong></div>
          </article>
        </section>

        <section className="kiwi-facts" aria-label="Personalidad de Kiwi">
          <article>
            <span className="fact-icon">◉</span>
            <div><p>Juguetes favoritos</p><strong>Cazar ratones de mentira, los resortes y el túnel.</strong></div>
          </article>
          <article>
            <span className="fact-icon">✦</span>
            <div><p>Habilidad especial</p><strong>Saludar a mis padres cuando llegan, esconderme en los placares y maullar casi por todo.</strong></div>
          </article>
        </section>

        <PhotoCarousel />

        <GrowthChart entries={entries} />

        <section className="panel timeline-panel" id="timeline" aria-labelledby="timeline-title">
          <div className="section-heading timeline-heading">
            <div>
              <p className="eyebrow">Cronología</p>
              <h2 id="timeline-title">La historia de Kiwi</h2>
            </div>
            <button className="outline-button" onClick={() => openNew("achievement")}>＋ Agregar momento</button>
          </div>

          <div className="filters" role="group" aria-label="Filtrar cronología">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todo <span>{entries.length}</span></button>
            {(Object.keys(categories) as Category[]).map((key) => (
              <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>
                {categories[key].label} <span>{entries.filter((entry) => entry.category === key).length}</span>
              </button>
            ))}
          </div>

          <div className="timeline-list">
            {filtered.map((entry) => {
              const category = categories[entry.category];
              return (
                <article className="timeline-entry" key={entry.id}>
                  <div className={`timeline-symbol ${category.className}`}>{category.icon}</div>
                  <div className="timeline-body">
                    <div className="entry-meta"><time>{formatDate(entry.date, true)}</time><span className={`tag ${category.className}`}>{category.label}</span></div>
                    <h3>{entry.title}</h3>
                    {entry.notes && <p>{entry.notes}</p>}
                    {entry.weightKg && (
                      <div className="measurements">
                        <span>⚖ {entry.weightKg.toLocaleString("es-ES")} kg</span>
                      </div>
                    )}
                  </div>
                  <div className="entry-actions">
                    <button aria-label={`Editar ${entry.title}`} onClick={() => openEdit(entry)}>Editar</button>
                    <button aria-label={`Eliminar ${entry.title}`} onClick={() => deleteEntry(entry.id)}>×</button>
                  </div>
                </article>
              );
            })}
            {!filtered.length && <div className="empty-list"><span>🐾</span><p>Todavía no hay momentos en esta categoría.</p></div>}
          </div>
        </section>

        <section className="data-tools" aria-label="Herramientas de respaldo">
          <div>
            <strong>Tus datos se quedan acá</strong>
            <p>Se guardan en este navegador. Descargá un respaldo antes de cambiar de dispositivo o borrar sus datos.</p>
          </div>
          <div className="data-actions">
            <button className="quiet-button" onClick={exportData}>↓ Exportar JSON</button>
            <button className="quiet-button" onClick={() => importRef.current?.click()}>↑ Importar respaldo</button>
            <input ref={importRef} type="file" accept="application/json" onChange={importData} hidden />
          </div>
        </section>
      </div>

      <footer><span>Hecho para Kiwi con paciencia, juegos y Churu.</span><span>Datos locales · Sin cuentas · Sin servicios externos</span></footer>

      {notice && <div className="toast" role="status">✓ {notice}</div>}

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><p className="eyebrow">El diario de Kiwi</p><h2 id="modal-title">{editingId ? "Editar registro" : "Nuevo registro"}</h2></div>
              <button className="close-button" onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button>
            </div>
            <form onSubmit={submitEntry}>
              <div className="form-row">
                <label>Fecha<input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
                <label>Categoría<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })}>{(Object.keys(categories) as Category[]).map((key) => <option value={key} key={key}>{categories[key].label}</option>)}</select></label>
              </div>
              <label>Título<input type="text" required maxLength={80} placeholder="¿Qué pasó hoy?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>Notas<textarea rows={3} maxLength={400} placeholder="Un detalle que quieras recordar…" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              <label>Peso <span>(kg, opcional)</span><input type="number" min="0" step="0.01" inputMode="decimal" placeholder="1,40" value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} /></label>
              <div className="modal-actions">
                <button type="button" className="quiet-button" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="primary-button">{editingId ? "Guardar cambios" : "Guardar recuerdo"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
