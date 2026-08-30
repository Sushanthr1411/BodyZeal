// Pure jsPDF + jspdf-autotable report generation — no DOM screenshotting.
// The earlier html2canvas-based approach (rasterizing a hidden report layout)
// turned out unreliable: text overlap under the default rendering pipeline,
// then a fully black page under foreignObjectRendering. Drawing real PDF text
// and tables directly sidesteps that whole class of bug — every page is
// native vector content, crisp, selectable, and small in file size.
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EXERCISES } from '@/data/exercises';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import {
  currentStreak,
  equipmentBreakdown,
  exerciseStats,
  loggedExerciseNames,
  muscleGroupBreakdown,
  recentSessionDurations,
  repRangeDistribution,
  topExercisesByVolume,
  volumeByDay,
  volumeByMonth,
  workoutsByDayOfWeek,
} from '@/utils/analytics';
import { formatTime } from '@/utils/workout';

type GenerateReportInput = {
  history: RecentWorkout[];
  userName: string;
  userEmail?: string;
};

type JsPDFWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

const MARGIN = 16;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const BOTTOM_SAFE_Y = PAGE_HEIGHT - 30; // leave room for at least a heading + one row before forcing a new page

const INK_900: [number, number, number] = [29, 24, 17];
const INK_500: [number, number, number] = [131, 118, 90];
const INK_200: [number, number, number] = [225, 217, 199];
const INK_50: [number, number, number] = [249, 247, 242];
const ENERGY_600: [number, number, number] = [105, 128, 25];

function finalY(doc: jsPDF): number {
  return (doc as JsPDFWithAutoTable).lastAutoTable.finalY;
}

function ensureSpace(doc: jsPDF, y: number, needed = 40): number {
  if (y + needed > BOTTOM_SAFE_Y) {
    doc.addPage();
    return MARGIN + 4;
  }
  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK_900);
  doc.text(title, MARGIN, y);
  return y + 5;
}

function drawTable(doc: jsPDF, title: string, head: string[], body: (string | number)[][], y: number): number {
  y = ensureSpace(doc, y, 30);
  y = drawSectionTitle(doc, title, y);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3, textColor: INK_900, lineColor: INK_200 },
    headStyles: { fillColor: INK_900, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: INK_50 },
    head: [head],
    body,
  });
  return finalY(doc) + 12;
}

export async function generateReportPdf({ history, userName, userEmail }: GenerateReportInput): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ---- Cover ----
  let y = 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...INK_900);
  doc.text('BodyZeal', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...ENERGY_600);
  doc.text('FITNESS PROGRESS REPORT', MARGIN, y + 6);

  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...INK_900);
  doc.text(userName, MARGIN, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...INK_500);
  if (userEmail) {
    doc.text(userEmail, MARGIN, y);
    y += 6;
  }
  const generatedLabel = `Generated ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
  doc.text(generatedLabel, MARGIN, y);
  y += 12;

  const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);
  const totalSets = history.reduce((sum, w) => sum + (w.totalSets ?? w.sets?.length ?? 0), 0);
  const streak = currentStreak(history);

  y = drawTable(
    doc,
    'Summary',
    ['Workouts Finished', 'Total Volume', 'Total Sets', 'Current Streak'],
    [[String(history.length), `${totalVolume.toLocaleString()} kg`, String(totalSets), `${streak} ${streak === 1 ? 'day' : 'days'}`]],
    y,
  );

  // ---- Training breakdown ----
  y = drawTable(
    doc,
    'Muscle Group Split (All-Time)',
    ['Muscle Group', 'Volume', '% of Total'],
    muscleGroupBreakdown(history).map((s) => [s.muscleGroup, `${s.volume.toLocaleString()} kg`, `${s.percent}%`]),
    y,
  );

  y = drawTable(
    doc,
    'Training Style (All-Time)',
    ['Style', 'Rep Range', 'Volume', '% of Total'],
    repRangeDistribution(history).map((s) => [s.label, s.range, `${s.volume.toLocaleString()} kg`, `${s.percent}%`]),
    y,
  );

  y = drawTable(
    doc,
    'Equipment Split (All-Time)',
    ['Equipment', 'Volume', '% of Total'],
    equipmentBreakdown(history).map((s) => [s.equipment, `${s.volume.toLocaleString()} kg`, `${s.percent}%`]),
    y,
  );

  y = drawTable(
    doc,
    'Top Exercises by Volume (All-Time)',
    ['Exercise', 'Volume', '% of Total'],
    topExercisesByVolume(history, 8).map((s) => [s.exerciseName, `${s.volume.toLocaleString()} kg`, `${s.percent}%`]),
    y,
  );

  // ---- Trends ----
  y = drawTable(
    doc,
    'Training Days (All-Time)',
    ['Day', 'Workouts'],
    workoutsByDayOfWeek(history).map((d) => [d.day, String(d.count)]),
    y,
  );

  y = drawTable(
    doc,
    'Volume Trend (Last 7 Days)',
    ['Date', 'Volume'],
    volumeByDay(history, 7).map((d) => [d.label, `${d.volume.toLocaleString()} kg`]),
    y,
  );

  y = drawTable(
    doc,
    'Monthly Volume (Last 6 Months)',
    ['Month', 'Volume'],
    volumeByMonth(history, 6).map((d) => [d.label, `${d.volume.toLocaleString()} kg`]),
    y,
  );

  const durations = recentSessionDurations(history, 10);
  if (durations.length > 0) {
    y = drawTable(
      doc,
      'Session Length (Recent Tracked Workouts)',
      ['Date', 'Duration'],
      durations.map((d) => [d.label, `${d.minutes} min`]),
      y,
    );
  }

  // ---- Workout history (own page, autoTable paginates the rest itself) ----
  const historyRows = history
    .slice()
    .sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1))
    .map((w) => [
      new Date(w.finishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      w.name,
      w.durationSeconds && w.durationSeconds > 0 ? formatTime(w.durationSeconds) : '—',
      String(w.totalSets ?? w.sets?.length ?? 0),
      `${w.totalVolume.toLocaleString()} kg`,
    ]);
  doc.addPage();
  y = MARGIN + 4;
  y = drawTable(doc, 'Workout History', ['Date', 'Workout', 'Duration', 'Sets', 'Volume'], historyRows, y);

  // ---- Personal records (own page) ----
  const recordRows = loggedExerciseNames(history)
    .map((name) => {
      const exercise = EXERCISES.find((e) => e.name === name);
      const stats = exerciseStats(history, name);
      if (!exercise || !stats) return null;
      return [
        exercise.name,
        exercise.muscleGroup,
        `${stats.heaviestWeightRecord.weight} kg × ${stats.heaviestWeightRecord.reps}`,
        `${stats.bestSetVolume.toLocaleString()} kg`,
        String(stats.timesPerformed),
      ];
    })
    .filter((row): row is string[] => row !== null)
    .sort((a, b) => Number(b[2].split(' ')[0]) - Number(a[2].split(' ')[0]));
  doc.addPage();
  y = MARGIN + 4;
  drawTable(doc, 'Personal Records', ['Exercise', 'Muscle Group', 'Best Weight', 'Best Volume Set', 'Times Trained'], recordRows, y);

  // ---- Footer on every page, stamped last since total page count isn't known until now ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...INK_200);
    doc.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text('BodyZeal Fitness Report', MARGIN, PAGE_HEIGHT - 9);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: 'right' });
  }

  const filename = `BodyZeal-Report-${userName.trim().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
