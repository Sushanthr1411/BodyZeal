const STEP_LABELS = ['Basic Profile', 'Body Information', 'Fitness Profile'];

export default function OnboardingProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs font-medium text-ink-500">{STEP_LABELS[currentStep - 1]}</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              index < currentStep ? 'bg-energy-400' : 'bg-ink-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
