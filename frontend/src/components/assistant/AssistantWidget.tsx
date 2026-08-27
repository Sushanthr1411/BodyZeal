import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, Flame, Moon, Send, Sparkles, Target, X } from 'lucide-react';
import { loadRecentWorkouts, workoutsThisWeek, type RecentWorkout } from '@/lib/recentWorkouts';
import { currentStreak, muscleGroupVolumeAll, volumeByDay } from '@/utils/analytics';

type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };

const PRESETS = [
  { id: 'week', icon: CalendarCheck, label: 'How am I doing this week?' },
  { id: 'streak', icon: Flame, label: "What's my current streak?" },
  { id: 'rest', icon: Moon, label: 'Should I rest today?' },
  { id: 'focus', icon: Target, label: 'What should I train next?' },
] as const;

function buildReply(presetId: string, history: RecentWorkout[]): string {
  switch (presetId) {
    case 'week': {
      const count = workoutsThisWeek(history);
      const volume = volumeByDay(history, 7).reduce((sum, day) => sum + day.volume, 0);
      if (count === 0) return "You haven't logged a workout in the last 7 days yet — ready to start one?";
      return `This week you've finished ${count} ${count === 1 ? 'workout' : 'workouts'}, totaling ${volume.toLocaleString()} kg of volume. Keep it up!`;
    }
    case 'streak': {
      const streak = currentStreak(history);
      if (streak === 0) return 'No active streak right now — finish a workout today to start one.';
      return `You're on a ${streak}-day streak.${streak >= 5 ? " That's serious consistency — nice work." : ' Keep the momentum going!'}`;
    }
    case 'rest': {
      const streak = currentStreak(history);
      if (streak >= 4) return `You've trained ${streak} days in a row — a rest or light mobility day could help you recover and come back stronger.`;
      if (streak === 0) return "You don't have an active streak, so today's a great day to get moving if you're up for it.";
      return `You're ${streak} ${streak === 1 ? 'day' : 'days'} into your streak — training today is a reasonable call if you're feeling good.`;
    }
    case 'focus': {
      const totals = muscleGroupVolumeAll(history);
      const [group, volume] = Object.entries(totals).sort((a, b) => a[1] - b[1])[0] ?? [];
      if (!group) return "Log a few workouts and I'll tell you which muscle group needs more attention.";
      if (volume === 0) return `You haven't trained ${group} yet — could be a good focus for your next session.`;
      return `${group} has your lowest logged volume recently (${volume.toLocaleString()} kg) — worth prioritizing next.`;
    }
    default:
      return "I can help with your weekly summary, streak, rest-day suggestions, and training focus — try one of the quick prompts above.";
  }
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: "Hey! I'm your BodyZeal assistant. I can check your progress, streak, and training focus using your real logged data. Try a quick prompt below." },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function respond(userText: string, presetId?: string) {
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: userText }]);
    setTyping(true);
    window.setTimeout(() => {
      const history = loadRecentWorkouts();
      const reply = buildReply(presetId ?? 'unknown', history);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: reply }]);
      setTyping(false);
    }, 550);
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    respond(preset.label, preset.id);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    respond(text);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift sm:right-6"
          >
            <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-ink-950 px-4 py-4">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-energy-400/20 blur-3xl" />
              </div>
              <div className="relative flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-energy-400 text-ink-950">
                  <Sparkles className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">BodyZeal Assistant</p>
                  <p className="text-[11px] text-ink-300">Reads your real training data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/50 px-4 py-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-ink-900 text-white'
                        : 'rounded-bl-md border border-ink-200 bg-white text-ink-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-ink-200 bg-white px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-ink-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-ink-200 bg-white px-3 py-3">
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-energy-300 hover:bg-white"
                  >
                    <preset.icon className="h-3 w-3 text-energy-600" />
                    {preset.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about your training..."
                  className="input flex-1 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-energy-400 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-ink-400">
                Want deeper analytics? <Link to="/history" className="underline hover:text-ink-700">View full History</Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-6 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-energy-400 to-aqua-500 text-ink-950 shadow-lift transition-transform hover:scale-105 sm:right-6"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-energy-400/70" />
          </span>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            {open ? <X className="h-6 w-6" strokeWidth={2.5} /> : <Sparkles className="h-6 w-6" strokeWidth={2.5} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
