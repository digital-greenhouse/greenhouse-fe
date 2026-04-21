import { useState } from 'react';

function ReservaDatosStep({ data, onChange, onBack, onContinue }) {
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);

  const handleInput = (event) => {
    const { name, value } = event.target;
    onChange((current) => ({ ...current, [name]: value }));
  };

  const handleEventTypeChange = (event) => {
    handleInput(event);
    setIsEventTypeOpen(false);
  };

  const handleEventTypeKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === 'Tab') {
      setIsEventTypeOpen(false);
    }
  };

  return (
    <section className="datos-box" aria-label="Datos del solicitante">
      <h2>Datos de contacto</h2>
      <p>Completa tus datos para continuar con la confirmacion de la reserva.</p>

      <div className="datos-grid">
        <label className="datos-full">
          Tipo de evento
          <span className={`custom-select-wrapper ${isEventTypeOpen ? 'is-open' : ''}`}>
            <select
              name="eventType"
              value={data.eventType}
              onChange={handleEventTypeChange}
              onKeyDown={handleEventTypeKeyDown}
              onFocus={() => setIsEventTypeOpen(true)}
              onBlur={() => setIsEventTypeOpen(false)}
              className="custom-select"
            >
              <option value="Social">Social</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Cumpleanos">Cumpleanos</option>
              <option value="Boda">Boda</option>
            </select>
          </span>
        </label>

        <label className="datos-full">
          Comentarios
          <textarea
            name="notes"
            value={data.notes}
            onChange={handleInput}
            placeholder="Cuantanos detalles importantes de tu evento"
            rows={4}
          />
        </label>
      </div>

      <div className="step-actions">
        <button type="button" className="step-btn step-btn-secondary" onClick={onBack}>
          Volver a fechas
        </button>
        <button type="button" className="step-btn" onClick={onContinue}>
          Revisar confirmacion
        </button>
      </div>
    </section>
  );
}

export default ReservaDatosStep;
