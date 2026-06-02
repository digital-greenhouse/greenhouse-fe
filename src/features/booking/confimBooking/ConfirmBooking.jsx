import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { confirmPayment } from '../../../api/payment';
import './ConfirmBooking.css';

function ConfirmBooking({
	show,
	booking,
	title = 'Confirmar reserva',
	message = 'Agrega un comentario para dejar constancia de la confirmación.',
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	onConfirm,
	onCancel,
	onFeedback,
	loading = false,
}) {
	const [comments, setComments] = useState('');
	const [touched, setTouched] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!show) {
			setComments('');
			setTouched(false);
			setIsSubmitting(false);
		}
	}, [show]);

	const isInvalid = touched && comments.trim() === '';

	const handleConfirm = async () => {
		setTouched(true);

		if (!booking?.payment_id) {
			const messageText = 'No se encontró el comprobante asociado para confirmar la reserva.';
			onFeedback?.({ type: 'error', message: messageText });
			return;
		}

		try {
			setIsSubmitting(true);
            console.log('Confirmando reserva con ID de pago:', booking.payment_id);

			await confirmPayment(booking.payment_id, {
                status:'VERIFIED',
				rejection_reason: comments.trim()
			});

			onFeedback?.({ type: 'success', message: 'Reserva confirmada correctamente.' });
			await onConfirm?.(comments.trim(), booking);
			onCancel?.();
		} catch (error) {
			console.error('Error al confirmar la reserva:', error);
			const messageText = error?.response?.data?.message || error?.response?.data?.error || 'No fue posible confirmar la reserva.';
			onFeedback?.({ type: 'error', message: messageText });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			show={show}
			onHide={onCancel}
			centered
			backdrop="static"
			keyboard={false}
			className="confirm-booking-modal"
		>
			<Modal.Header closeButton>
				<div>
					<p className="confirm-booking-modal__kicker">Acción requerida</p>
					<Modal.Title>{title}</Modal.Title>
				</div>
			</Modal.Header>

			<Modal.Body>
				<p className="confirm-booking-modal__message">{message}</p>

				<section className="confirm-booking-modal__summary">
					<h3>Reserva</h3>
					<p><strong>ID:</strong> {booking?.id || 'No disponible'}</p>
					{/* <p><strong>Estado:</strong> {booking?.payment_status || booking?.status || 'No disponible'}</p> */}
				</section>

				<Form.Group controlId="confirmBookingComments" className="confirm-booking-modal__field">
					<Form.Label>Comentarios (opcional)</Form.Label>
					<Form.Control
						as="textarea"
						rows={4}
						value={comments}
						onChange={(event) => setComments(event.target.value)}
						onBlur={() => setTouched(true)}
							placeholder="Puedes dejar un comentario si lo deseas"
						aria-invalid={isInvalid}
							isInvalid={comments.trim() !== '' && isInvalid}
					/>
					<Form.Control.Feedback type="invalid">
							El comentario no puede estar vacío si decides escribir uno.
					</Form.Control.Feedback>
				</Form.Group>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="light" className="confirm-booking-modal__secondary" onClick={onCancel} disabled={loading || isSubmitting}>
					{cancelText}
				</Button>

				<Button
					className="confirm-booking-modal__primary"
					onClick={handleConfirm}
					disabled={loading || isSubmitting}
				>
					{isSubmitting ? 'Confirmando...' : confirmText}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

ConfirmBooking.propTypes = {
	show: PropTypes.bool,
	booking: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		payment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		payment_status: PropTypes.string,
		status: PropTypes.string,
	}),
	title: PropTypes.string,
	message: PropTypes.string,
	confirmText: PropTypes.string,
	cancelText: PropTypes.string,
	onConfirm: PropTypes.func,
	onCancel: PropTypes.func,
	onFeedback: PropTypes.func,
	loading: PropTypes.bool,
};

export default ConfirmBooking;