import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faHouse, faMagnifyingGlass, faXmark, faChevronDown, faSliders } from '@fortawesome/free-solid-svg-icons';

import "./BookingMenu.css";
import "./Filters.css";
import MyBooking from './MyBooking';
import MyPropertyBooking from './MyPropertyBooking';
const BOOKING_MENU_OPTIONS = {
    MADE_BY_ME: 'madeByMe',
    ON_MY_PROPERTY: 'onMyProperty',
};
const statusLabels = {
    PENDING_PAYMENT: "Pendiente de pago",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
    PENDING_VERIFICATION: "Pendiente de verificación"
};
const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

function BokingMenu({
    value,
    onChange,
    labels,
    className = '',
    style,
}) {
    const mergedLabels = useMemo(
        () => ({
            [BOOKING_MENU_OPTIONS.MADE_BY_ME]: 'Mis reservas',
            [BOOKING_MENU_OPTIONS.ON_MY_PROPERTY]: 'Reservas a mis propiedades',
            ...labels,
        }),
        [labels]
    );

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(BOOKING_MENU_OPTIONS.MADE_BY_ME);
    const selectedOption = isControlled ? value : internalValue;
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

    const handleSelect = (option) => {
        if (!isControlled) {
            setInternalValue(option);
        }

        if (typeof onChange === 'function') {
            onChange(option);
        }
    };


    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedStatus('');
        setSelectedDate('');
        setSelectedDateMode('day');
        setShowMobileFilters(false);
    }



    return (
        <main>
            <section
                className="booking-summary"
                aria-label="Resumen de reservas"
            >
                <p className="booking-summary-kicker">
                    Gestion de reservas
                </p>
                <h1 className="booking-summary-title">
                    Controla tus reservas en un solo panel
                </h1>
                <p className="booking-summary-copy" />
            </section>

            <div
                className={`booking-tabs ${className}`.trim()}
                role="tablist"
                aria-label="Filtro de reservas"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME}
                    onClick={() => handleSelect(BOOKING_MENU_OPTIONS.MADE_BY_ME)}
                    className={`booking-tab ${selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? 'is-active' : ''
                        }`}
                >
                    <FontAwesomeIcon className='icon-calendar-days' icon={faCalendarDays} />
                    {mergedLabels[BOOKING_MENU_OPTIONS.MADE_BY_ME]}
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY}
                    onClick={() => handleSelect(BOOKING_MENU_OPTIONS.ON_MY_PROPERTY)}
                    className={`booking-tab ${selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY ? 'is-active' : ''
                        }`}
                >
                    <FontAwesomeIcon className='icon-house' icon={faHouse} />
                    {mergedLabels[BOOKING_MENU_OPTIONS.ON_MY_PROPERTY]}
                </button>
            </div>

            {/* DESKTOP FILTERS */}
            <div className="filters-desktop">
                <div className="search-box">
                    <FontAwesomeIcon className='icon-search' icon={faMagnifyingGlass} />
                    <input
                        type="search"
                        placeholder="Buscar reserva por ID, requerimiento o estado..."
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
                    <FontAwesomeIcon className='icon-chevron-down' icon={faChevronDown} />
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
                    <FontAwesomeIcon className='icon-chevron-down' icon={faChevronDown} />
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

                <button className="clear-btn" onClick={handleClearFilters} >
                    Limpiar
                </button>
            </div>

            {/* MOBILE SEARCH + BUTTON */}
            <div className="mobile-actions">
                <div className="search-box mobile-search">
                    <FontAwesomeIcon className='icon-search' icon={faMagnifyingGlass} />
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
                        <FontAwesomeIcon className='icon-Xmark' icon={faXmark} />
                    </button>
                </div>

                <button
                    className="mobile-filter-btn"
                    onClick={() => setShowMobileFilters(true)}
                >
                    <FontAwesomeIcon className='icon-sliders' icon={faSliders} />
                    Filtros

                </button>
            </div>

            {/* MOBILE FILTER MODAL */}
            <div
                className={`mobile-filter-overlay ${showMobileFilters ? "show" : ""
                    }`}
            >
                <div className="mobile-filter-modal">
                    <div className="modal-header">
                        <h3>Filtros</h3>
                        <button onClick={() => setShowMobileFilters(false)}>
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
                                <FontAwesomeIcon className='icon-chevron-down' icon={faChevronDown} />
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
                                <FontAwesomeIcon className='icon-chevron-down' icon={faChevronDown} />
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

                        <button className="apply-btn" onClick={() => setShowMobileFilters(false)}>
                            Aplicar filtros
                        </button>

                        <button className="clear-mobile-btn" onClick={handleClearFilters} >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            <section className="booking-results-section">
                {selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? (
                    <MyBooking
                        statusLabels={statusLabels}
                        searchQuery={searchQuery}
                        selectedStatus={selectedStatus}
                        selectedDate={selectedDate}
                        selectedDateMode={selectedDateMode}
                    />
                ) : (
                    <MyPropertyBooking
                        statusLabels={statusLabels}
                        searchQuery={searchQuery}
                        selectedStatus={selectedStatus}
                        selectedDate={selectedDate}
                        selectedDateMode={selectedDateMode}
                    />
                )}
            </section>
        </main>
    );
}

export { BOOKING_MENU_OPTIONS };
export default BokingMenu;

BokingMenu.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    labels: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
};
