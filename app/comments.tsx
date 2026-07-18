"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
};

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
    description: "Si ya me conocés o querés conocerme, dejá un mensaje sobre mí. Mis humanos preferidos me lo leerán 😼",
    name: "Nombre",
    namePlaceholder: "¿Cómo te llamás?",
    comment: "Comentario",
    commentPlaceholder: "Escribí algo lindo para Kiwi…",
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
    description: "If you've met me or would like to, leave me a message about my behaviour and my favourite humans will read it to me 😼",
    name: "Name",
    namePlaceholder: "What's your name?",
    comment: "Comment",
    commentPlaceholder: "Write something lovely for Kiwi…",
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

export default function Guestbook({ language }: { language: Language }) {
  const [comments, setComments] = useState<GuestComment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const t = copy[language];

  useEffect(() => {
    const commentsQuery = query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(30));
    return onSnapshot(
      commentsQuery,
      (snapshot) => {
        setComments(snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            name: typeof data.name === "string" ? data.name : "",
            comment: typeof data.comment === "string" ? data.comment : "",
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          };
        }));
        setLoading(false);
      },
      () => {
        setFeedback({ kind: "error", text: t.loadError });
        setLoading(false);
      },
    );
  }, [t.loadError]);

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
      });
      setName("");
      setMessage("");
      setFeedback({ kind: "success", text: t.success });
    } catch {
      setFeedback({ kind: "error", text: t.error });
    } finally {
      setSubmitting(false);
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
        <div className="guestbook-submit-row">
          <span className={feedback ? `guestbook-feedback ${feedback.kind}` : "guestbook-feedback"} role="status">
            {feedback?.text ?? ""}
          </span>
          <button className="primary-button" type="submit" disabled={submitting}>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
