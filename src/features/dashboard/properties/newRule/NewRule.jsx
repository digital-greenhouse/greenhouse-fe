import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createPricingRule } from '../../../../api/properties';
import './NewRule.css';

function formatCurrency(value) {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue)) {
		return '$0';
	}

	return new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0,
	}).format(numericValue);
}

function NewRule({ show, property, onHide }) {
	const [formData, setFormData] = useState({
		name: '',
		start_date: '',
		end_date: '',
		price_modifier: '1.00',
		description: '',
	});
	const [feedback, setFeedback] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!show) {
			return;
		}

		setFormData({
			name: '',
			start_date: '',
			end_date: '',
			price_modifier: '1.00',
			description: '',
		});
		setFeedback('');
	}, [show, property?.id]);

	const dispatchFeedback = (type, message) => {
		globalThis.dispatchEvent(new CustomEvent('property-feedback', {
			detail: { type, message },
		}));
	};

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormData((previousValue) => ({
			...previousValue,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!property?.id) {
			setFeedback('No se pudo identificar la propiedad seleccionada.');
			dispatchFeedback('error', 'No se pudo identificar la propiedad seleccionada.');
			return;
		}

		if (!formData.name.trim() || !formData.start_date || !formData.end_date || !formData.price_modifier) {
			setFeedback('Completa todos los campos obligatorios.');
			return;
		}

		const parsedModifier = Number(formData.price_modifier);

		if (!Number.isFinite(parsedModifier) || parsedModifier <= 0) {
			setFeedback('El modificador de precio debe ser mayor que 0.');
			return;
		}

		if (new Date(formData.start_date) > new Date(formData.end_date)) {
			setFeedback('La fecha de inicio no puede ser mayor que la fecha de fin.');
			return;
		}

		try {
			setIsSubmitting(true);
			setFeedback('');

			await createPricingRule(property.id, {
				name: formData.name.trim(),
				start_date: formData.start_date,
				end_date: formData.end_date,
				price_modifier: parsedModifier,
				description: formData.description.trim(),
			});

			dispatchFeedback('success', 'Regla de precio creada correctamente.');
			globalThis.dispatchEvent(new Event('properties-updated'));
			onHide();
		} catch (error) {
			console.error('Error al crear la regla de precio:', error);

			const responseMessage = error?.response?.data?.message || error?.response?.data?.error;
			const message = responseMessage || 'No fue posible crear la regla de precio.';

			setFeedback(message);
			dispatchFeedback('error', message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
			scrollable
			backdrop="static"
			keyboard={false}
			className="new-rule-modal"
		>
			<Modal.Header closeButton>
				<div>
					<Modal.Title>Crear regla de precio</Modal.Title>
					<p className="new-rule-modal__subtitle">
						Define una temporada especial para {property?.name || 'la propiedad seleccionada'}.
					</p>
				</div>
			</Modal.Header>

			<Modal.Body>
				<section className="new-rule-summary">
					<h3>Información de la propiedad</h3>
					<p><strong>Nombre:</strong> {property?.name || 'Sin nombre'}</p>
					<p><strong>Dirección:</strong> {property?.address || 'No disponible'}</p>
					<p><strong>Precio base:</strong> {formatCurrency(property?.basePricePerNight ?? property?.base_price_per_night)}</p>
				</section>

				<form className="new-rule-form" onSubmit={handleSubmit}>
					<label>
						Nombre de la regla
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Temporada de Cometas"
							maxLength={120}
							required
						/>
					</label>

					<div className="new-rule-form__grid">
						<label>
							Inicio
							<input
								type="date"
								name="start_date"
								value={formData.start_date}
								onChange={handleChange}
								required
							/>
						</label>

						<label>
							Fin
							<input
								type="date"
								name="end_date"
								value={formData.end_date}
								onChange={handleChange}
								required
							/>
						</label>
					</div>

					<label>
						Modificador de precio
						<input
							type="number"
							name="price_modifier"
							value={formData.price_modifier}
							onChange={handleChange}
							min="0.01"
							step="0.01"
							placeholder="1.15"
							required
						/>
					</label>

					<label>
						Descripción
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Aumento por festival de cometas"
							rows={4}
							maxLength={180}
						/>
					</label>

					{feedback && <p className="new-rule-form__feedback" role="alert">{feedback}</p>}

					<div className="new-rule-form__actions">
						<Button
							type="button"
							onClick={onHide}
							disabled={isSubmitting}
							className="new-rule-form__button new-rule-form__button--secondary"
						>
							Cancelar
						</Button>
						<Button
							variant="primary"
							type="submit"
							disabled={isSubmitting}
							className="new-rule-form__button new-rule-form__button--primary"
						>
							{isSubmitting ? 'Creando...' : 'Crear regla'}
						</Button>
					</div>
				</form>
			</Modal.Body>
		</Modal>
	);
}

NewRule.propTypes = {
	show: PropTypes.bool,
	property: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		name: PropTypes.string,
		address: PropTypes.string,
		basePricePerNight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		base_price_per_night: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	}),
	onHide: PropTypes.func.isRequired,
};

export default NewRule;