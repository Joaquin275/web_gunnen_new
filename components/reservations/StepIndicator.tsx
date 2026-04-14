interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Fecha" },
  { number: 2, label: "Hora" },
  { number: 3, label: "Menú" },
  { number: 4, label: "Personas" },
  { number: 5, label: "Pago" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center overflow-x-auto pb-1">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-sans transition-all flex-shrink-0 ${
                step.number === currentStep
                  ? "bg-primary text-white"
                  : step.number < currentStep
                  ? "bg-accent text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step.number < currentStep ? "✓" : step.number}
            </div>
            <span
              className={`mt-1 text-[9px] sm:text-xs tracking-wider uppercase text-center leading-tight max-w-[40px] sm:max-w-none ${
                step.number === currentStep
                  ? "text-primary font-semibold"
                  : step.number < currentStep
                  ? "text-accent"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-5 sm:w-12 h-px mx-1 sm:mx-2 mb-5 sm:mb-6 flex-shrink-0 transition-all ${
                step.number < currentStep ? "bg-accent" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
