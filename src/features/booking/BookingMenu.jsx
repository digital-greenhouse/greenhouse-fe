import { useMemo, useState } from 'react';
import "./BookingMenu.css";
import MyBooking from './MyBooking';
const BOOKING_MENU_OPTIONS = {
    MADE_BY_ME: 'madeByMe',
    ON_MY_PROPERTY: 'onMyProperty',
};

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

    const selectedDescription =
        selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME
            ? 'Consulta el estado de tus solicitudes, revisa fechas confirmadas y mantente al dia con cada reserva que realizaste.'
            : 'Administra las solicitudes enviadas a tu propiedad, valida disponibilidad y responde a cada evento en un solo lugar.';

    const handleSelect = (option) => {
        if (!isControlled) {
            setInternalValue(option);
        }

        if (typeof onChange === 'function') {
            onChange(option);
        }
    };

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
                <p className="booking-summary-copy">
                    {/* {selectedDescription} */}
                </p>
            </section>

            <div
                className={`booking-tabs ${className}`.trim()}
                style={style}
                role="tablist"
                aria-label="Filtro de reservas"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME}
                    onClick={() => handleSelect(BOOKING_MENU_OPTIONS.MADE_BY_ME)}
                    className={`booking-tab ${
                        selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? 'is-active' : ''
                    }`}
                >
                    {mergedLabels[BOOKING_MENU_OPTIONS.MADE_BY_ME]}
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY}
                    onClick={() => handleSelect(BOOKING_MENU_OPTIONS.ON_MY_PROPERTY)}
                    className={`booking-tab ${
                        selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY ? 'is-active' : ''
                    }`}
                >
                    {mergedLabels[BOOKING_MENU_OPTIONS.ON_MY_PROPERTY]}
                </button>
            </div>

            <section className="booking-results-section">
                {selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? (
                    <MyBooking />
                ) : (
                    <div className="booking-placeholder">
                        Aqui veras las reservas recibidas en tus propiedades.
                    </div>
                )}
            </section>
        </main>
    );
}

export { BOOKING_MENU_OPTIONS };
export default BokingMenu;
