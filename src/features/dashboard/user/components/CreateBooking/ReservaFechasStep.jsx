import { useEffect, useState } from 'react';

const MIN_ATTENDEES = 1;

function ReservaFechasStep({
  months,
  weekDays,
  monthFormatter,
  toDateKey,
  buildCalendarCells,
  today,
  canGoPrevious,
  handlePrevMonth,
  handleNextMonth,
  checkIn,
  checkOut,
  attendees,
  setAttendees,
  isUnavailable,
  isInRange,
  isSameDay,
  handleDateClick,
  rangeHasUnavailable,
  onQuote,
  isQuoting,
  hasQuote,
  quoteError,
  onContinue,
  maxAttendees
}) {
  const [attendeesInput, setAttendeesInput] = useState(String(attendees));
  const [attendeesError, setAttendeesError] = useState('');

  const MAX_ATTENDEES = maxAttendees;

  useEffect(() => {
    setAttendeesInput(String(attendees));
  }, [attendees]);

  const validateAttendees = (value) => {
    if (Number.isNaN(value)) {
      return 'Ingresa un numero valido de asistentes.';
    }

    if (value < MIN_ATTENDEES) {
      return `El minimo permitido es ${MIN_ATTENDEES}.`;
    }

    if (value > MAX_ATTENDEES) {
      return 'Supera el limite permitido.';
    }

    return '';
  };

  const handleAttendeesChange = (event) => {
    const nextValue = event.target.value;
    setAttendeesInput(nextValue);

    if (nextValue === '') {
      setAttendeesError('Ingresa un numero de asistentes.');
      return;
    }

    const parsedValue = Number(nextValue);
    const error = validateAttendees(parsedValue);
    setAttendeesError(error);

    if (!error) {
      setAttendees(parsedValue);
    }
  };

  const handleAttendeesBlur = () => {
    const parsedValue = Number(attendeesInput);
    const error = validateAttendees(parsedValue);

    if (error) {
      const clampedValue = Math.min(Math.max(parsedValue || attendees, MIN_ATTENDEES), MAX_ATTENDEES);
      setAttendees(clampedValue);
      setAttendeesInput(String(clampedValue));
      setAttendeesError('');
      return;
    }

    setAttendeesError('');
  };

  const stepAttendees = (delta) => {
    const current = Number(attendeesInput);
    const safeCurrent = Number.isFinite(current) ? current : attendees;
    const nextValue = Math.min(Math.max(safeCurrent + delta, MIN_ATTENDEES), MAX_ATTENDEES);
    setAttendees(nextValue);
    setAttendeesInput(String(nextValue));
    setAttendeesError('');
  };

  return (
    <section className="calendar-box" aria-label="Selecciona fechas">
      <h2>Selecciona tus fechas</h2>

      <div className="months-grid">
        {months.map((monthDate, monthIndex) => (
          <div
            key={toDateKey(monthDate)}
            className={`month-block ${monthIndex === 1 ? 'desktop-only' : ''}`}
          >
            <div className="month-header">
              {monthIndex === 0 ? (
                <button
                  type="button"
                  className="month-nav-btn"
                  aria-label="Mes anterior"
                  onClick={handlePrevMonth}
                  disabled={!canGoPrevious}
                >
                  {'<'}
                </button>
              ) : (
                <span className="month-nav-placeholder" aria-hidden="true" />
              )}

              <p>{monthFormatter.format(monthDate)}</p>

              {monthIndex === 1 ? (
                <button
                  type="button"
                  className="month-nav-btn"
                  aria-label="Mes siguiente"
                  onClick={handleNextMonth}
                >
                  {'>'}
                </button>
              ) : (
                <>
                  <span className="month-nav-placeholder desktop-nav-placeholder" aria-hidden="true" />
                  <button
                    type="button"
                    className="month-nav-btn mobile-only-nav"
                    aria-label="Mes siguiente"
                    onClick={handleNextMonth}
                  >
                    {'>'}
                  </button>
                </>
              )}
            </div>

            <div className="days-grid" role="grid">
              {weekDays.map((day) => (
                <span key={`${toDateKey(monthDate)}-${day}`}>{day}</span>
              ))}

              {buildCalendarCells(monthDate).map((cell) => {
                const unavailable = isUnavailable(cell.date);
                const disabled = !cell.inMonth || cell.date <= today || unavailable;
                const isStart = checkIn && isSameDay(cell.date, checkIn);
                const isEnd = checkOut && isSameDay(cell.date, checkOut);
                const inRange = !unavailable && isInRange(cell.date);
                const isToday = isSameDay(cell.date, today);
                const dayClasses = [
                  'day-btn',
                  !cell.inMonth ? 'is-outside' : '',
                  cell.date < today ? 'is-past' : '',
                  unavailable ? 'is-unavailable' : '',
                  inRange ? 'is-range' : '',
                  isStart || isEnd ? 'is-selected' : '',
                  isToday ? 'is-today' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={`${toDateKey(monthDate)}-${toDateKey(cell.date)}`}
                    type="button"
                    className={dayClasses}
                    disabled={disabled}
                    onClick={() => handleDateClick(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="calendar-legend" aria-label="Leyenda de calendario">
        <span>
          <i className="dot dot-selected" /> Seleccionado
        </span>
        <span>
          <i className="dot dot-unavailable" /> No disponible
        </span>
        <span>
          <i className="dot dot-today" /> Hoy
        </span>
      </div>

      {rangeHasUnavailable && (
        <p className="calendar-alert" role="alert">
          Las fechas seleccionadas incluyen dias no disponibles. Por favor ajusta la
          seleccion.
        </p>
      )}

      <div className="assistants-row">
        <label htmlFor="asistentes">Numero de asistentes</label>
        <div className="attendees-stepper" role="group" aria-label="Control de asistentes">
          <button
            type="button"
            className="attendees-stepper-btn"
            onClick={() => stepAttendees(-1)}
            disabled={attendees <= MIN_ATTENDEES}
            aria-label="Disminuir asistentes"
          >
            -
          </button>
          <input
            id="asistentes"
            type="number"
            min={MIN_ATTENDEES}
            max={MAX_ATTENDEES}
            step={1}
            value={attendeesInput}
            onChange={handleAttendeesChange}
            onBlur={handleAttendeesBlur}
            className="attendees-stepper-input"
            aria-invalid={Boolean(attendeesError)}
            aria-describedby="attendees-limit attendees-error"
          />
          <button
            type="button"
            className="attendees-stepper-btn"
            onClick={() => stepAttendees(1)}
            disabled={attendees >= MAX_ATTENDEES}
            aria-label="Aumentar asistentes"
          >
            +
          </button>
           <span className="attendees-stepper-unit">personas</span>
        </div>
        <p id="attendees-limit" className="attendees-limit-text">
          Maximo permitido: {MAX_ATTENDEES} personas
        </p>
        {attendeesError && (
          <p id="attendees-error" className="attendees-error-text" role="alert">
            {attendeesError}
          </p>
        )}
      </div>

      {quoteError && (
        <p className="calendar-alert" role="alert">
          {quoteError}
        </p>
      )}

      <div className="quote-actions">
        <button
          className="quote-btn quote-btn-secondary"
          type="button"
          disabled={!checkIn || !checkOut || rangeHasUnavailable || isQuoting}
          onClick={onQuote}
        >
          {isQuoting ? 'Cotizando...' : 'Cotizar'}
        </button>

        {hasQuote && (
          <button
            className="quote-btn"
            type="button"
            disabled={!checkIn || !checkOut || rangeHasUnavailable}
            onClick={onContinue}
          >
            Continuar con tus datos
          </button>
        )}
      </div>
    </section>
  );
}

export default ReservaFechasStep;
