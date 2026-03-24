import { Toast, ToastContainer } from 'react-bootstrap';
import './FeedbackToast.css';

const ALLOWED_TYPES = ['success', 'error', 'info', 'warning'];

const TOAST_TITLE_BY_TYPE = {
  success: 'Operacion completada',
  error: 'Atencion',
  info: 'Informacion',
  warning: 'Aviso',
};

const TOAST_ICON_BY_TYPE = {
  success: 'OK',
  error: '!',
  info: 'i',
  warning: '!',
};

function FeedbackToast({
  show,
  type = 'error',
  title,
  message,
  onClose,
  delay = 3800,
  position = 'top-end',
}) {
  if (!show || !message) {
    return null;
  }

  const safeType = ALLOWED_TYPES.includes(type) ? type : 'error';
  const toastTitle = title || TOAST_TITLE_BY_TYPE[safeType];
  const toastIcon = TOAST_ICON_BY_TYPE[safeType];

  return (
    <ToastContainer position={position} className="app-toast-container p-3">
      <Toast
        autohide
        delay={delay}
        onClose={onClose}
        className={`app-toast is-${safeType}`}
      >
        <Toast.Header closeButton>
          <span className="app-toast-icon" aria-hidden="true">
            {toastIcon}
          </span>
          <strong className="me-auto">{toastTitle}</strong>
          <small>Ahora</small>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default FeedbackToast;
