function ReservaConfirmarStep({ summary, onBack }) {
  return (
    <section className="confirm-box" aria-label="Confirmar reserva">
      <h2>Confirmar solicitud</h2>
      <p>Revisa el resumen de tu evento antes de enviar la solicitud final.</p>

      <div className="confirm-grid">
        <p>
          <strong>Check-in:</strong> {summary.checkIn}
        </p>
        <p>
          <strong>Check-out:</strong> {summary.checkOut}
        </p>
        <p>
          <strong>Noches:</strong> {summary.nights}
        </p>
        <p>
          <strong>Asistentes:</strong> {summary.attendees}
        </p>
        <p>
          <strong>Nombre:</strong> {summary.fullName || 'Sin definir'}
        </p>
        <p>
          <strong>Correo:</strong> {summary.email || 'Sin definir'}
        </p>
        <p>
          <strong>Telefono:</strong> {summary.phone || 'Sin definir'}
        </p>
        <p>
          <strong>Evento:</strong> {summary.eventType}
        </p>
      </div>

      <p className="confirm-total">
        <strong>Total estimado:</strong> {summary.estimatedTotal}
      </p>

      <div className="step-actions">
        <button type="button" className="step-btn step-btn-secondary" onClick={onBack}>
          Volver a datos
        </button>
        <button type="button" className="step-btn">
          Enviar solicitud
        </button>
      </div>
    </section>
  );
}

export default ReservaConfirmarStep;
