import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChevronDown,
	faMagnifyingGlass,
	faSliders,
	faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { getBookings } from '../../../../api/bookings';
import { getUserById } from '../../../../api/users';
import './HistoryBokings.css';
import './HistoryFilters.css';

const statusLabels = {
	PENDING_PAYMENT: 'Pendiente de pago',
	CONFIRMED: 'Confirmada',
	CANCELLED: 'Cancelada',
	COMPLETED: 'Completada',
	PENDING_VERIFICATION: 'Pendiente de verificación',
};

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

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

function resolveBookingStateKey(row) {
	return !row?.payment_status || row?.status === 'CANCELLED' || row?.status === 'CONFIRMED'
		? row?.status
		: row?.payment_status;
}

function normalizeToDateValue(value) {
	if (!value) {
		return '';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return date.toISOString().slice(0, 10);
}

function HistoryBokings() {
	const [bookings, setBookings] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [feedback, setFeedback] = useState('');
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('');
	const [selectedDateMode, setSelectedDateMode] = useState('day');
	const [selectedDate, setSelectedDate] = useState('');
	const selectedDateLabel = selectedDateMode === 'day'
		? 'Fecha'
		: selectedDateMode === 'month'
			? 'Mes'
			: 'Año';

	const handleYearChange = (value) => {
		const digitsOnly = String(value ?? '').replace(/\D/g, '').slice(0, 4);
		setSelectedDate(digitsOnly);
	};

	const handleYearBlur = () => {
		if (!selectedDate) {
			return;
		}

		const year = Number(selectedDate);
		const normalizedYear = Math.min(YEAR_MAX, Math.max(YEAR_MIN, year));
		setSelectedDate(String(normalizedYear));
	};

	const handleClearFilters = () => {
		setSearchQuery('');
		setSelectedStatus('');
		setSelectedDate('');
		setSelectedDateMode('day');
		setShowMobileFilters(false);
	};

	useEffect(() => {
		const fetchHistory = async () => {
			setIsLoading(true);

			try {
				const response = await getBookings();
				const history = Array.isArray(response?.data) ? response.data : [];
				const userCache = new Map();

				const historyWithClientNames = await Promise.all(
					history.map(async (booking) => {
						const clientId = booking?.client_id;

						if (!clientId) {
							return {
								...booking,
								client_name: 'No disponible',
							};
						}

						if (!userCache.has(clientId)) {
							userCache.set(
								clientId,
								getUserById(clientId)
									.then((userResponse) => userResponse?.data?.name || userResponse?.data?.data?.name || 'No disponible')
									.catch(() => 'No disponible')
							);
						}

						const clientName = await userCache.get(clientId);

						return {
							...booking,
							client_name: clientName,
						};
					})
				);

				setBookings(historyWithClientNames);

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

	const filteredBookings = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const selectedState = bookings.filter((record) => {
			const status = resolveBookingStateKey(record) || '';

			return !selectedStatus || status === selectedStatus;
		});

		const selectedDateRecords = selectedState.filter((record) => {
			if (!selectedDate) return true;

			const checkinDate = new Date(record?.check_in_date);
			const checkoutDate = new Date(record?.check_out_date);
			const selected = new Date(selectedDate);
			selected.setDate(selected.getDate() + 1);

			return (
				(selectedDateMode === 'day' &&
					selected >= checkinDate &&
					selected <= checkoutDate) ||

				(selectedDateMode === 'month' &&
					checkinDate.getMonth() === selected.getMonth() 	&&
					checkinDate.getFullYear() === selected.getFullYear()) ||

				(selectedDateMode === 'year' &&
					checkinDate.getFullYear() === selected.getFullYear() )
			);
		});

		if (!normalizedQuery) {
			return selectedDateRecords;
		}

		return selectedDateRecords.filter((booking) => {
			const searchableFields = [
				String(booking?.id ?? ''),
				booking?.property_name || '',
				booking?.client_name || '',
				String(booking?.client_id ?? ''),
				booking?.special_requests || '',
				resolveStatus(booking),
			];

			return searchableFields.some((value) =>
				String(value).toLowerCase().includes(normalizedQuery)
			);
		});
	}, [bookings, searchQuery, selectedStatus, selectedDateMode, selectedDate]);

	const columns = useMemo(() => ([
		{
			name: 'ID',
			selector: (row) => row?.id,
			sortable: true,
			grow: 0.1,
		},
		{
			name: 'Propiedad',
			selector: (row) => row?.property_name||'No disponible',
			sortable: true,
			grow: 0.8,
		},
		{
			name: 'Cliente',
				selector: (row) => row?.client_name || row?.client_id || 'No disponible',
			sortable: true,
			grow: 0.8,
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
			selector: (row) => statusLabels[resolveBookingStateKey(row)] || resolveBookingStateKey(row) || 'No disponible',
			sortable: true,
			grow: 0.8,
		},
		{
			name: 'Solicitud',
			selector: (row) => row?.special_requests || 'Sin solicitudes',
			sortable: true,
			grow: 1,
		},
	]), []);

	return (
		<section className="history-bookings">
			<header className="history-bookings__header">
				<p className="history-bookings__kicker">Historial</p>
				<h2 className="history-bookings__title">Reservas registradas</h2>
			</header>

			<div className="filters-desktop reservation-filters-root">
				<div className="search-box">
					<FontAwesomeIcon className="icon-search" icon={faMagnifyingGlass} />
					<input
						type="search"
						placeholder="Buscar reserva por ID, nombre de propiedad, cliente, requerimiento o estado..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<button
						type="button"
						aria-label="Vaciar búsqueda"
						className="search-clear-btn"
						onClick={() => setSearchQuery('')}
					>
					</button>
				</div>

				<div className="filter-status">
					<span>Estado</span>
					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
					>
						<option value="">Todos los estados</option>
						{Object.entries(statusLabels).map(([key, label]) => (
							<option key={key} value={key}>{label}</option>
						))}
					</select>
					<FontAwesomeIcon className="icon-chevron-down" icon={faChevronDown} />
				</div>

				<div className="filter-date">
					<span>Filtrar por</span>
					<select
						value={selectedDateMode}
						onChange={(e) => {
							setSelectedDateMode(e.target.value);
							setSelectedDate('');
						}}
					>
						<option value="day">Día</option>
						<option value="month">Mes</option>
						<option value="year">Año</option>
					</select>
					<FontAwesomeIcon className="icon-chevron-down" icon={faChevronDown} />
				</div>

				<div className="filter-date">
					<span>{selectedDateLabel}</span>
					{selectedDateMode === 'day' && (
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
						/>
					)}
					{selectedDateMode === 'month' && (
						<input
							type="month"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
						/>
					)}
					{selectedDateMode === 'year' && (
						<input
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={4}
							placeholder="2026"
							value={selectedDate}
							onChange={(e) => handleYearChange(e.target.value)}
							onBlur={handleYearBlur}
						/>
					)}
				</div>

				<button className="clear-btn" onClick={handleClearFilters}>
					Limpiar
				</button>
			</div>

			<div className="mobile-actions reservation-filters-root">
				<div className="search-box mobile-search">
					<FontAwesomeIcon className="icon-search" icon={faMagnifyingGlass} />
					<input
						type="text"
						placeholder="Buscar reserva..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<button
						type="button"
						aria-label="Vaciar búsqueda"
						className="search-clear-btn"
						onClick={() => setSearchQuery('')}
					>
						<FontAwesomeIcon className="icon-Xmark" icon={faXmark} />
					</button>
				</div>

				<button
					className="mobile-filter-btn"
					onClick={() => setShowMobileFilters(true)}
				>
					<FontAwesomeIcon className="icon-sliders" icon={faSliders} />
					Filtros
				</button>
			</div>

			<div className={`mobile-filter-overlay ${showMobileFilters ? 'show' : ''}`}>
				<div className="mobile-filter-modal reservation-filters-root">
					<div className="modal-header">
						<h3>Filtros</h3>
						<button type="button" onClick={() => setShowMobileFilters(false)}>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className="modal-content">
						<div className="filter-status">
							<span>Estado</span>
							<div>
								<select
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value)}
								>
									<option value="">Todos los estados</option>
									{Object.entries(statusLabels).map(([key, label]) => (
										<option key={key} value={key}>{label}</option>
									))}
								</select>
								<FontAwesomeIcon className="icon-chevron-down" icon={faChevronDown} />
							</div>
						</div>

						<div className="filter-date">
							<span>Filtrar por</span>
							<div>
								<select
									value={selectedDateMode}
									onChange={(e) => {
										setSelectedDateMode(e.target.value);
										setSelectedDate('');
									}}
								>
									<option value="day">Día</option>
									<option value="month">Mes</option>
									<option value="year">Año</option>
								</select>
								<FontAwesomeIcon className="icon-chevron-down" icon={faChevronDown} />
							</div>
						</div>

						<div className="filter-date">
							<span>{selectedDateLabel}</span>
							{selectedDateMode === 'day' && (
								<input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
								/>
							)}
							{selectedDateMode === 'month' && (
								<input
									type="month"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
								/>
							)}
							{selectedDateMode === 'year' && (
								<input
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength={4}
									placeholder="2026"
									value={selectedDate}
									onChange={(e) => handleYearChange(e.target.value)}
									onBlur={handleYearBlur}
								/>
							)}
						</div>

						<button type="button" className="apply-btn" onClick={() => setShowMobileFilters(false)}>
							Aplicar filtros
						</button>
						<button type="button" className="clear-mobile-btn" onClick={handleClearFilters}>
							Limpiar filtros
						</button>
					</div>
				</div>
			</div>

			<DataTable
				columns={columns}
				data={filteredBookings}
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

