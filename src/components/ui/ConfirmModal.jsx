import { Modal, Button } from 'react-bootstrap';
import './ConfirmModal.css';

function ConfirmModal({
  show,
  title = 'Confirmar accion',
  message = 'Estas seguro de continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}) {
  const isDanger = variant === 'danger';

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop="static"
      className="confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button className="confirm-cancel-btn" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          className={isDanger ? 'confirm-action-btn is-danger' : 'confirm-action-btn is-primary'}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
