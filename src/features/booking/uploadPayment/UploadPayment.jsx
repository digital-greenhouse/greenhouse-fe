import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import GenericFileDropzone from '../../../components/ui/loadFile/GenericFileDropzone';
import './UploadPayment.css';


const CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
});

function parseCurrencyInput(value = '') {
    const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount < 0) {
        return 0;
    }

    return amount;
}

function UploadPaymentModal({
    show,
    onHide,
    onSubmit,
    onFeedback,
    payment,
    isSubmitting = false,
    title = 'Cargar comprobante',
}) {
    const [file, setFile] = useState(null);
    const [amountInput, setAmountInput] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef(null);

    // derive total/min/max from payment prop
    const totalPrice = useMemo(() => {
        const v = payment?.total_price;
        if (v === undefined || v === null) return 0;
        return Number(v) || 0;
    }, [payment?.total_price]);

    const minPay = useMemo(() => totalPrice * 0.5, [totalPrice]);
    const maxPay = useMemo(() => totalPrice, [totalPrice]);

    const amount = useMemo(() => parseCurrencyInput(amountInput), [amountInput]);
    const [amountError, setAmountError] = useState('');

    useEffect(() => {
        // when modal opens with a payment, prefill amount with 50% of total
        if (show && totalPrice > 0) {
            const defaultValue = String(minPay);
            if (defaultValue !== amountInput) {
                setAmountInput(defaultValue);
            }
        }
    }, [show, totalPrice, minPay]);

    useEffect(() => {
        if (!show) {
            setFile(null);
            setAmountInput('');
            setIsDragActive(false);
        }
    }, [show]);

    const acceptedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

    const isValidFile = (selectedFile) => acceptedMimeTypes.has(selectedFile?.type || '');

    const setSelectedFile = (selectedFile) => {
        if (!selectedFile) {
            return;
        }

        if (!isValidFile(selectedFile)) {
            onFeedback?.({
                type: 'error',
                message: 'Formato no permitido. Usa PDF, JPG, PNG o WEBP.',
            });
            return;
        }

        setFile(selectedFile);
    };

    const getRootProps = (extraProps = {}) => ({
        onClick: (event) => {
            extraProps.onClick?.(event);
            if (!isSubmitting) {
                inputRef.current?.click();
            }
        },
        onDrop: (event) => {
            extraProps.onDrop?.(event);
            event.preventDefault();
            setIsDragActive(false);
            if (isSubmitting) {
                return;
            }
            const droppedFile = event.dataTransfer?.files?.[0];
            setSelectedFile(droppedFile);
        },
        onDragOver: (event) => {
            extraProps.onDragOver?.(event);
            event.preventDefault();
        },
        onDragEnter: (event) => {
            extraProps.onDragEnter?.(event);
            event.preventDefault();
            setIsDragActive(true);
        },
        onDragLeave: (event) => {
            extraProps.onDragLeave?.(event);
            event.preventDefault();
            setIsDragActive(false);
        },
        role: 'button',
        tabIndex: 0,
    });

    const getInputProps = (extraProps = {}) => ({
        ...extraProps,
        ref: inputRef,
        type: 'file',
        multiple: false,
        onChange: (event) => {
            extraProps.onChange?.(event);
            const selectedFile = event.target.files?.[0];
            setSelectedFile(selectedFile);
        },
        style: { ...extraProps.style, display: 'none' },
    });

    const handleBlurAmount = () => {
        // clamp to min/max on blur and show inline alert
        // validate on blur; do NOT auto-adjust, only show inline error
        if (minPay > 0 && amount < minPay) {
            const msg = `El monto debe ser al menos ${CURRENCY_FORMATTER.format(minPay)}.`;
            setAmountError(msg);
            return;
        }

        if (amount > maxPay) {
            const msg = `El monto no puede exceder ${CURRENCY_FORMATTER.format(maxPay)}.`;
            setAmountError(msg);
            return;
        }

        setAmountError('');
    };

   


    const handleSubmit = async () => {
        if (!file) {
            onFeedback?.({ type: 'error', message: 'Adjunta un comprobante antes de continuar.' });
            return;
        }

        if (amount < minPay) {
            setAmountError(`El monto debe ser al menos ${CURRENCY_FORMATTER.format(minPay)}.`);
            onFeedback?.({ type: 'error', message: `El monto es menor al mínimo requerido.` });
            return;
        }

        if (amount > maxPay) {
            setAmountError(`El monto no puede exceder ${CURRENCY_FORMATTER.format(maxPay)}.`);
            onFeedback?.({ type: 'error', message: `El monto supera el total de la reserva.` });
            return;
        }

        await onSubmit?.({ file, amountToPay: amount, booking: payment });


    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            className="upload-payment-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="upload-payment-modal__content">
                    <label className="upload-payment-modal__label" htmlFor="amountToPay">
                        Valor a pagar
                    </label>
                    <p className="upload-payment-modal__note">Debe pagar al menos el 50% para validar la reserva ({CURRENCY_FORMATTER.format(minPay)}).</p>
                    <input
                        id="amountToPay"
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 175000"
                        value={amountInput}
                        onChange={(event) => {
                            // allow only digits while typing; enforce only max (can't type more than total)
                            const digitsOnly = String(event.target.value).replace(/\D/g, '');
                            if (totalPrice > 0) {
                                const numeric = Number(digitsOnly || 0);
                                const clampedMax = Math.min(numeric, Math.round(maxPay));
                                setAmountInput(digitsOnly === '' ? '' : String(clampedMax));
                            } else {
                                setAmountInput(digitsOnly);
                            }
                        }}
                        onBlur={handleBlurAmount}
                        disabled={isSubmitting}
                    />

                    <div className="upload-payment-modal__summary">
                        <div>
                            <small>Rango: {CURRENCY_FORMATTER.format(minPay)} — {CURRENCY_FORMATTER.format(maxPay)}</small>
                        </div>
                        <strong>{CURRENCY_FORMATTER.format(amount)}</strong>
                    </div>

                    {amountError && (
                        <p className="upload-payment-modal__error" role="alert">
                            {amountError}
                        </p>
                    )}

                    <GenericFileDropzone
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                        file={file}
                        disabled={isSubmitting}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        emptyLabel="Haz clic o arrastra el comprobante"
                        activeLabel="Suelta el comprobante aqui"
                    />
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="light" onClick={onHide} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button className="upload-payment-modal__primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Guardar comprobante'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

UploadPaymentModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onSubmit: PropTypes.func,
    onFeedback: PropTypes.func,
    payment: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        total_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    isSubmitting: PropTypes.bool,
    title: PropTypes.string,
};

export default UploadPaymentModal;
