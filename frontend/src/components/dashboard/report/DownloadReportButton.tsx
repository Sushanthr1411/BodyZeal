import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import type { RecentWorkout } from '@/lib/recentWorkouts';

type DownloadReportButtonProps = {
  history: RecentWorkout[];
  userName: string;
  userEmail?: string;
};

/**
 * The report is drawn as native PDF text/tables (jsPDF + jspdf-autotable),
 * not a screenshot of rendered HTML — so generation is just data in, file out,
 * with no DOM mounting or render-settling to wait on. jsPDF itself is
 * dynamically imported (not bundled into the main chunk) since most visits
 * never click this button.
 */
export default function DownloadReportButton({ history, userName, userEmail }: DownloadReportButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    if (generating || history.length === 0) return;
    setError('');
    setGenerating(true);
    try {
      const { generateReportPdf } = await import('@/lib/pdfReport');
      await generateReportPdf({ history, userName, userEmail });
    } catch {
      setError("Couldn't generate the report — try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={generating || history.length === 0}
        title={history.length === 0 ? 'Log a workout first to generate a report' : 'Download a PDF report of your training'}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-sky-400/30 bg-sky-400/10 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-400/20 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:w-auto sm:px-4 sm:py-3"
      >
        {generating ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <FileDown className="h-4.5 w-4.5" strokeWidth={2} />}
        <span className="hidden sm:inline">{generating ? 'Generating…' : 'Download Report'}</span>
      </button>
      {error && <span className="text-xs text-coral-300">{error}</span>}
    </div>
  );
}
