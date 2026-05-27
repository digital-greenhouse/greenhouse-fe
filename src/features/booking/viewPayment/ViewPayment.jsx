import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { getPayment } from '../../../api/payment';
import './ViewPayment.css';

function detectFileKind(fileUrl = '', mimeType = '') {
    const normalizedUrl = String(fileUrl).toLowerCase();
    const normalizedMime = String(mimeType).toLowerCase();

    if (normalizedMime.includes('pdf') || normalizedUrl.includes('.pdf')) {
        return 'pdf';
    }

    if (
        normalizedMime.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(normalizedUrl)
    ) {
        return 'image';
    }

    return 'unknown';
}

function ViewPaymentModal({
    show,
    onHide,
    payment,
    onFeedback,
    title = 'Comprobante de pago',
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [proofUrl, setProofUrl] = useState('');
    const [proofKind, setProofKind] = useState('unknown');

    useEffect(() => {
        let isMounted = true;
        let objectUrl = '';

        const clearPreview = () => {
            setLoading(false);
            setError('');
            setProofUrl('');
            setProofKind('unknown');
        };

        const loadProof = async () => {
            if (!show) {
                clearPreview();
                return;
            }

            if (!payment?.payment_id) {
                setLoading(false);
                const message = 'No hay un comprobante disponible para visualizar.';
                setError(message);
                setProofUrl('');
                setProofKind('unknown');
                onFeedback?.({ type: 'error', message });
                return;
            }

            setLoading(true);
            setError('');

            try {
                const response = await getPayment(payment.payment_id);
                const blob = response?.data;
                const mimeType = blob?.type || response?.headers?.['content-type'] || '';

                if (!blob) {
                    throw new Error('La respuesta no contiene un archivo.');
                }

                objectUrl = globalThis.URL.createObjectURL(blob);

                if (isMounted) {
                    setProofUrl(objectUrl);
                    setProofKind(detectFileKind(objectUrl, mimeType));
                }
            } catch {
                if (isMounted) {
                    const message = 'No fue posible cargar el comprobante.';
                    setError(message);
                    setProofUrl('');
                    setProofKind('unknown');
                    onFeedback?.({ type: 'error', message });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProof();

        return () => {
            isMounted = false;
            if (objectUrl) {
                globalThis.URL.revokeObjectURL(objectUrl);
            }
        };
    }, [payment?.payment_id, show]);

    const fileUrl = proofUrl;
    const fileName = payment?.file_name || payment?.filename || payment?.name || 'comprobante';

    const handleDownload = () => {
        if (!fileUrl) {
            return;
        }

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            backdrop="static"
            className="view-payment-modal"
        >
            <Modal.Header closeButton>
                <div>
                    <p className="view-payment-modal__kicker">Vista previa</p>
                    <Modal.Title>{title}</Modal.Title>
                </div>

                {fileName && (
                    <span className="view-payment-modal__file-name">{fileName}</span>
                )}
            </Modal.Header>

            <Modal.Body>
                {loading ? (
                    <div className="view-payment-modal__state">
                        <Spinner animation="border" role="status" />
                        <span>Cargando comprobante...</span>
                    </div>
                ) : fileUrl ? (
                    <div className="view-payment-modal__preview">
                        {proofKind === 'pdf' ? (
                            <iframe
                                title={fileName}
                                src={fileUrl}
                                className="view-payment-modal__frame"
                            />
                        ) : (
                            <img
                                src={fileUrl}
                                alt={fileName}
                                className="view-payment-modal__image"
                            />
                        )}
                    </div>
                ) : (
                    <div className="view-payment-modal__state">
                        <span>{error || 'No hay archivo para mostrar.'}</span>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="light" className="view-payment-modal__secondary" onClick={onHide}>
                    Cerrar
                </Button>

                <Button
                    className="view-payment-modal__primary"
                    onClick={handleDownload}
                    disabled={!fileUrl || loading}
                >
                    Descargar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

ViewPaymentModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    payment: PropTypes.shape({
        payment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        file_name: PropTypes.string,
        filename: PropTypes.string,
        name: PropTypes.string,
    }),
    onFeedback: PropTypes.func,
    title: PropTypes.string,
};

export default ViewPaymentModal;

