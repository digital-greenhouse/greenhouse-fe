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
                style={{
                    width: '100%',
                    maxWidth: 760,
                    marginTop: 16,
                    marginBottom: 14,
                }}
                aria-label="Resumen de reservas"
            >
                <p
                    style={{
                        margin: 0,
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        color: '#0f766e',
                        textTransform: 'uppercase',
                    }}
                >
                    Gestion de reservas
                </p>
                <h1
                    style={{
                        margin: 0,
                        fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
                        lineHeight: 1.2,
                        color: '#102a43',
                        fontWeight: 800,
                    }}
                >
                    Controla tus reservas en un solo panel
                </h1>
                <p
                    style={{
                        margin: 0,
                        marginTop: 8,
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: '#486581',
                        maxWidth: 680,
                    }}
                >
                    {/* {selectedDescription} */}
                </p>
            </section>

            <div
                className={className}
                style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #d9e2ec',
                    borderRadius: 12,
                    padding: 6,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    boxSizing: 'border-box',
                    ...style,
                }}
                role="tablist"
                aria-label="Filtro de reservas"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME}
                    onClick={() => handleSelect(BOOKING_MENU_OPTIONS.MADE_BY_ME)}
                    style={{
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        background:
                            selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? '#2f7755' : 'transparent',
                        color: selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? '#ffffff' : '#334155',
                    }}
                >
                    {mergedLabels[BOOKING_MENU_OPTIONS.MADE_BY_ME]}
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY}
                    onClick={() => handleSelect(BOOKING_MENU_OPTIONS.ON_MY_PROPERTY)}
                    style={{
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        background:
                            selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY ? '#2f7755' : 'transparent',
                        color: selectedOption === BOOKING_MENU_OPTIONS.ON_MY_PROPERTY ? '#ffffff' : '#334155',
                    }}
                >
                    {mergedLabels[BOOKING_MENU_OPTIONS.ON_MY_PROPERTY]}
                </button>
            </div>

            <section className="booking-results-section">
                {selectedOption === BOOKING_MENU_OPTIONS.MADE_BY_ME ? (
                    <MyBooking />
                ) : (
                    <div
                        style={{
                            border: '1px dashed #cbd5e1',
                            borderRadius: 12,
                            background: '#f8fafc',
                            color: '#475569',
                            padding: '16px 18px',
                            fontSize: 14,
                        }}
                    >
                        Aqui veras las reservas recibidas en tus propiedades.
                    </div>
                )}
            </section>
        </main>
    );
}

export { BOOKING_MENU_OPTIONS };
export default BokingMenu;
