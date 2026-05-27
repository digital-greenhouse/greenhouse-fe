import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import './UserInfo.css';

function safeParseUser(userValue) {
	if (!userValue) {
		return null;
	}

	try {
		return typeof userValue === 'string' ? JSON.parse(userValue) : userValue;
	} catch {
		return null;
	}
}

function formatDate(value) {
	if (!value) {
		return 'No disponible';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return 'No disponible';
	}

	return new Intl.DateTimeFormat('es-CO', {
		dateStyle: 'long',
		timeStyle: 'short',
	}).format(date);
}

function normalizeRole(role) {
	if (Array.isArray(role)) {
		return role
			.map((item) => (typeof item === 'string' ? item : item?.name))
			.filter(Boolean)
			.join(', ');
	}

	if (typeof role === 'string') {
		return role;
	}

	return 'No disponible';
}

function UserInfo({
	show,
	onHide,
	user,
	title = 'Mi información',
}) {
	const storedUser = useMemo(() => {
		if (user) {
			return safeParseUser(user);
		}

		return safeParseUser(localStorage.getItem('user'));
	}, [user, show]);

	const statusValue =
		storedUser?.is_active === true
			? 'Activo'
			: storedUser?.is_active === false
				? 'Inactivo'
				: 'No disponible';

	const summaryItems = [
		{ label: 'Nombre', value: storedUser?.name || 'No disponible' },
		{ label: 'Correo', value: storedUser?.email || 'No disponible' },
		{ label: 'Teléfono', value: storedUser?.phone || 'No disponible' },
		{ label: 'Rol', value: normalizeRole(storedUser?.role ?? storedUser?.roles) },
		{ label: 'Estado', value: statusValue },
		{ label: 'Creado el', value: formatDate(storedUser?.created_at) },
	].filter(Boolean);

	return (
		<Modal show={show} onHide={onHide} centered className="user-info-modal">
			<Modal.Header closeButton>
				<div>
					<p className="user-info-modal__kicker">Perfil</p>
					<Modal.Title>{title}</Modal.Title>
				</div>
			</Modal.Header>

			<Modal.Body>
				{storedUser ? (
					<div className="user-info-modal__grid">
						{summaryItems.map((item) => (
							<div key={item.label} className="user-info-modal__item">
								<span className="user-info-modal__label">{item.label}</span>
								<strong className="user-info-modal__value">{item.value}</strong>
							</div>
						))}
					</div>
				) : (
					<div className="user-info-modal__empty">
						No hay información de usuario disponible en esta sesión.
					</div>
				)}
			</Modal.Body>

			<Modal.Footer>
				<Button variant="light" onClick={onHide}>
					Cerrar
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

UserInfo.propTypes = {
	show: PropTypes.bool,
	onHide: PropTypes.func,
	user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	title: PropTypes.string,
};

export default UserInfo;
