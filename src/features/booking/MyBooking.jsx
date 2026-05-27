import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCircleXmark, faEye } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { getBookings } from '../../api/bookings';
import FeedbackToast from '../../components/ui/FeedbackToast';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { cancelBooking, getBookingByUser } from '../../api/bookings';
import { sendPayment } from '../../api/payment';
import './BookingMenu.css';
import ViewPaymentModal from './viewPayment/viewPayment';
import CancelBooking from './cancelBooking/CancelBooking';
import UploadPayment from './uploadPayment/UploadPayment';
import { convertToBase64 } from '../../components/utils/ConvertBase64File';


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


function MyBooking({ statusLabels,
    searchQuery,
    selectedStatus,
    selectedDate,
    selectedDateMode
}) {

    const [bookings, setBookings] = useState([]);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isCancellingBooking, setIsCancellingBooking] = useState(false);
    const [records, setRecords] = useState([]);
    const [showViewPaymentModal, setShowViewPaymentModal] = useState(false);
    const [showUploadPaymentModal, setShowUploadPaymentModal] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
    useEffect(() => {
        const fetchBookings = async () => {
            await dataBooking();
        };

        fetchBookings();
    }, []);

    const dataBooking = async () => {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        // await getBookings(user?.id).then((response) => {
        //     console.log('Bookings fetched:', response?.data.filter(item => item.client_id === user.id));
        //     setBookings(response?.data.filter(item => item.client_id === user.id));
        // }).catch((error) => {
        //     console.error('Error fetching bookings:', error);
        //     setFeedback({
        //         type: 'error',
        //         message: 'No se pudieron cargar las reservas. Intentalo de nuevo.',
        //     });
        // }).finally(() => {
        //     setIsLoading(false);
        // });
        await getBookingByUser(user?.id).then((response) => {
            setBookings(response?.data);
            setRecords(response?.data);
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

    const onClickCancelBooking = (booking) => () => {
        setSelectedBooking(booking);
        setShowCancelConfirm(true);
    }

    const columns = [
        {
            name: 'id',
            selector: (row) => row?.id,
            sortable: true,
            grow: 0.3
        },
        {
            name: 'Requerimiento adicional',
            selector: (row) => row.special_requests || 'Sin solicitudes especiales',
            sortable: true,
        },
        {
            name: 'Fecha Ingreso',
            selector: (row) => new Date(new Date(row.check_in_date).setDate(new Date(row.check_in_date).getDate() + 1)).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Fecha Salida',
            selector: (row) => new Date(new Date(row.check_out_date).setDate(new Date(row.check_out_date).getDate() + 1)).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Estado',
            selector: (row) => statusLabels[!row.payment_status || row.status === 'CANCELLED' || row.status === 'CONFIRMED' ? row?.status : row?.payment_status],
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
                    //     <div className="booking-actions-cell">
                    //         {showButton && row.status === 'PENDING_PAYMENT' && (
                    //             <button className="booking-action-btn booking-action-btn--primary" type="button">
                    //                 Cargar Comprobante
                    //             </button>
                    //         )}

                    //         {showButton && row.status !== 'CANCELLED' && (
                    //             <button className="booking-action-btn booking-action-btn--danger" type="button">
                    //                 Cancelar Reserva
                    //             </button>
                    //         )}
                    //     </div>
                    // );
                    <div className="booking-actions-cell">
                        {showButton && row.status === 'PENDING_PAYMENT' && !row.payment_id && (
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id={`tip-upload-${row.id}`}>
                                        Cargar comprobante
                                    </Tooltip>
                                }
                            >
                                <button
                                    className="booking-action-btn booking-action-btn--primary"
                                    type="button"
                                    aria-label="Cargar comprobante"
                                    onClick={() => handleUploadPaymentModal(row)}
                                >
                                    <FontAwesomeIcon className='icon-upload' icon={faUpload} />
                                </button>
                            </OverlayTrigger>
                        )}

                        {row.payment_id && (
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id={`tip-upload-${row.id}`}>
                                        Ver comprobante
                                    </Tooltip>
                                }
                            >
                                <button
                                    className="booking-action-btn booking-action-btn--primary"
                                    type="button"
                                    aria-label="Cargar comprobante"
                                    onClick={() => handleViewPaymentModal(row)}
                                >
                                    <FontAwesomeIcon className='icon-eye' icon={faEye} />
                                </button>
                            </OverlayTrigger>
                        )}
                        {showButton && row.status !== 'CANCELLED' && (
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id={`tip-cancel-${row.id}`}>
                                        Cancelar reserva
                                    </Tooltip>
                                }
                            >
                                <button
                                    className="booking-action-btn booking-action-btn--danger"
                                    type="button"
                                    aria-label="Cancelar reserva"
                                    onClick={onClickCancelBooking(row)}
                                >
                                    <FontAwesomeIcon className='icon-circle-xmark' icon={faCircleXmark} />
                                </button>
                            </OverlayTrigger>
                        )}
                    </div>
                );
            },
            grow: 1
        }
    ];


    const handleConfirmCancel = async (reason) => {
        if (!selectedBooking) {
            setShowCancelConfirm(false);
            return;
        }

        if (!reason || reason.trim() === '') {
            setFeedback({ type: 'error', message: 'Ingrese el motivo de la cancelación.' });
            return;
        }

        try {
            setIsCancellingBooking(true);
            await cancelBooking(selectedBooking.id, { reason });
            setBookings(prev => prev.map(b => (b.id === selectedBooking.id ? { ...b, status: 'CANCELLED' } : b)));
            setFeedback({ type: 'success', message: 'Reserva cancelada.' });
            setShowCancelConfirm(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            setFeedback({ type: 'error', message: 'No fue posible cancelar la reserva. Intenta nuevamente.' });
        } finally {
            setIsCancellingBooking(false);
        }
    };

    const handleViewPaymentModal = (booking) => {
        setSelectedPaymentBooking(booking);
        setShowViewPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowViewPaymentModal(false);
        setSelectedPaymentBooking(null);
    };

    const handleUploadPaymentModal = (booking) => {
        setSelectedPaymentBooking(booking);
        setShowUploadPaymentModal(true);
    };

    const handleCloseUploadPaymentModal = () => {
        setShowUploadPaymentModal(false);
        setSelectedPaymentBooking(null);
    };

    const saveFile = async (bookingId, file, amountToPay) => {
        try {
            if (file) {
                const base64 = await convertToBase64(file);

                return {
                    booking_id: bookingId || 0,
                    amount: amountToPay,
                    payment_method: "TRANSFERENCIA",
                    proof_data: base64?.base64,
                    proof_mime_type: base64?.mimeType,
                };
            }
            return {};
        } catch (error) {
            console.error('Error al convertir el archivo a base64:', error);
        }
    }

    const handleUploadPayment = async ({ file, amountToPay, booking }) => {
        if (!booking?.id) {
            setFeedback({ type: 'error', message: 'No se encontro la reserva para adjuntar el pago.' });
            return;
        }

        try {
            
            const payload = await saveFile(booking?.id, file, amountToPay);

            await sendPayment(payload);

            setFeedback({ type: 'success', message: 'Comprobante cargado correctamente.' });
            setShowUploadPaymentModal(false);
            setSelectedPaymentBooking(null);
            await dataBooking();
        } catch (error) {
            console.error('Error al cargar comprobante:', error);
            setFeedback({ type: 'error', message: 'No fue posible cargar el comprobante.' });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    useEffect(() => {
        const handleSearch = () => {
            try {
                const search = bookings.filter(record => {
                    return record.id.toString().includes(searchQuery.toLowerCase()) ||
                        record.special_requests.toLowerCase().includes(searchQuery.toLowerCase())
                });
                const selectedState = search.filter((record) => {
                    const status =
                        !record.payment_status ||
                            record.status === 'CANCELLED' ||
                            record.status === 'CONFIRMED'
                            ? record.status
                            : record.payment_status;

                    return status?.includes(selectedStatus);
                });

                setRecords(selectedState.filter((record) => {
                    if (!selectedDate) return true;
                    const checkinDate = new Date(record?.check_in_date);
                    const checkoutDate = new Date(record?.check_out_date);
                    const selected = new Date(selectedDate);

                    return (
                        (selectedDateMode === 'day' &&
                            selected >= checkinDate &&
                            selected <= checkoutDate) ||

                        (selectedDateMode === 'month' &&
                            checkinDate.getMonth() === selected.getMonth() + 1 &&
                            checkinDate.getFullYear() === selected.getFullYear()) ||

                        (selectedDateMode === 'year' &&
                            checkinDate.getFullYear() === selected.getFullYear() + 1)
                    );
                })
                );
            } catch (error) {
                console.error("Error al filtrar los datos:", error);
            }
        }
        handleSearch();
    }, [searchQuery, selectedStatus, selectedDate, selectedDateMode]);





    return (
        <div>
            <DataTable
                columns={columns}
                data={records}
                customStyles={customStyles}
                striped
                highlightOnHover
                progressPending={isLoading}
                progressComponent={(
                    <div className="loading-overlay-table">
                        <Spinner animation="border" size="lg" />
                    </div>
                )}
                noDataComponent={
                    <div style={{ padding: '20px 0' }}>
                        No hay reservas para mostrar.
                    </div>
                }
            />
            <FeedbackToast
                show={Boolean(feedback.message)}
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback({ type: '', message: '' })}
            />
            <ViewPaymentModal
                show={showViewPaymentModal}
                onHide={handleClosePaymentModal}
                payment={selectedPaymentBooking}
                onFeedback={setFeedback}
            />
            <CancelBooking
                show={showCancelConfirm}
                title="Cancelar reserva"
                message="¿Está seguro de cancelar la reserva? Indica el motivo para continuar."
                onAccept={handleConfirmCancel}
                onCancel={() => { setShowCancelConfirm(false); setSelectedBooking(null); }}
                loading={isCancellingBooking}
            />
            <UploadPayment
                show={showUploadPaymentModal}
                title="Cargar comprobante de pago"
                onHide={handleCloseUploadPaymentModal}
                payment={selectedPaymentBooking}
                onFeedback={setFeedback}
                onSubmit={handleUploadPayment}
                isSubmitting={isSubmittingPayment}
            />

        </div>
    );
}



export default MyBooking;