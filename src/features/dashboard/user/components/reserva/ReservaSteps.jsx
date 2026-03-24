function ReservaSteps({ steps, currentStep, onStepChange, canAccessStep }) {
  return (
    <div className="reserva-steps" aria-label="Pasos de reserva">
      {steps.map((step) => {
        const active = currentStep === step.id;
        const enabled = canAccessStep(step.id);

        return (
          <button
            key={step.id}
            type="button"
            className={`reserva-step ${active ? 'is-active' : ''}`}
            onClick={() => onStepChange(step.id)}
            disabled={!enabled}
          >
            <strong>{step.id}</strong>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}

export default ReservaSteps;
