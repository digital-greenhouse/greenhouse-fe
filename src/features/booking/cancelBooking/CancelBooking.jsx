import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import './CancelBooking.css';

function CancelBooking({
	show,
	title = 'Cancelar reserva',
	message = 'Indica el motivo de la cancelación para continuar.',
	acceptText = 'Aceptar',
	cancelText = 'Cancelar',
	onAccept,
	onCancel,
	loading = false,
}) {
	const [reason, setReason] = useState('');
	const [touched, setTouched] = useState(false);

	useEffect(() => {
		if (!show) {
			setReason('');
			setTouched(false);
		}
	}, [show]);

	const isInvalid = touched && reason.trim() === '';

	const handleAccept = () => {
		setTouched(true);

		if (reason.trim() === '') {
			return;
		}

		onAccept?.(reason.trim());
	};

	return (
		<Modal
			show={show}
			onHide={onCancel}
			centered
			backdrop="static"
			className="cancel-booking-modal"
		>
			<Modal.Header closeButton>
				<div>
					<p className="cancel-booking-modal__kicker">Acción requerida</p>
					<Modal.Title>{title}</Modal.Title>
				</div>
			</Modal.Header>

			<Modal.Body>
				<p className="cancel-booking-modal__message">{message}</p>

				<Form.Group controlId="cancelBookingReason" className="cancel-booking-modal__field">
					<Form.Label>Motivo de la cancelación</Form.Label>
					<Form.Control
						as="textarea"
						rows={4}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						onBlur={() => setTouched(true)}
						placeholder="Escribe aquí el motivo"
						aria-invalid={isInvalid}
						isInvalid={isInvalid}
					/>
					<Form.Control.Feedback type="invalid">
						El motivo de la cancelación es obligatorio.
					</Form.Control.Feedback>
				</Form.Group>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="light" className="cancel-booking-modal__secondary" onClick={onCancel} disabled={loading}>
					{cancelText}
				</Button>

				<Button
					className="cancel-booking-modal__primary"
					onClick={handleAccept}
					disabled={loading}
				>
					{acceptText}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default CancelBooking;
