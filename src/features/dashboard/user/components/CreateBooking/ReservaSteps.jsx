import PropTypes from 'prop-types';

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

ReservaSteps.propTypes = {
  canAccessStep: PropTypes.func,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  currentStep: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onStepChange: PropTypes.func,
};

export default ReservaSteps;
