import { useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, HelpCircle, Loader2, Mail, Send, X } from 'lucide-react';
import { sendSupportMessage } from '@/lib/support';

const SUPPORT_EMAIL = 'teamcollabcore@gmail.com';

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
  userName: string;
};

export default function HelpModal({ open, onClose, userName }: HelpModalProps) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function handleClose() {
    onClose();
    // Reset after the close animation-adjacent tick so a reopen doesn't flash old state.
    window.setTimeout(() => {
      setSubject('');
      setMessage('');
      setSent(false);
      setError('');
    }, 200);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be unavailable/blocked — the email is still visible and selectable either way.
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending || !subject.trim() || !message.trim()) return;
    setError('');
    setSending(true);
    try {
      await sendSupportMessage({ name: userName, subject: subject.trim(), message: message.trim() });
      setSent(true);
    } catch {
      setError("Couldn't send your message — try again, or email us directly below.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      <div className="card relative w-full max-w-sm animate-scale-in p-6">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-900"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="grid h-11 w-11 place-items-center rounded-xl bg-energy-50 text-energy-600">
          <HelpCircle className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink-900">Need Help?</h2>

        {sent ? (
          <div className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-energy-50/60 px-4 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-energy-600" strokeWidth={2} />
            <p className="text-sm font-semibold text-ink-900">Message sent!</p>
            <p className="text-xs text-ink-500">We'll get back to you at your account email soon.</p>
          </div>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-ink-500">
              Send us a message directly — we'll reply to your account email.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="help-subject" className="label">Subject</label>
                <input
                  id="help-subject"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="What's this about?"
                  maxLength={150}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="help-message" className="label">Message</label>
                <textarea
                  id="help-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what's going on..."
                  maxLength={5000}
                  rows={4}
                  className="input resize-none"
                  required
                />
              </div>
              {error && (
                <p role="alert" className="flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}
              <button type="submit" disabled={sending} className="btn-accent w-full disabled:cursor-not-allowed disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" />
                <span className="truncate text-sm font-medium text-ink-900">{SUPPORT_EMAIL}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-energy-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
