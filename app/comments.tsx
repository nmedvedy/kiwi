"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Timestamp,
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

type Language = "es" | "en";

type GuestComment = {
  id: string;
  name: string;
  comment: string;
  createdAt: Timestamp | null;
  photoDataUrl?: string;
};

export type GuestbookPhoto = {
  id: string;
  dataUrl: string;
  name: string;
};

const MAX_PHOTO_LENGTH = 150_000;

async function compressPhoto(file: File) {
  if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) throw new Error("invalid-photo");
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("invalid-photo"));
      image.src = objectUrl;
    });

    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    let scale = Math.min(1, 900 / longestSide);
    let latest = "";

    for (let sizePass = 0; sizePass < 4; sizePass += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("invalid-photo");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (let quality = 0.8; quality >= 0.35; quality -= 0.1) {
        latest = canvas.toDataURL("image/jpeg", quality);
        if (latest.length <= MAX_PHOTO_LENGTH) return latest;
      }
      scale *= 0.76;
    }

    if (latest && latest.length <= MAX_PHOTO_LENGTH) return latest;
    throw new Error("photo-too-large");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyApXW7hhzx-WpmTHqbMhluQ87H8_nQcHsw",
  authDomain: "kiwi-diario.firebaseapp.com",
  projectId: "kiwi-diario",
  storageBucket: "kiwi-diario.firebasestorage.app",
  messagingSenderId: "700042878998",
  appId: "1:700042878998:web:3a632fbca5b72d8a449537",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const copy = {
  es: {
    eyebrow: "Libro de visitas",
    title: "Dejame un Mensaje",
    description: "Si ya me conocés o querés conocerme, dejá un mensaje sobre mí. Mis humanos preferidos me lo leerán. También podés dejar una foto de cuándo me cuidaste o visitaste 😼",
    name: "Nombre",
    namePlaceholder: "¿Cómo te llamás?",
    comment: "Comentario",
    commentPlaceholder: "Escribí algo lindo para Kiwi…",
    photo: "Foto (opcional)",
    photoHelp: "Se comprimirá antes de publicarse y también aparecerá en el álbum.",
    choosePhoto: "Elegir foto",
    changePhoto: "Cambiar foto",
    removePhoto: "Quitar",
    processingPhoto: "Preparando foto…",
    photoError: "Elegí una imagen JPG, PNG o WebP de hasta 12 MB.",
    send: "Dejar comentario",
    sending: "Publicando…",
    loading: "Buscando mensajes…",
    empty: "Todavía no hay comentarios. ¡Podés dejar el primero!",
    success: "¡Gracias! Tu comentario ya está publicado.",
    error: "No pudimos publicar el comentario. Probá nuevamente.",
    loadError: "No pudimos cargar los comentarios en este momento.",
    anonymous: "Visitante",
  },
  en: {
    eyebrow: "Guestbook",
    title: "Leave me a Message",
    description: "If you already know me or would like to, leave me a message. My favourite humans will read it to me. You can also share a photo from when you looked after or visited me 😼",
    name: "Name",
    namePlaceholder: "What's your name?",
    comment: "Comment",
    commentPlaceholder: "Write something lovely for Kiwi…",
    photo: "Photo (optional)",
    photoHelp: "It will be compressed before posting and will also appear in the album.",
    choosePhoto: "Choose photo",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    processingPhoto: "Preparing photo…",
    photoError: "Choose a JPG, PNG or WebP image up to 12 MB.",
    send: "Leave a comment",
    sending: "Posting…",
    loading: "Fetching messages…",
    empty: "There are no comments yet. You can leave the first one!",
    success: "Thank you! Your comment is now published.",
    error: "We couldn't publish the comment. Please try again.",
    loadError: "We couldn't load the comments right now.",
    anonymous: "Visitor",
  },
} as const;

export default function Guestbook({ language, onPhotosChange }: { language: Language; onPhotosChange?: (photos: GuestbookPhoto[]) => void }) {
  const [comments, setComments] = useState<GuestComment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const t = copy[language];

  useEffect(() => {
    const commentsQuery = query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(30));
    return onSnapshot(
      commentsQuery,
      (snapshot) => {
        const nextComments = snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            name: typeof data.name === "string" ? data.name : "",
            comment: typeof data.comment === "string" ? data.comment : "",
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
            photoDataUrl: typeof data.photoDataUrl === "string" && data.photoDataUrl.startsWith("data:image/jpeg;base64,") ? data.photoDataUrl : undefined,
          };
        });
        setComments(nextComments);
        onPhotosChange?.(nextComments
          .filter((item) => item.photoDataUrl)
          .map((item) => ({ id: item.id, dataUrl: item.photoDataUrl as string, name: item.name })));
        setLoading(false);
      },
      () => {
        setFeedback({ kind: "error", text: t.loadError });
        setLoading(false);
      },
    );
  }, [onPhotosChange, t.loadError]);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(
    language === "es" ? "es-ES" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  ), [language]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanMessage = message.trim();
    if (!cleanName || !cleanMessage || cleanName.length > 40 || cleanMessage.length > 150) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await addDoc(collection(db, "comments"), {
        name: cleanName,
        comment: cleanMessage,
        createdAt: serverTimestamp(),
        ...(photoDataUrl ? { photoDataUrl } : {}),
      });
      setName("");
      setMessage("");
      setPhotoDataUrl("");
      setFeedback({ kind: "success", text: t.success });
    } catch {
      setFeedback({ kind: "error", text: t.error });
    } finally {
      setSubmitting(false);
    }
  }

  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProcessingPhoto(true);
    setFeedback(null);
    try {
      setPhotoDataUrl(await compressPhoto(file));
    } catch {
      setPhotoDataUrl("");
      setFeedback({ kind: "error", text: t.photoError });
    } finally {
      setProcessingPhoto(false);
    }
  }

  return (
    <section className="panel guestbook-panel" id="guestbook" aria-labelledby="guestbook-title">
      <div className="guestbook-heading">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="guestbook-title">{t.title}</h2>
          <p>{t.description}</p>
        </div>
        <span className="guestbook-count">{comments.length}</span>
      </div>

      <form className="guestbook-form" onSubmit={submitComment}>
        <label>
          {t.name}
          <input
            type="text"
            required
            maxLength={40}
            autoComplete="name"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          <span className="guestbook-label-row"><strong>{t.comment}</strong><small>{message.length}/150</small></span>
          <textarea
            required
            rows={3}
            maxLength={150}
            placeholder={t.commentPlaceholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <div className="guestbook-photo-field">
          <div>
            <strong>{t.photo}</strong>
            <small>{t.photoHelp}</small>
          </div>
          {photoDataUrl ? (
            <div className="guestbook-photo-preview">
              <img src={photoDataUrl} alt="" />
              <div>
                <label className="photo-picker-button">
                  {t.changePhoto}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} hidden />
                </label>
                <button type="button" className="photo-remove-button" onClick={() => setPhotoDataUrl("")}>{t.removePhoto}</button>
              </div>
            </div>
          ) : (
            <label className="photo-picker-button">
              {processingPhoto ? t.processingPhoto : `＋ ${t.choosePhoto}`}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} disabled={processingPhoto} hidden />
            </label>
          )}
        </div>
        <div className="guestbook-submit-row">
          <span className={feedback ? `guestbook-feedback ${feedback.kind}` : "guestbook-feedback"} role="status">
            {feedback?.text ?? ""}
          </span>
          <button className="primary-button" type="submit" disabled={submitting || processingPhoto}>
            {submitting ? t.sending : t.send}
          </button>
        </div>
      </form>

      <div className="guestbook-comments" aria-live="polite">
        {loading && <p className="guestbook-state">{t.loading}</p>}
        {!loading && !comments.length && <p className="guestbook-state">{t.empty}</p>}
        {comments.map((item) => (
          <article className="guestbook-comment" key={item.id}>
            <span className="comment-avatar">{(item.name || t.anonymous).charAt(0).toUpperCase()}</span>
            <div>
              <div className="comment-meta">
                <strong>{item.name || t.anonymous}</strong>
                {item.createdAt && <time dateTime={item.createdAt.toDate().toISOString()}>{dateFormatter.format(item.createdAt.toDate())}</time>}
              </div>
              <p>{item.comment}</p>
              {item.photoDataUrl && <img className="guestbook-comment-photo" src={item.photoDataUrl} alt={`${item.name || t.anonymous} y Kiwi`} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
