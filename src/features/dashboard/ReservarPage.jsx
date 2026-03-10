import { useMemo, useState } from 'react';
import DashboardMenu from './components/DashboardMenu';
import './ReservarPage.css';

const steps = [
  { id: 1, label: 'Fechas', active: true },
  { id: 2, label: 'Datos', active: false },
  { id: 3, label: 'Confirmar', active: false },
];

const tags = ['BBQ', 'Parqueadero', 'Eventos', 'Senderos', '100 personas'];

const DAY_MS = 24 * 60 * 60 * 1000;
const weekDays = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];

const monthFormatter = new Intl.DateTimeFormat('es-CO', {
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
});

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function normalizeDate(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value, days) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

function addMonths(value, months) {
  return new Date(value.getFullYear(), value.getMonth() + months, 1);
}

function toDateKey(value) {
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

function isSameDay(a, b) {
  return toDateKey(a) === toDateKey(b);
}

function buildCalendarCells(monthDate) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstWeekDay = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -firstWeekDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      inMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

function buildUnavailableSet(months) {
  const entries = [];
  const pushDate = (year, month, day) => {
    const value = new Date(year, month, day);
    if (value.getMonth() === month) {
      entries.push(toDateKey(value));
    }
  };

  const firstMonth = months[0];
  const secondMonth = months[1];

  [16, 17, 18, 19, 20, 21, 22, 24, 25].forEach((day) =>
    pushDate(firstMonth.getFullYear(), firstMonth.getMonth(), day)
  );

  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].forEach((day) =>
    pushDate(secondMonth.getFullYear(), secondMonth.getMonth(), day)
  );

  return new Set(entries);
}

function ReservarPage() {
  const today = normalizeDate(new Date());
  const [baseMonth, setBaseMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const months = useMemo(() => [baseMonth, addMonths(baseMonth, 1)], [baseMonth]);

  const unavailableDates = useMemo(() => buildUnavailableSet(months), [months]);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [attendees, setAttendees] = useState(30);

  const isUnavailable = (value) => unavailableDates.has(toDateKey(value));

  const isInRange = (value) => {
    if (!checkIn || !checkOut) {
      return false;
    }

    return value > checkIn && value < checkOut;
  };

  const rangeHasUnavailable = useMemo(() => {
    if (!checkIn || !checkOut) {
      return false;
    }

    let current = checkIn;
    while (current <= checkOut) {
      if (isUnavailable(current)) {
        return true;
      }
      current = addDays(current, 1);
    }

    return false;
  }, [checkIn, checkOut, unavailableDates]);

  const nights = checkIn && checkOut ? Math.round((checkOut - checkIn) / DAY_MS) : 0;
  const estimatedTotal = nights > 0 ? nights * attendees * 35000 : 0;

  const canGoPrevious =
    baseMonth.getFullYear() > today.getFullYear() ||
    (baseMonth.getFullYear() === today.getFullYear() &&
      baseMonth.getMonth() > today.getMonth());

  const handlePrevMonth = () => {
    if (!canGoPrevious) {
      return;
    }
    setBaseMonth((current) => addMonths(current, -1));
  };

  const handleNextMonth = () => {
    setBaseMonth((current) => addMonths(current, 1));
  };

  const handleDateClick = (value) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(value);
      setCheckOut(null);
      return;
    }

    if (value <= checkIn) {
      setCheckIn(value);
      setCheckOut(null);
      return;
    }

    setCheckOut(value);
  };

  return (
    <main className="reservar-page">
      <DashboardMenu />

      <section className="reserva-layout" aria-label="Cotizacion de eventos">
        <article className="reserva-main-card">
          <p className="reserva-kicker">RESERVA EN LINEA</p>
          <h1>Planifica tu evento</h1>
          <p className="reserva-copy">
            Selecciona las fechas de tu evento, revisa el precio y envia tu solicitud.
            Te confirmaremos en menos de 24 horas.
          </p>

          <div className="reserva-steps" aria-label="Pasos de reserva">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`reserva-step ${step.active ? 'is-active' : ''}`}
              >
                <strong>{step.id}</strong>
                {step.label}
              </span>
            ))}
          </div>

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
                      <span className="month-nav-placeholder" aria-hidden="true" />
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
                <i className="dot dot-range" /> Rango
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
              <select
                id="asistentes"
                value={attendees}
                onChange={(event) => setAttendees(Number(event.target.value))}
              >
                <option value={30}>30 personas</option>
                <option value={50}>50 personas</option>
                <option value={80}>80 personas</option>
                <option value={100}>100 personas</option>
              </select>
            </div>

            <button
              className="quote-btn"
              type="button"
              disabled={!checkIn || !checkOut || rangeHasUnavailable}
            >
              Continuar con la cotizacion
            </button>
          </section>
        </article>

        <aside className="reserva-side-card">
          <h3>Cotizacion</h3>
          {!checkIn || !checkOut ? (
            <p>Selecciona fechas de check-in y check-out para ver la cotizacion.</p>
          ) : (
            <div className="quote-summary">
              <p>
                <strong>Check-in:</strong> {shortDateFormatter.format(checkIn)}
              </p>
              <p>
                <strong>Check-out:</strong> {shortDateFormatter.format(checkOut)}
              </p>
              <p>
                <strong>Noches:</strong> {nights}
              </p>
              <p>
                <strong>Asistentes:</strong> {attendees}
              </p>
              <p className="quote-price">
                <strong>Total estimado:</strong> {moneyFormatter.format(estimatedTotal)}
              </p>
            </div>
          )}

          <div className="tag-list">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ReservarPage;
