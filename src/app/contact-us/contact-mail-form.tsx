"use client";

import { FormEvent, useState } from "react";

export default function ContactMailForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setSubmitError("Please fill in name, email, and message.");
      setSubmitMessage(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject || "General inquiry",
          message: trimmedMessage,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setSubmitError(data.error ?? "Failed to send message.");
        return;
      }

      setSubmitMessage(data.message ?? "Message sent successfully.");
      setName("");
      setEmail("");
      setSubject("General inquiry");
      setMessage("");
    } catch {
      setSubmitError("Could not send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Send us a message
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-slate-700">
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-4"
          />
        </label>

        <label className="grid gap-1.5 text-sm text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-4"
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm text-slate-700">
        Subject
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Subject"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-4"
        />
      </label>

      <label className="grid gap-1.5 text-sm text-slate-700">
        Message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="How can we help you?"
          className="resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-4"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {submitError ? (
        <p className="text-sm text-red-600">{submitError}</p>
      ) : null}
      {submitMessage ? (
        <p className="text-sm text-emerald-700">{submitMessage}</p>
      ) : null}
    </form>
  );
}
