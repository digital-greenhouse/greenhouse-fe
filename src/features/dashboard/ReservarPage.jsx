import { useEffect, useMemo, useState } from 'react';
import DashboardMenu from './components/DashboardMenu';
import ReservaConfirmarStep from './components/reserva/ReservaConfirmarStep';
import ReservaDatosStep from './components/reserva/ReservaDatosStep';
import ReservaFechasStep from './components/reserva/ReservaFechasStep';
import ReservaSteps from './components/reserva/ReservaSteps';
import './ReservarPage.css';

const steps = [
  { id: 1, label: 'Fechas' },
  { id: 2, label: 'Datos' },
  { id: 3, label: 'Confirmar' },
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const today = normalizeDate(new Date());
  const [baseMonth, setBaseMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const months = useMemo(() => [baseMonth, addMonths(baseMonth, 1)], [baseMonth]);

  const unavailableDates = useMemo(() => buildUnavailableSet(months), [months]);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [attendees, setAttendees] = useState(30);
  const [currentStep, setCurrentStep] = useState(1);
  const [contactData, setContactData] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: 'Social',
    notes: '',
  });

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
  const canGoStep2 = Boolean(checkIn && checkOut && !rangeHasUnavailable);
  console.log({ rangeHasUnavailable, checkIn, checkOut });
  const hasContactData =
    contactData.fullName.trim() && contactData.email.trim() && contactData.phone.trim();
  const canGoStep3 = canGoStep2 && Boolean(hasContactData);

  const canAccessStep = (stepId) => {
    if (stepId === 1) {
      return true;
    }
    if (stepId === 2) {
      return canGoStep2;
    }
    return canGoStep3;
  };

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

  const handleStepChange = (stepId) => {
    if (canAccessStep(stepId)) {
      setCurrentStep(stepId);
    }
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

          <ReservaSteps
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            canAccessStep={canAccessStep}
          />

          {currentStep === 1 && (
            <ReservaFechasStep
              months={months}
              weekDays={weekDays}
              monthFormatter={monthFormatter}
              toDateKey={toDateKey}
              buildCalendarCells={buildCalendarCells}
              today={today}
              canGoPrevious={canGoPrevious}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              checkIn={checkIn}
              checkOut={checkOut}
              attendees={attendees}
              setAttendees={setAttendees}
              isUnavailable={isUnavailable}
              isInRange={isInRange}
              isSameDay={isSameDay}
              handleDateClick={handleDateClick}
              rangeHasUnavailable={rangeHasUnavailable}
              onContinue={() => handleStepChange(2)}
            />
          )}

          {currentStep === 2 && (
            <ReservaDatosStep
              data={contactData}
              onChange={setContactData}
              onBack={() => setCurrentStep(1)}
              onContinue={() => handleStepChange(3)}
            />
          )}

          {currentStep === 3 && (
            <ReservaConfirmarStep
              summary={{
                checkIn: checkIn ? shortDateFormatter.format(checkIn) : 'Sin definir',
                checkOut: checkOut ? shortDateFormatter.format(checkOut) : 'Sin definir',
                nights,
                attendees,
                estimatedTotal: moneyFormatter.format(estimatedTotal),
                fullName: contactData.fullName,
                email: contactData.email,
                phone: contactData.phone,
                eventType: contactData.eventType,
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}
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
