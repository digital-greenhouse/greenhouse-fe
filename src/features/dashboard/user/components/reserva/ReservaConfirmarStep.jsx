import { useEffect, useRef, useState } from 'react';
import GenericFileDropzone from '../../../../../components/ui/loadFile/GenericFileDropzone';
import { createBooking } from '../../../../../api/bookings';
import FeedbackToast from '../../../../../components/ui/FeedbackToast';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';

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
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

    const [draftData, setDraftData] = useState(null);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(RESERVA_DRAFT_KEY);
    if (savedDraft) {
      setDraftData(JSON.parse(savedDraft));
    }
  }, []);

  useEffect(() => {
    if (paymentProofError) {
      setFeedback({
        type: 'error',
        message: paymentProofError,
      });
    }
  }, [paymentProofError]);

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

  const handleSaveBooking = async () => {
    const quoteId = summary?.idQuote || draftData?.contactData?.id_quote;

    if (!quoteId) {
      setFeedback({
        type: 'error',
        message: 'No se encontro la cotizacion para crear la reserva.',
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

      setFeedback({
        type: 'success',
        message: `Reserva creada correctamente. Te contactaremos para confirmar el pago. Id de la reserva: ${booking.data.id}`,
      });

      window.setTimeout(() => {
        sessionStorage.removeItem(RESERVA_DRAFT_KEY);
        const nextUrl = `${window.location.pathname}?step=1`;
        window.history.replaceState(null, '', nextUrl);
        window.location.reload();
      }, 6000);
      sessionStorage.clear();
    } catch (error) {
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

export default ReservaConfirmarStep;
