import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';
import { getBookings } from '../../api/bookings';
import FeedbackToast from '../../components/ui/FeedbackToast';
import { Spinner } from 'react-bootstrap';
import './BookingMenu.css';


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
            background: 'linear-gradient(180deg, #2f7755 0%, #e8decc 100%)',
            borderBottom: '1px solid #d8d0c3',
        },
    },
    headCells: {
        style: {
            color: '#2c3f35',
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

const statusLabels = {
    PENDING_PAYMENT: "Pendiente de pago",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada"
};

function MyBooking() {

    const [bookings, setBookings] = useState([]);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchBookings = async () => {
            await dataBooking();
        };

        fetchBookings();
    }, []);

    const dataBooking = async () => {
        setIsLoading(true);
        await getBookings().then((response) => {
            setBookings(response?.data);
        }).catch((error) => {
            console.error('Error fetching bookings:', error);
            setFeedback({
                type: 'error',
                message: 'No se pudieron cargar las reservas. Intentalo de nuevo.',
            });
        }).finally(() => {
            setIsLoading(false);
        });
    }
    const data = bookings || [];
    const columns = [
        {
            name: 'id',
            selector: (row) => row?.id,
            sortable: true,
            grow: 0.09
        },
        {
            name: 'Requerimiento adicional',
            selector: (row) => row.special_requests || 'Sin solicitudes especiales',
            sortable: true,
        },
        {
            name: 'Fecha Ingreso',
            selector: (row) => new Date(row.check_in_date).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Fecha Salida',
            selector: (row) => new Date(row.check_out_date).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Estado',
            selector: (row) => statusLabels[row.status],
            sortable: true,
        },
        {
            name: 'Precio Total',
            selector: (row) => `$${row.total_price}`,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => {
                const hoy = new Date();
                const checkIn = new Date(row.check_in_date);

                const showButton = hoy < checkIn;

                return (
                    <div className="booking-actions-cell">
                        {showButton && row.status === 'PENDING_PAYMENT' && (
                            <button className="booking-action-btn booking-action-btn--primary" type="button">
                                Cargar Comprobante
                            </button>
                        )}

                        {showButton && row.status !== 'CANCELLED' && (
                            <button className="booking-action-btn booking-action-btn--danger" type="button">
                                Cancelar Reserva
                            </button>
                        )}
                    </div>
                );
            },
        }
    ];

    console.log('bookings', bookings);

    return (
        <div>
            <DataTable
                columns={columns}
                data={data}
                customStyles={customStyles}
                striped
                highlightOnHover
                progressPending={isLoading}
                progressComponent={(
                    <div className="loading-overlay-table">
                        <Spinner animation="border" size="lg" />
                    </div>
                )}
               
            />
            <FeedbackToast
                show={Boolean(feedback.message)}
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback({ type: '', message: '' })}
            />
        </div>
    );
}



export default MyBooking;