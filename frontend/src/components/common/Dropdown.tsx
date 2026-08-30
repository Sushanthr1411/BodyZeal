import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

export type DropdownOption<T extends string> = { value: T; label: string };

type DropdownProps<T extends string> = {
  label: string;
  showLabel?: boolean;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  accentClassName?: string;
  buttonClassName?: string;
};

export default function Dropdown<T extends string>({
  label,
  showLabel = true,
  value,
  options,
  onChange,
  accentClassName = 'text-energy-600',
  buttonClassName = '',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {showLabel && <span className="label">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={showLabel ? undefined : label}
        className={`input flex items-center justify-between gap-2 text-left transition-shadow ${
          open ? 'ring-2 ring-ink-900/10 border-ink-900' : ''
        } ${buttonClassName}`}
      >
        <span className="truncate font-medium text-ink-900">{selected?.label ?? label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-ink-400">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift"
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => { onChange(option.value); setOpen(false); }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-ink-50 font-semibold text-ink-900' : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {option.label}
                    {active && <Check className={`h-3.5 w-3.5 ${accentClassName}`} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
