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
import { getUsers } from '../../../../api/users';
import './Users.css';
import '../HistoryBookings/HistoryFilters.css';

const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
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

function resolveUserStatusKey(user) {
    return user?.is_active ? 'active' : 'inactive';
}

function Users() {
    const [users, setUsers] = useState([]);
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
        const fetchUsers = async () => {
            setIsLoading(true);

            try {
                const response = await getUsers();
                setUsers(Array.isArray(response?.data) ? response.data : []);
                setFeedback('');
            } catch (error) {
                console.error('Error al cargar los usuarios:', error);
                setUsers([]);
                setFeedback('No se pudo cargar el listado de usuarios.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const selectedState = users.filter((record) => {
            const status = resolveUserStatusKey(record) || '';
            return !selectedStatus || status === selectedStatus;
        });

        const selectedDateRecords = selectedState.filter((record) => {
            if (!selectedDate) return true;

            const createdDate = normalizeToDateValue(record?.created_at);

            return (
                (selectedDateMode === 'day' && createdDate === selectedDate) ||
                (selectedDateMode === 'month' && createdDate.slice(0, 7) === selectedDate.slice(0, 7)) ||
                (selectedDateMode === 'year' && createdDate.slice(0, 4) === selectedDate)
            );
        });

        if (!normalizedQuery) {
            return selectedDateRecords;
        }

        return selectedDateRecords.filter((user) => {
            const searchableFields = [
                String(user?.id ?? ''),
                user?.name || '',
                user?.email || '',
                user?.phone || '',
                user?.role || '',
                resolveUserStatusKey(user),
            ];

            return searchableFields.some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [users, searchQuery, selectedStatus, selectedDateMode, selectedDate]);

    const columns = useMemo(() => ([
        {
            name: 'ID',
            selector: (row) => row?.id,
            sortable: true,
            grow: 0.4,
        },
        {
            name: 'Nombre',
            selector: (row) => row?.name || 'No disponible',
            sortable: true,
            grow: 0.9,
        },
        {
            name: 'Correo',
            selector: (row) => row?.email || 'No disponible',
            sortable: true,
            grow: 1.1,
        },
        {
            name: 'Teléfono',
            selector: (row) => row?.phone || 'No disponible',
            sortable: true,
            grow: 0.8,
        },
        {
            name: 'Rol',
            selector: (row) => row?.role || 'No disponible',
            sortable: true,
            grow: 0.8,
        },
        {
            name: 'Estado',
            selector: (row) => (row?.is_active ? 'Activo' : 'Inactivo'),
            sortable: true,
            grow: 0.7,
        },
        {
            name: 'Creado',
            selector: (row) => formatDate(row?.created_at),
            sortable: true,
            grow: 0.9,
        },
    ]), []);

    return (
        <section className="history-users">
            <header className="history-users__header">
                <p className="history-users__kicker">Historial</p>
                <h2 className="history-users__title">Usuarios registrados</h2>
            </header>

            <div className="filters-desktop reservation-filters-root">
                <div className="search-box">
                    <FontAwesomeIcon className="icon-search" icon={faMagnifyingGlass} />
                    <input
                        type="search"
                        placeholder="Buscar usuario por ID, nombre, correo, teléfono o rol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="button" aria-label="Vaciar búsqueda" className="search-clear-btn" onClick={() => setSearchQuery('')}>
                    </button>
                </div>

                <div className="filter-status">
                    <span>Estado</span>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <FontAwesomeIcon className="icon-chevron-down" icon={faChevronDown} />
                </div>

                <div className="filter-date">
                    <span>Filtrar por</span>
                    <select value={selectedDateMode} onChange={(e) => {
                        setSelectedDateMode(e.target.value);
                        setSelectedDate('');
                    }}>
                        <option value="day">Día</option>
                        <option value="month">Mes</option>
                        <option value="year">Año</option>
                    </select>
                    <FontAwesomeIcon className="icon-chevron-down" icon={faChevronDown} />
                </div>

                <div className="filter-date">
                    <span>{selectedDateLabel}</span>
                    {selectedDateMode === 'day' && (
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    )}
                    {selectedDateMode === 'month' && (
                        <input type="month" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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
                        placeholder="Buscar usuario..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="button" aria-label="Vaciar búsqueda" className="search-clear-btn" onClick={() => setSearchQuery('')}>
                        <FontAwesomeIcon className="icon-Xmark" icon={faXmark} />
                    </button>
                </div>

                <button className="mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
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
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
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
                                <select value={selectedDateMode} onChange={(e) => {
                                    setSelectedDateMode(e.target.value);
                                    setSelectedDate('');
                                }}>
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
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                            )}
                            {selectedDateMode === 'month' && (
                                <input type="month" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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
                data={filteredUsers}
                customStyles={customStyles}
                striped
                highlightOnHover
                progressPending={isLoading}
                progressComponent={(
                    <div className="history-users__loading">
                        <Spinner animation="border" size="lg" />
                    </div>
                )}
                noDataComponent={(
                    <div className="history-users__empty">
                        {feedback || 'No hay usuarios para mostrar.'}
                    </div>
                )}
            />
        </section>
    );
}

export default Users;