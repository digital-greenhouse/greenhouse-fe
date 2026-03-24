function ReservaDatosStep({ data, onChange, onBack, onContinue }) {
  const handleInput = (event) => {
    const { name, value } = event.target;
    onChange((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="datos-box" aria-label="Datos del solicitante">
      <h2>Datos de contacto</h2>
      <p>Completa tus datos para continuar con la confirmacion de la reserva.</p>

      <div className="datos-grid">
        <label>
          Nombre completo
          <input
            name="fullName"
            type="text"
            value={data.fullName}
            onChange={handleInput}
            placeholder="Ej. Laura Martinez"
          />
        </label>

        <label>
          Correo electronico
          <input
            name="email"
            type="email"
            value={data.email}
            onChange={handleInput}
            placeholder="correo@dominio.com"
          />
        </label>

        <label>
          Telefono
          <input
            name="phone"
            type="tel"
            value={data.phone}
            onChange={handleInput}
            placeholder="3001234567"
          />
        </label>

        <label>
          Tipo de evento
          <select name="eventType" value={data.eventType} onChange={handleInput}>
            <option value="Social">Social</option>
            <option value="Corporativo">Corporativo</option>
            <option value="Cumpleanos">Cumpleanos</option>
            <option value="Boda">Boda</option>
          </select>
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
