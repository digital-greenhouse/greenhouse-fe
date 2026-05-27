import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import GenericFileDropzone from '../../../../../components/ui/loadFile/GenericFileDropzone';
import { createBooking } from '../../../../../api/bookings';
import FeedbackToast from '../../../../../components/ui/FeedbackToast';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';
import { convertToBase64 } from '../../../../../components/utils/ConvertBase64File';
import { sendPayment } from '../../../../../api/payment';

const RESERVA_DRAFT_KEY = 'reserva-draft-v1';

function ReservaConfirmarStep({
  summary,
  paymentProof,
  paymentProofError,
  onPaymentProofChange,
  onBack,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAmountError, setPaymentAmountError] = useState('');
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [draftData, setDraftData] = useState(null);
  const property = JSON.parse(localStorage.getItem("property"));

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(RESERVA_DRAFT_KEY);
    if (savedDraft) {
      setDraftData(JSON.parse(savedDraft));
    }
    setPaymentAmount(JSON.parse(savedDraft)?.quotedTotal * 0.5);
  }, [paymentAmount]);

  useEffect(() => {
    if (paymentProofError) {
      setFeedback({
        type: 'error',
        message: paymentProofError,
      });
    }
  }, [paymentProofError]);

  const extractNumericPrice = (priceString) => {
    if (!priceString) return 0;
    const cleaned = priceString.replace(/[^0-9]/g, '');
    return Number(cleaned) || 0;
  };

  const totalAmount = extractNumericPrice(summary?.estimatedTotal);
  const minPayment = Math.round(totalAmount * 0.5);
  const maxPayment = totalAmount;

  const validatePaymentAmount = (value) => {
    if (value === '' || value === null) {
      return 'Ingresa el monto de pago';
    }

    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      return 'Ingresa un monto valido';
    }

    if (numValue < minPayment) {
      return `El minimo permitido es ${minPayment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`;
    }

    if (numValue > maxPayment) {
      return `El maximo permitido es ${maxPayment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`;
    }

    return '';
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const numValue = Number(value);
    if (Number.isNaN(numValue)) return value;
    return numValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const extractNumericFromCurrency = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned;
  };

  const handlePaymentAmountChange = (event) => {
    const value = event.target.value;
    const numericValue = extractNumericFromCurrency(value);
    setPaymentAmount(numericValue);

    if (numericValue === '') {
      setPaymentAmountError('');
      return;
    }

    const error = validatePaymentAmount(numericValue);
    setPaymentAmountError(error);
  };

  const handlePaymentAmountBlur = () => {
    const error = validatePaymentAmount(paymentAmount);
    if (error) {
      const clampedValue = Math.min(Math.max(Number(paymentAmount) || minPayment, minPayment), maxPayment);
      setPaymentAmount(clampedValue.toString());
      setPaymentAmountError('');
    }
  };

  const handleFileSelect = (file) => {
    onPaymentProofChange(file || null);
  };

  const getRootProps = (extra = {}) => ({
    ...extra,
    role: 'button',
    tabIndex: 0,
    onClick: (event) => {
      extra.onClick?.(event);
      if (!event.defaultPrevented) {
        fileInputRef.current?.click();
      }
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    },
    onDragEnter: (event) => {
      extra.onDragEnter?.(event);
      event.preventDefault();
      setIsDragActive(true);
    },
    onDragOver: (event) => {
      extra.onDragOver?.(event);
      event.preventDefault();
    },
    onDragLeave: (event) => {
      extra.onDragLeave?.(event);
      setIsDragActive(false);
    },
    onDrop: (event) => {
      extra.onDrop?.(event);
      event.preventDefault();
      setIsDragActive(false);
      const file = event.dataTransfer?.files?.[0] || null;
      handleFileSelect(file);
    },
  });

  useEffect(() => {
    const saveData = async () => {
      console.log(await saveFile(5));
    }
    saveData();
  }, [paymentProof]);

  const saveFile = async (bookingId) => {
    try {
      if (paymentProof) {
        const base64 = await convertToBase64(paymentProof);

        return {
          booking_id: bookingId || 0,
          amount: paymentAmount,
          payment_method: "TRANSFERENCIA",
          proof_data: base64?.base64,
          proof_mime_type: base64?.mimeType,
        };
      }
      return {};
    } catch (error) {
      console.error('Error al convertir el archivo a base64:', error);
    }
  }

  const handleSaveBooking = async () => {
    const quoteId = summary?.idQuote || draftData?.contactData?.id_quote;

    if (!quoteId) {
      setFeedback({
        type: 'error',
        message: 'No se encontro la cotizacion para crear la reserva.',
      });
      return;
    }


    const paymentError = validatePaymentAmount(paymentAmount);
    if (paymentError && !paymentProof) {
      setFeedback({
        type: 'error',
        message: paymentError,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const booking = await createBooking({
        quote_id: quoteId,
        special_requests: summary.notes || '',
      });

      if (paymentProof) {
        const fileData = await saveFile(booking?.data?.id);
        await sendPayment(fileData);
      }

      setFeedback({
        type: 'success',
        message: `Reserva creada correctamente. Te contactaremos para confirmar el pago. Id de la reserva: ${booking.data.id}`,
      });

      globalThis.setTimeout(() => {
        sessionStorage.removeItem(RESERVA_DRAFT_KEY);
        const nextUrl = `${globalThis.location.pathname}?step=1`;
        globalThis.history.replaceState(null, '', nextUrl);
        globalThis.location.reload();
      }, 4000);
      sessionStorage.clear();
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error al crear la reserva:', error);
      setFeedback({
        type: 'error',
        message: 'No fue posible crear la reserva. Intenta nuevamente.',
      });
    }

  };

  const getInputProps = (extra = {}) => ({
    ...extra,
    ref: fileInputRef,
    type: 'file',
    style: { display: 'none' },
    onChange: (event) => {
      extra.onChange?.(event);
      const file = event.target.files?.[0] || null;
      handleFileSelect(file);
    },
  });

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
          <strong>Nombre:</strong> {user?.name || 'Sin definir'}
        </p>
        <p>
          <strong>Correo:</strong> {user?.email || 'Sin definir'}
        </p>
        <p>
          <strong>Telefono:</strong> {user?.phone || 'Sin definir'}
        </p>
        <p>
          <strong>Evento:</strong> {summary.eventType}
        </p>
        <p>
          <strong>Comentarios:</strong> {summary.notes || 'Sin comentarios'}
        </p>
      </div>

      <p className="confirm-total">
        <strong>Total estimado:</strong> {summary.estimatedTotal}
      </p>

      <div className="payment-proof-box">
        <p className="payment-proof-label">
          Monto de pago: Si deseas asegurar tu reserva, puedes realizar un abono mínimo del 50% del total estimado. También puedes continuar sin pagar en este momento.        </p>
        <div className="payment-amount-input-group">
          <input
            type="text"
            inputMode="numeric"
            value={formatCurrency(paymentAmount)}
            onChange={handlePaymentAmountChange}
            onBlur={handlePaymentAmountBlur}
            placeholder="$ 0"
            className="payment-amount-input"
            aria-invalid={Boolean(paymentAmountError)}
            aria-describedby="payment-amount-help payment-amount-error"
          />
          <span className="payment-amount-currency">COP</span>
        </div>
        <p id="payment-amount-help" className="payment-amount-help-text">
          Minimo: {minPayment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} | Maximo: {maxPayment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
        </p>
        {paymentAmountError && (
          <p id="payment-amount-error" className="payment-amount-error-text" role="alert">
            {paymentAmountError}
          </p>
        )}

        <p className="payment-proof-label" style={{ marginTop: '1rem' }}>
          Comprobante de pago (imagen o PDF, max 5 MB)
        </p>
        <GenericFileDropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          file={paymentProof}
          accept="image/*,.pdf"
          emptyLabel="Haga clic para cargar o arrastre y suelte (imagen o PDF, max 5 MB)"
          activeLabel="Suelta el comprobante aqui..."
        />

        {paymentProof && (
          <p className="payment-proof-name">
            Archivo seleccionado: <strong>{paymentProof.name}</strong>
          </p>
        )}

        {paymentProofError && (
          <p className="calendar-alert" role="alert">
            {paymentProofError}
          </p>
        )}
      </div>

      <div className="step-actions">
        <button type="button" className="step-btn step-btn-secondary" onClick={onBack} disabled={isSubmitting}>
          Volver a datos
        </button>
        <button
          type="button"
          className="step-btn"
          onClick={() => setShowSubmitConfirm(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </div>

      <ConfirmModal
        show={showSubmitConfirm}
        title="Enviar solicitud"
        message="Se enviara tu solicitud de reserva con el comprobante cargado. Deseas continuar?"
        confirmText="Si, enviar"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSaveBooking();
        }}
        onCancel={() => setShowSubmitConfirm(false)}
        variant="primary"
      />

      <FeedbackToast
        show={Boolean(feedback.message)}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />
    </section>
  );
}

ReservaConfirmarStep.propTypes = {
  summary: PropTypes.shape({
    estimatedTotal: PropTypes.string,
    idQuote: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    notes: PropTypes.string,
    checkIn: PropTypes.string,
    checkOut: PropTypes.string,
    nights: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    attendees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eventType: PropTypes.string,
  }),
  paymentProof: PropTypes.shape({
    name: PropTypes.string,
  }),
  paymentProofError: PropTypes.string,
  onPaymentProofChange: PropTypes.func,
  onBack: PropTypes.func,
};

export default ReservaConfirmarStep;
