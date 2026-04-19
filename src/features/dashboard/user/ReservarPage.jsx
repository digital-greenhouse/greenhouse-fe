import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import DashboardMenu from './components/DashboardMenu';
import ReservaConfirmarStep from './components/reserva/ReservaConfirmarStep';
import ReservaDatosStep from './components/reserva/ReservaDatosStep';
import ReservaFechasStep from './components/reserva/ReservaFechasStep';
import ReservaSteps from './components/reserva/ReservaSteps';
import { createQuote } from '../../../api/reservations';
import { getHistory } from '../../../api/reservations';
import './ReservarPage.css';

const steps = [
  { id: 1, label: 'Fechas' },
  { id: 2, label: 'Datos' },
  { id: 3, label: 'Confirmar' },
];

const tags = ['BBQ', 'Parqueadero', 'Eventos', 'Senderos', '100 personas'];

const DAY_MS = 24 * 60 * 60 * 1000;
const RESERVA_DRAFT_KEY = 'reserva-draft-v1';
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

function fromDateKey(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getSavedDraft() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(RESERVA_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

function parseBackendDate(dateValue) {
  if (!dateValue || typeof dateValue !== 'string' || dateValue.length < 10) {
    return null;
  }

  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function buildUnavailableSetFromBookings(bookings) {
  const entries = new Set();

  bookings.forEach((booking) => {
    const start = parseBackendDate(booking?.check_in_date);
    const end = parseBackendDate(booking?.check_out_date);

    if (!start || !end || end < start) {
      return;
    }

    let current = start;
    while (current <= end) {
      entries.add(toDateKey(current));
      current = addDays(current, 1);
    }
  });

  return entries;
}

function parseStepFromSearch(searchParams) {
  const rawStep = Number(searchParams.get('step'));
  if (!Number.isInteger(rawStep) || rawStep < 1 || rawStep > 3) {
    return 1;
  }

  return rawStep;
}

function ReservarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedDraft] = useState(() => getSavedDraft());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const today = normalizeDate(new Date());
  const [baseMonth, setBaseMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const months = useMemo(() => [baseMonth, addMonths(baseMonth, 1)], [baseMonth]);
  const [unavailableDates, setUnavailableDates] = useState(new Set());

  const [checkIn, setCheckIn] = useState(() => fromDateKey(savedDraft?.checkIn) || null);
  const [checkOut, setCheckOut] = useState(() => fromDateKey(savedDraft?.checkOut) || null);
  const [attendees, setAttendees] = useState(() => Number(savedDraft?.attendees) || 30);
  const [quote, setQuote] = useState();
  const [loadingDates, setLoadingDates] = useState(false);
  const [contactData, setContactData] = useState({
    id_quote: savedDraft?.contactData?.id_quote || 0,
    fullName: savedDraft?.contactData?.fullName || '',
    email: savedDraft?.contactData?.email || '',
    phone: savedDraft?.contactData?.phone || '',
    eventType: savedDraft?.contactData?.eventType || 'Social',
    notes: savedDraft?.contactData?.notes || '',
  });
  const [quotedTotal, setQuotedTotal] = useState(
    savedDraft?.quotedTotal !== null && savedDraft?.quotedTotal !== undefined
      ? Number(savedDraft.quotedTotal)
      : null
  );
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofError, setPaymentProofError] = useState('');
  const previousAttendeesRef = useRef(attendees);

  useEffect(() => {
    let cancelled = false;
    setLoadingDates(true);

    const loadUnavailableDates = async () => {
      try {
        const response = await getHistory();
        const bookings = Array.isArray(response?.data) ? response.data : [];

        if (!cancelled) {
          setUnavailableDates(buildUnavailableSetFromBookings(bookings));
        }
      } catch (error) {
        console.error('Error al obtener historial de reservas:', error);
        if (!cancelled) {
          setUnavailableDates(new Set());
        }
      } finally {
        setTimeout(() => {
          setLoadingDates(false);
        }, 900);
      }
    };

    loadUnavailableDates();

    return () => {
      cancelled = true;
    };
  }, []);

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
  const canGoStep2 = Boolean(checkIn && checkOut && !rangeHasUnavailable && quotedTotal !== null);
  const canGoStep3 = canGoStep2;
  const currentStep = parseStepFromSearch(searchParams);

  useEffect(() => {
    const stepIsInvalid =
      (currentStep === 2 && !canGoStep2) ||
      (currentStep === 3 && !canGoStep3);

    if (stepIsInvalid) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('step', '1');
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentStep, canGoStep2, canGoStep3, searchParams, setSearchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const draft = {
      checkIn: checkIn ? toDateKey(checkIn) : null,
      checkOut: checkOut ? toDateKey(checkOut) : null,
      attendees,
      quotedTotal,
      contactData,
    };

    sessionStorage.setItem(RESERVA_DRAFT_KEY, JSON.stringify(draft));
  }, [checkIn, checkOut, attendees, quotedTotal, contactData]);

  useEffect(() => {
    if (!searchParams.get('step')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('step', String(currentStep));
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, currentStep, setSearchParams]);

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
    setQuotedTotal(null);
    setQuoteError('');

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

  const handleQuote = async () => {
    if (!checkIn || !checkOut || rangeHasUnavailable || isQuoting) {
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || {});
    setIsQuoting(true);
    setQuoteError('');
    try {
      const response = await createQuote({
        property_id: user?.id || 0,
        check_in_date: new Date(toDateKey(checkIn)).toISOString(),
        check_out_date: new Date(toDateKey(checkOut)).toISOString(),
        guest_count: 1,
      })
      const total = response?.data?.calculated_total;
      setContactData(prev => ({
        ...prev,
        id_quote: response?.data?.id || 0,
      }));

      setQuote(response?.data);
      if (total === null) {

        setQuotedTotal(null);
        setQuoteError('No fue posible obtener la cotizacion. Intenta nuevamente.');
        return;
      }

      setQuotedTotal(total);
    } catch (error) {
      console.error('Error al obtener la cotizacion:', error.request);
      setQuotedTotal(null);
      setQuoteError('No fue posible obtener la cotizacion. Verifica e intenta de nuevo.');
    } finally {
      setIsQuoting(false);
    }
  };

  useEffect(() => {
    if (previousAttendeesRef.current === attendees) {
      return;
    }

    previousAttendeesRef.current = attendees;

    setQuotedTotal(null);
    setQuoteError('');
  }, [attendees]);

  const handlePaymentProofChange = (file) => {
    if (!file) {
      setPaymentProof(null);
      setPaymentProofError('');
      return;
    }

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const maxSize = 5 * 1024 * 1024;

    if (!isPdf && !isImage) {
      setPaymentProof(null);
      setPaymentProofError('El archivo debe ser una imagen o un PDF.');
      return;
    }

    if (file.size > maxSize) {
      setPaymentProof(null);
      setPaymentProofError('El archivo supera el tamano maximo de 5 MB.');
      return;
    }

    setPaymentProof(file);
    setPaymentProofError('');
  };

  const handleStepChange = (stepId) => {
    if (canAccessStep(stepId)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('step', String(stepId));
      setSearchParams(nextParams, { replace: true });
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
              onQuote={handleQuote}
              isQuoting={isQuoting}
              hasQuote={quotedTotal !== null}
              quoteError={quoteError}
              onContinue={() => handleStepChange(2)}
            />
          )}

          {currentStep === 2 && (
            <ReservaDatosStep
              data={contactData}
              onChange={setContactData}
              onBack={() => handleStepChange(1)}
              onContinue={() => handleStepChange(3)}
            />
          )}

          {currentStep === 3 && (
            <ReservaConfirmarStep
              summary={{
                idQuote: quote?.id || '',
                checkIn: checkIn ? shortDateFormatter.format(checkIn) : 'Sin definir',
                checkOut: checkOut ? shortDateFormatter.format(checkOut) : 'Sin definir',
                nights,
                attendees,
                estimatedTotal:
                  quotedTotal !== null ? moneyFormatter.format(quotedTotal) : 'Sin cotizar',
                fullName: contactData.fullName,
                email: contactData.email,
                phone: contactData.phone,
                eventType: contactData.eventType,
                notes: contactData.notes,
              }}
              paymentProof={paymentProof}
              paymentProofError={paymentProofError}
              onPaymentProofChange={handlePaymentProofChange}
              onBack={() => handleStepChange(2)}
            />
          )}
          {loadingDates && (
            <div className="loading-overlay">
              <Spinner animation="grow" size="lg" />
            </div>
          )}
        </article>

        <aside className="reserva-side-card">
          <h3>Cotizacion</h3>
          {!checkIn || !checkOut ? (
            <p>Selecciona fechas de check-in y check-out para ver la cotizacion.</p>
          ) : isQuoting ? (
            <p>Cargando cotizacion...</p>
          ) : quotedTotal === null ? (
            <p>Presiona el boton Cotizar para consultar el valor en tiempo real.</p>
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
                <strong>Total estimado:</strong> {moneyFormatter.format(quotedTotal)}
              </p>
            </div>
          )}

          {quoteError && <p className="calendar-alert">{quoteError}</p>}

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
