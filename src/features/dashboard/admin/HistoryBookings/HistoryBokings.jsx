import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Spinner } from 'react-bootstrap';
import { getBookings } from '../../../../api/bookings';
import './HistoryBokings.css';

const statusLabels = {
	PENDING_PAYMENT: 'Pendiente de pago',
	CONFIRMED: 'Confirmada',
	CANCELLED: 'Cancelada',
	COMPLETED: 'Completada',
	PENDING_VERIFICATION: 'Pendiente de verificación',
	VERIFIED: 'Verificada',
};

const customStyles = {
	table: {
		style: {
			backgroundColor: '#fbfaf7',
			border: '1px solid #e3dbc9',
			borderRadius: '16px',
			overflow: 'hidden',
			boxShadow: '0 8px 18px rgba(45, 34, 14, 0.07)',
		},
	},
	headRow: {
		style: {
			background: 'linear-gradient(180deg, #2f773d 0%)',
			borderBottom: '1px solid #d8d0c3',
		},
	},
	headCells: {
		style: {
			color: '#ffffff',
			fontWeight: 700,
			fontSize: '13px',
			textTransform: 'uppercase',
			letterSpacing: '0.08em',
			paddingLeft: '12px',
			paddingRight: '12px',
		},
	},
	rows: {
		style: {
			minHeight: '64px',
			backgroundColor: '#ffffff',
			color: '#373329',
			borderBottom: '1px solid #eee8dc',
		},
		stripedStyle: {
			backgroundColor: '#f9f5ee',
		},
		highlightOnHoverStyle: {
			backgroundColor: '#efe6d6',
			transitionDuration: '0.12s',
			transitionProperty: 'background-color',
			borderBottomColor: '#d8d0c3',
		},
	},
	cells: {
		style: {
			paddingLeft: '12px',
			paddingRight: '12px',
			fontSize: '14px',
		},
	},
	pagination: {
		style: {
			backgroundColor: '#fbfaf7',
			color: '#da9920',
			borderTop: '1px solid #e3dbc9',
			minHeight: '56px',
		},
		pageButtonsStyle: {
			borderRadius: '8px',
			height: '30px',
			width: '30px',
			padding: '6px',
			margin: '0 2px',
			color: '#3f382c',
			fill: '#3f382c',
			backgroundColor: 'transparent',
			'&:disabled': {
				color: '#bdb5a7',
				fill: '#bdb5a7',
			},
			'&:hover:not(:disabled)': {
				backgroundColor: '#e8decc',
			},
			'&:focus': {
				outline: 'none',
				backgroundColor: '#d8e4d7',
			},
		},
	},
};

function formatDate(value) {
	if (!value) {
		return 'No disponible';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return 'No disponible';
	}

	return new Intl.DateTimeFormat('es-CO', {
		dateStyle: 'medium',
	}).format(date);
}

function resolveStatus(row) {
	return statusLabels[row?.payment_status || row?.status] || row?.payment_status || row?.status || 'No disponible';
}

function HistoryBokings() {
	const [bookings, setBookings] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [feedback, setFeedback] = useState('');

	useEffect(() => {
		const fetchHistory = async () => {
			setIsLoading(true);

			try {
				const response = await getBookings();
				setBookings(Array.isArray(response?.data) ? response.data : []);
				setFeedback('');
			} catch (error) {
				console.error('Error al cargar el historial de reservas:', error);
				setBookings([]);
				setFeedback('No se pudo cargar el historial de reservas.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchHistory();
	}, []);

	const columns = useMemo(() => ([
		{
			name: 'ID',
			selector: (row) => row?.id,
			sortable: true,
			grow: 0.4,
		},
		{
			name: 'Propiedad',
			selector: (row) => row?.property_id,
			sortable: true,
			grow: 0.5,
		},
		{
			name: 'Cliente',
			selector: (row) => row?.client_id,
			sortable: true,
			grow: 0.5,
		},
		{
			name: 'Ingreso',
			selector: (row) => formatDate(row?.check_in_date),
			sortable: true,
			grow: 0.8,
		},
		{
			name: 'Salida',
			selector: (row) => formatDate(row?.check_out_date),
			sortable: true,
			grow: 0.8,
		},
		{
			name: 'Huéspedes',
			selector: (row) => row?.guest_count ?? 'No disponible',
			sortable: true,
			grow: 0.5,
		},
		{
			name: 'Noches',
			selector: (row) => row?.nights_count ?? 'No disponible',
			sortable: true,
			grow: 0.5,
		},
		{
			name: 'Total',
			selector: (row) => `$${Number(row?.total_price || 0).toLocaleString('es-CO')}`,
			sortable: true,
			grow: 0.7,
		},
		{
			name: 'Estado',
			selector: (row) => resolveStatus(row),
			sortable: true,
			grow: 0.8,
		},
		{
			name: 'Solicitud',
			selector: (row) => row?.special_requests || 'Sin solicitudes',
			sortable: true,
			grow: 1.6,
		},
	]), []);

	return (
		<section className="history-bookings">
			<header className="history-bookings__header">
				<p className="history-bookings__kicker">Historial</p>
				<h2 className="history-bookings__title">Reservas registradas</h2>
			</header>

			<DataTable
				columns={columns}
				data={bookings}
				customStyles={customStyles}
				striped
				highlightOnHover
				progressPending={isLoading}
				progressComponent={(
					<div className="history-bookings__loading">
						<Spinner animation="border" size="lg" />
					</div>
				)}
				noDataComponent={(
					<div className="history-bookings__empty">
						{feedback || 'No hay reservas para mostrar.'}
					</div>
				)}
			/>
		</section>
	);
}

export default HistoryBokings;

