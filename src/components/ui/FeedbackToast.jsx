import { Toast, ToastContainer } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './FeedbackToast.css';

const ALLOWED_TYPES = new Set(['success', 'error', 'info', 'warning']);

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
  delay = 5800,
  position = 'top-end',
}) {
  if (!show || !message) {
    return null;
  }

  const safeType = ALLOWED_TYPES.has(type) ? type : 'error';
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

FeedbackToast.propTypes = {
  show: PropTypes.bool,
  type: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  delay: PropTypes.number,
  position: PropTypes.string,
};

export default FeedbackToast;
