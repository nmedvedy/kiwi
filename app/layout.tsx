import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nmedvedy.github.io"),
  title: "El diario de Kiwi",
  description: "Crecimiento, recuerdos y aventuras de Kiwi.",
  alternates: { canonical: "/kiwi/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/kiwi/",
    siteName: "El diario de Kiwi",
    title: "El diario de Kiwi",
    description: "Crecimiento, recuerdos y aventuras de Kiwi.",
    images: [{
      url: "https://nmedvedy.github.io/kiwi/kiwi-share.jpg?v=3",
      width: 800,
      height: 800,
      type: "image/jpeg",
      alt: "Kiwi, gatita carey gris con botitas blancas",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "El diario de Kiwi",
    description: "Crecimiento, recuerdos y aventuras de Kiwi.",
    images: ["https://nmedvedy.github.io/kiwi/kiwi-share.jpg?v=3"],
  },
  other: { "codex-preview": "development" },
  icons: { icon: "./kiwi-favicon.svg", shortcut: "./kiwi-favicon.svg" },
};

const diaryMigration = `
(() => {
  try {
    const key = "kiwi-diary-v1";
    const latestEntries = [
      {
        id: "weight-3",
        date: "2026-07-27",
        category: "growth",
        title: "Nuevo control de peso",
        notes: "Kiwi registró un peso de 2,22 kg.",
        titleEn: "New weight check",
        notesEn: "Kiwi recorded a weight of 2.22 kg.",
        weightKg: 2.22
      },
      {
        id: "vaccine-trivalent-2",
        date: "2026-07-27",
        category: "health",
        title: "Segunda dosis de vacuna trivalente",
        notes: "Recibió la segunda dosis de su pauta de vacunación trivalente.",
        titleEn: "Second dose of the trivalent vaccine",
        notesEn: "She received the second dose in her trivalent vaccination schedule."
      },
      {
        id: "first-nap-with-mum",
        date: "2026-08-05",
        category: "achievement",
        title: "Primera siesta con mamá",
        notes: "Kiwi durmió por primera vez acurrucada junto a Melina.",
        titleEn: "First nap with mum",
        notesEn: "Kiwi slept curled up beside Melina for the first time."
      }
    ];
    const initialEntries = [
      { id: "born", date: "2026-04-02", category: "achievement", title: "Nació Kiwi", notes: "Nació en Valdemorillo, Comunidad de Madrid, España 🇪🇸.", titleEn: "Kiwi was born", notesEn: "She was born in Valdemorillo, Community of Madrid, Spain 🇪🇸." },
      { id: "home", date: "2026-05-22", category: "achievement", title: "Llegó a casa", notes: "Primer día de Kiwi con Nico y Melina.", titleEn: "She arrived home", notesEn: "Kiwi's first day with Nico and Melina." },
      { id: "weight-arrival", date: "2026-05-22", category: "growth", title: "Primer peso registrado", notes: "La pesaron el día que llegó a casa.", titleEn: "First recorded weight", notesEn: "She was weighed on the day she arrived home.", weightKg: 1 },
      { id: "name", date: "2026-05-22", category: "achievement", title: "Ya tiene nombre: Kiwi", notes: "Carey gris, con una franja crema en la cara y botitas blancas.", titleEn: "She already had a name: Kiwi", notesEn: "Grey tortoiseshell, with a cream stripe on her face and white paws." },
      { id: "weight-1", date: "2026-06-16", category: "growth", title: "Segundo control de peso", notes: "Subió 400 g desde que llegó a casa.", titleEn: "Second weight check", notesEn: "She gained 400 g since arriving home.", weightKg: 1.4 },
      { id: "vaccine-trivalent-1", date: "2026-06-27", category: "health", title: "Primera dosis de vacuna trivalente", notes: "Primer registro de su pauta de vacunación trivalente.", titleEn: "First dose of the trivalent vaccine", notesEn: "The first record in her trivalent vaccination schedule." },
      { id: "kneading", date: "2026-07-09", category: "behavior", title: "Amasa su camita", notes: "Lo hace a diario durante un rato y ronronea.", titleEn: "She kneads her bed", notesEn: "She does it every day for a while and purrs." },
      { id: "weight-2", date: "2026-07-10", category: "growth", title: "Nuevo control de peso", notes: "Subió 500 g desde el registro anterior.", titleEn: "New weight check", notesEn: "She gained 500 g since the previous record.", weightKg: 1.9 },
      { id: "harness", date: "2026-07-11", category: "training", title: "Exploró el ático con arnés", notes: "Paseo supervisado; se mostró curiosa y contenta.", titleEn: "She explored the attic in her harness", notesEn: "A supervised walk; she was curious and happy." },
      { id: "first-vomit", date: "2026-07-14", category: "health", title: "Primer vómito", notes: "Hoy Kiwi vomitó por primera vez.", titleEn: "First time vomiting", notesEn: "Today Kiwi vomited for the first time." },
      ...latestEntries
    ];
    const saved = window.localStorage.getItem(key);
    if (!saved) {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, entries: initialEntries }));
      return;
    }
    const parsed = JSON.parse(saved);
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    const ids = new Set(entries.map((entry) => entry.id));
    const missing = latestEntries.filter((entry) => !ids.has(entry.id));
    if (missing.length) {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, entries: [...entries, ...missing] }));
    }
  } catch {
    // The page will continue with its built-in initial data if local storage is unavailable.
  }
})();
`;

const napPhotoEnhancement = `
(() => {
  let photoData = "";
  let customSelected = false;
  let observerQueued = false;

  const language = () => document.documentElement.lang === "en" ? "en" : "es";
  const caption = () => language() === "en" ? "First nap with mum" : "Primera siesta con mamá";
  const alt = () => language() === "en"
    ? "Kiwi curled up beside Melina during their first nap together"
    : "Kiwi acurrucada junto a Melina durante su primera siesta juntas";

  const gallery = () => document.querySelector(".gallery-panel");
  const originalThumbnails = () => Array.from(document.querySelectorAll(".thumbnail-row button:not([data-kiwi-nap-thumb])"));

  const updateTotal = () => {
    const count = document.querySelector(".gallery-count");
    if (!count) return;
    if (customSelected) {
      if (count.textContent !== "18 / 18") count.textContent = "18 / 18";
      return;
    }
    const text = count.textContent || "01 / 17";
    const slash = text.indexOf("/");
    const current = slash >= 0 ? text.slice(0, slash).trim() : "01";
    const next = current + " / 18";
    if (count.textContent !== next) count.textContent = next;
  };

  const renderCustom = () => {
    if (!photoData) return;
    const mainImage = document.querySelector(".carousel-photo img");
    const mainButton = document.querySelector(".carousel-photo");
    const mainCaption = document.querySelector(".carousel-caption strong");
    const customThumb = document.querySelector("[data-kiwi-nap-thumb]");
    if (!mainImage || !mainCaption || !customThumb) return;

    originalThumbnails().forEach((button) => button.classList.remove("active"));
    customThumb.classList.add("active");
    customThumb.setAttribute("aria-current", "true");
    mainImage.src = photoData;
    mainImage.alt = alt();
    if (mainButton) mainButton.setAttribute("aria-label", (language() === "en" ? "Enlarge photo: " : "Ampliar foto: ") + caption());
    mainCaption.textContent = caption();
    updateTotal();
  };

  const selectOriginal = (index) => {
    const buttons = originalThumbnails();
    if (!buttons.length) return;
    customSelected = false;
    const customThumb = document.querySelector("[data-kiwi-nap-thumb]");
    if (customThumb) {
      customThumb.classList.remove("active");
      customThumb.removeAttribute("aria-current");
    }
    const safeIndex = Math.max(0, Math.min(index, buttons.length - 1));
    buttons[safeIndex].click();
    window.setTimeout(updateTotal, 0);
  };

  const openCustomLightbox = () => {
    const container = gallery();
    if (!container || document.querySelector("[data-kiwi-nap-lightbox]")) return;

    const overlay = document.createElement("div");
    overlay.className = "photo-lightbox";
    overlay.setAttribute("data-kiwi-nap-lightbox", "true");
    overlay.setAttribute("role", "presentation");

    const content = document.createElement("section");
    content.className = "lightbox-content";
    content.setAttribute("role", "dialog");
    content.setAttribute("aria-modal", "true");
    content.setAttribute("aria-label", caption());

    const close = document.createElement("button");
    close.className = "lightbox-close";
    close.setAttribute("aria-label", language() === "en" ? "Close enlarged photo" : "Cerrar foto ampliada");
    close.textContent = "×";

    const previous = document.createElement("button");
    previous.className = "lightbox-arrow previous";
    previous.setAttribute("aria-label", language() === "en" ? "Previous photo" : "Foto anterior");
    previous.textContent = "←";

    const image = document.createElement("img");
    image.src = photoData;
    image.alt = alt();

    const next = document.createElement("button");
    next.className = "lightbox-arrow next";
    next.setAttribute("aria-label", language() === "en" ? "Next photo" : "Foto siguiente");
    next.textContent = "→";

    const text = document.createElement("p");
    text.append(document.createTextNode(caption() + " "));
    const number = document.createElement("span");
    number.textContent = language() === "en" ? "18 of 18" : "18 de 18";
    text.append(number);

    const remove = () => overlay.remove();
    close.addEventListener("click", remove);
    overlay.addEventListener("mousedown", (event) => { if (event.target === overlay) remove(); });
    previous.addEventListener("click", () => { remove(); selectOriginal(originalThumbnails().length - 1); });
    next.addEventListener("click", () => { remove(); selectOriginal(0); });

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        remove();
        window.removeEventListener("keydown", onKeyDown);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    content.append(close, previous, image, next, text);
    overlay.append(content);
    container.append(overlay);
  };

  const wireGallery = () => {
    document.querySelectorAll("[data-kiwi-nap-photo]").forEach((node) => node.remove());
    const container = gallery();
    const row = document.querySelector(".thumbnail-row");
    if (!container || !row || !photoData) return;

    let customThumb = document.querySelector("[data-kiwi-nap-thumb]");
    if (!customThumb) {
      customThumb = document.createElement("button");
      customThumb.setAttribute("data-kiwi-nap-thumb", "true");
      const image = document.createElement("img");
      image.src = photoData;
      image.alt = "";
      image.loading = "lazy";
      customThumb.append(image);
      customThumb.addEventListener("click", () => {
        customSelected = true;
        renderCustom();
      });
      row.append(customThumb);
    }
    customThumb.setAttribute("aria-label", (language() === "en" ? "View photo 18: " : "Ver foto 18: ") + caption());

    originalThumbnails().forEach((button) => {
      if (button.getAttribute("data-kiwi-nap-wired") === "true") return;
      button.setAttribute("data-kiwi-nap-wired", "true");
      button.addEventListener("click", () => {
        customSelected = false;
        window.setTimeout(updateTotal, 0);
      }, true);
    });

    const previous = document.querySelector(".carousel-stage .carousel-arrow.previous");
    const next = document.querySelector(".carousel-stage .carousel-arrow.next");
    const mainButton = document.querySelector(".carousel-stage .carousel-photo");

    if (previous && previous.getAttribute("data-kiwi-nap-wired") !== "true") {
      previous.setAttribute("data-kiwi-nap-wired", "true");
      previous.addEventListener("click", (event) => {
        const buttons = originalThumbnails();
        if (customSelected) {
          event.preventDefault();
          event.stopImmediatePropagation();
          selectOriginal(buttons.length - 1);
          return;
        }
        if (buttons[0] && buttons[0].classList.contains("active")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          customSelected = true;
          renderCustom();
        }
      }, true);
    }

    if (next && next.getAttribute("data-kiwi-nap-wired") !== "true") {
      next.setAttribute("data-kiwi-nap-wired", "true");
      next.addEventListener("click", (event) => {
        const buttons = originalThumbnails();
        if (customSelected) {
          event.preventDefault();
          event.stopImmediatePropagation();
          selectOriginal(0);
          return;
        }
        const last = buttons[buttons.length - 1];
        if (last && last.classList.contains("active")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          customSelected = true;
          renderCustom();
        }
      }, true);
    }

    if (mainButton && mainButton.getAttribute("data-kiwi-nap-wired") !== "true") {
      mainButton.setAttribute("data-kiwi-nap-wired", "true");
      mainButton.addEventListener("click", (event) => {
        if (!customSelected) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openCustomLightbox();
      }, true);
    }

    if (customSelected) renderCustom();
    else updateTotal();
  };

  const scheduleWire = () => {
    if (observerQueued) return;
    observerQueued = true;
    window.requestAnimationFrame(() => {
      observerQueued = false;
      wireGallery();
    });
  };

  const install = async () => {
    try {
      const base = document.querySelector("base")?.href || window.location.href;
      const sourceUrl = new URL("gallery/18-kiwi-primera-siesta-mama.webp.b64", base);
      const encoded = (await fetch(sourceUrl).then((response) => response.text())).trim();
      photoData = "data:image/webp;base64," + encoded;
      wireGallery();
      const observer = new MutationObserver(scheduleWire);
      observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["lang"] });
    } catch {}
  };

  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <script dangerouslySetInnerHTML={{ __html: diaryMigration }} />
        {children}
        <script dangerouslySetInnerHTML={{ __html: napPhotoEnhancement }} />
      </body>
    </html>
  );
}
