import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../../../../api/properties';
import {autoGenerateRules} from '../../../../api/properties';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import GenericFileDropzone from '../../../../components/ui/loadFile/GenericFileDropzone';
import { convertToBase64 } from '../../../../components/utils/ConvertBase64File';
import './NewProperty.css';

const initialFormState = {
    name: '',
    description: '',
    address: '',
    base_price_per_night: '',
    max_capacity: '',
};

const MAX_IMAGES = 4;
const MAX_DESCRIPTION_WORDS = 60;

function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimToWordLimit(text, limit) {
    const words = text.trim().split(/\s+/).filter(Boolean);

    if (words.length <= limit) {
        return text;
    }

    return words.slice(0, limit).join(' ');
}

function NewProperty() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState(initialFormState);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedImages.length === 0) {
            setImagePreviewUrls([]);
            return undefined;
        }

        const previewUrls = selectedImages.map((image) => URL.createObjectURL(image));
        setImagePreviewUrls(previewUrls);

        return () => {
            previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
        };
    }, [selectedImages]);

    const confirmationMessage = useMemo(() => {
        const name = formData.name.trim() || 'esta propiedad';
        const imageCount = selectedImages.length;
        return `Vas a publicar ${name} con ${imageCount} imagen${imageCount === 1 ? '' : 'es'}. Confirma para guardar el registro.`;
    }, [formData.name, selectedImages.length]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "name" && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) {
            return;
        }

        if (name === 'description') {
            const normalizedDescription = trimToWordLimit(value, MAX_DESCRIPTION_WORDS);

            setFormData((previous) => ({
                ...previous,
                [name]: normalizedDescription,
            }));

            setFieldErrors((previous) => ({
                ...previous,
                [name]: countWords(value) > MAX_DESCRIPTION_WORDS ? `La descripcion permite maximo ${MAX_DESCRIPTION_WORDS} palabras.` : '',
            }));

            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            [name]: '',
        }));
    };

    const handleSelectImages = (files) => {
        const nextFiles = Array.from(files || []);

        if (nextFiles.length === 0) {
            return;
        }

        if (nextFiles.length > MAX_IMAGES) {
            setFieldErrors((previous) => ({
                ...previous,
                images: `Solo se permiten hasta ${MAX_IMAGES} imagenes.`,
            }));
            return;
        }

        const invalidFile = nextFiles.find((file) => !file.type?.startsWith('image/'));

        if (invalidFile) {
            setFieldErrors((previous) => ({
                ...previous,
                images: 'Solo se permiten archivos de imagen.',
            }));
            return;
        }

        setSelectedImages(nextFiles);
        setFieldErrors((previous) => ({
            ...previous,
            images: '',
        }));
    };

    const dispatchFeedback = (type, message) => {
        globalThis.dispatchEvent(
            new CustomEvent('property-feedback', {
                detail: {
                    type,
                    message,
                },
            })
        );
    };

    const getRootProps = (rootProps = {}) => ({
        ...rootProps,
        onClick: (event) => {
            rootProps.onClick?.(event);

            if (event.defaultPrevented || isSubmitting) {
                return;
            }

            fileInputRef.current?.click();
        },
        onDragEnter: (event) => {
            rootProps.onDragEnter?.(event);

            if (isSubmitting) {
                return;
            }

            event.preventDefault();
            setIsDragActive(true);
        },
        onDragOver: (event) => {
            rootProps.onDragOver?.(event);

            if (isSubmitting) {
                return;
            }

            event.preventDefault();
            setIsDragActive(true);
        },
        onDragLeave: (event) => {
            rootProps.onDragLeave?.(event);

            if (isSubmitting) {
                return;
            }

            event.preventDefault();
            setIsDragActive(false);
        },
        onDrop: (event) => {
            rootProps.onDrop?.(event);

            if (isSubmitting) {
                return;
            }

            event.preventDefault();
            setIsDragActive(false);

            const droppedFiles = Array.from(event.dataTransfer?.files || []);
            handleSelectImages(droppedFiles);
        },
    });

    const getInputProps = (inputProps = {}) => ({
        ...inputProps,
        ref: fileInputRef,
        type: 'file',
        accept: 'image/*',
        multiple: true,
        onChange: (event) => {
            inputProps.onChange?.(event);

            handleSelectImages(event.target.files);
            event.target.value = '';
        },
    });

    const validateForm = () => {
        const nextErrors = {};

        if (!formData.name.trim()) nextErrors.name = 'El nombre es obligatorio.';
        if (!formData.description.trim()) {
            nextErrors.description = 'La descripcion es obligatoria.';
        } else if (countWords(formData.description) > MAX_DESCRIPTION_WORDS) {
            nextErrors.description = `La descripcion permite maximo ${MAX_DESCRIPTION_WORDS} palabras.`;
        }
        if (!formData.address.trim()) nextErrors.address = 'La direccion es obligatoria.';

        const price = Number(formData.base_price_per_night);
        if (!formData.base_price_per_night || Number.isNaN(price) || price <= 0) {
            nextErrors.base_price_per_night = 'Ingresa un precio valido mayor que 0.';
        }

        const capacity = Number(formData.max_capacity);
        if (!formData.max_capacity || Number.isNaN(capacity) || capacity <= 0) {
            nextErrors.max_capacity = 'Ingresa una capacidad valida mayor que 0.';
        }

        if (selectedImages.length === 0) {
            nextErrors.images = 'Debes cargar al menos una imagen.';
        }

        if (selectedImages.length > MAX_IMAGES) {
            nextErrors.images = `Solo se permiten hasta ${MAX_IMAGES} imagenes.`;
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) {
            dispatchFeedback('warning', 'Completa los campos obligatorios antes de continuar.');
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        if (selectedImages.length === 0 || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const images = await Promise.all(
                selectedImages.map(async (image, index) => {
                    const { base64, mimeType } = await convertToBase64(image);

                    return {
                        image_data: base64,
                        mime_type: mimeType || image.type || 'image/png',
                        alt_text: `${formData.name.trim() || 'Propiedad'} - imagen ${index + 1}`,
                        is_cover: index === 0,
                        sort_order: index,
                    };
                })
            );

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                address: formData.address.trim(),
                base_price_per_night: Number(formData.base_price_per_night),
                max_capacity: Number(formData.max_capacity),
                images,
            };

            const newProperty = await createProperty(payload);

            await autoGenerateRules(newProperty?.data?.id);

            console.log('Propiedad creada:', newProperty);

            setFormData(initialFormState);
            setSelectedImages([]);
            setFieldErrors({});
            setShowConfirmModal(false);
            globalThis.dispatchEvent(new Event('properties-updated'));
            dispatchFeedback('success', 'La propiedad se registro correctamente.');
            //navigate('/properties');
        } catch (error) {
            console.error('Error al crear la propiedad:', error);
            dispatchFeedback('error', 'No fue posible registrar la propiedad. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="new-property-page">
            <section className="new-property-hero">
                <p className="new-property-hero__eyebrow">Publicar propiedad</p>
                <h1>Registra tu espacio en unos pocos pasos</h1>
                <p>
                    Completa la informacion principal, carga hasta 4 imagenes y confirma antes de guardar.
                </p>
            </section>

            <div className="new-property-layout">
                <form className="new-property-card new-property-form" onSubmit={handleSubmit} noValidate>
                    <div className="new-property-form__grid">
                        <label className="new-property-field new-property-field--full" htmlFor="name">
                            <span>Nombre de la propiedad</span>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Villa Encantada"
                                autoComplete="off"
                                maxLength="50"
                            />
                            {fieldErrors.name && <small className="new-property-field__error">{fieldErrors.name}</small>}
                        </label>

                        <label className="new-property-field new-property-field--full" htmlFor="description">
                            <span>Descripcion</span>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe el espacio, la experiencia y para quién está pensado."
                                rows="6"
                                maxLength="450"
                            />
                            <small className="new-property-field__hint">
                                {countWords(formData.description)} / {MAX_DESCRIPTION_WORDS} palabras
                            </small>
                            {fieldErrors.description && <small className="new-property-field__error">{fieldErrors.description}</small>}
                        </label>

                        <label className="new-property-field new-property-field--full" htmlFor="address">
                            <span>Direccion</span>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Motavita, Boyaca - Colombia"
                                required
                                maxLength="60"
                            />
                            {fieldErrors.address && <small className="new-property-field__error">{fieldErrors.address}</small>}
                        </label>

                        <label className="new-property-field" htmlFor="base_price_per_night">
                            <span>Precio base por noche</span>
                            <input
                                id="base_price_per_night"
                                name="base_price_per_night"
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.base_price_per_night}
                                onChange={handleChange}
                                placeholder="50000"
                                required
                            />
                            {fieldErrors.base_price_per_night && (
                                <small className="new-property-field__error">{fieldErrors.base_price_per_night}</small>
                            )}
                        </label>

                        <label className="new-property-field" htmlFor="max_capacity">
                            <span>Capacidad maxima</span>
                            <input
                                id="max_capacity"
                                name="max_capacity"
                                type="number"
                                min="1"
                                step="1"
                                value={formData.max_capacity}
                                onChange={handleChange}
                                placeholder="8"
                                required
                            />
                            {fieldErrors.max_capacity && (
                                <small className="new-property-field__error">{fieldErrors.max_capacity}</small>
                            )}
                        </label>

                        <div className="new-property-field new-property-field--full">
                            <span>Imagenes de la propiedad</span>
                            <GenericFileDropzone
                                getRootProps={getRootProps}
                                getInputProps={getInputProps}
                                isDragActive={isDragActive}
                                files={selectedImages}
                                disabled={isSubmitting}
                                accept="image/*"
                                emptyLabel={`Haz clic o arrastra hasta ${MAX_IMAGES} imagenes JPG, PNG o WEBP`}
                                activeLabel={`Suelta las imagenes para cargarlas (maximo ${MAX_IMAGES})`}
                                required
                            />
                            {fieldErrors.images && <small className="new-property-field__error">{fieldErrors.images}</small>}
                        </div>
                    </div>

                    <div className="new-property-actions">
                        <button
                            type="button"
                            className="new-property-button new-property-button--secondary"
                            onClick={() => navigate('/properties')}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="new-property-button new-property-button--primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Registrando...' : 'Publicar propiedad'}
                        </button>
                    </div>
                </form>

                <aside className="new-property-card new-property-summary">
                    <h2>Vista previa</h2>
                    {selectedImages.length > 0 ? (
                        <div className="new-property-summary__gallery">
                            {selectedImages.map((image, index) => {
                                const previewUrl = imagePreviewUrls[index];

                                return (
                                    <figure
                                        className="new-property-summary__image-wrap"
                                        key={`${image.name}-${image.size}-${index}`}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt={`${formData.name.trim() || 'Vista previa de la propiedad'} ${index + 1}`}
                                            />
                                        ) : null}
                                    </figure>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="new-property-summary__placeholder">
                            <p>La imagen seleccionada aparecera aqui.</p>
                        </div>
                    )}

                    <div className="new-property-summary__details">
                        <h3>{formData.name.trim() || 'Villa Encantada'}</h3>
                        <p>{formData.address.trim() || 'Motavita, Boyaca - Colombia'}</p>
                        <div>
                            <strong>${formData.base_price_per_night || '0'}</strong>
                            <span> por noche</span>
                        </div>
                        <div>
                            <strong>{formData.max_capacity || '0'}</strong>
                            <span> personas maximo</span>
                        </div>
                    </div>
                </aside>
            </div>

            <ConfirmModal
                show={showConfirmModal}
                title="Confirmar publicacion"
                message={confirmationMessage}
                confirmText={isSubmitting ? 'Registrando...' : 'Confirmar y guardar'}
                cancelText="Volver"
                onConfirm={handleConfirmSubmit}
                onCancel={() => setShowConfirmModal(false)}
                variant="primary"
            />
        </main>
    );
}

export default NewProperty;