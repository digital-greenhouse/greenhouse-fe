import { useState } from 'react';

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
}) {
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);

  const handleAttendeesChange = (event) => {
    setAttendees(Number(event.target.value));
    setIsAttendeesOpen(false);
  };

  const handleAttendeesKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === 'Tab') {
      setIsAttendeesOpen(false);
    }
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
                const disabled = !cell.inMonth || cell.date < today || unavailable;
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
        <span className={`custom-select-wrapper ${isAttendeesOpen ? 'is-open' : ''}`}>
          <select
            id="asistentes"
            value={attendees}
            onChange={handleAttendeesChange}
            onKeyDown={handleAttendeesKeyDown}
            onFocus={() => setIsAttendeesOpen(true)}
            onBlur={() => setIsAttendeesOpen(false)}
            className="custom-select"
          >
            <option value={30}>30 personas</option>
            <option value={50}>50 personas</option>
            <option value={80}>80 personas</option>
            <option value={100}>100 personas</option>
          </select>
        </span>
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
