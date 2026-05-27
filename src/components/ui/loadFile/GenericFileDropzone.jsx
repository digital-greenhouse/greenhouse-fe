import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import './FileDropzone.css';

function GenericFileDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  file,
  disabled = false,
  accept = '*',
  emptyLabel = 'Haga clic para cargar o arrastre y suelte',
  activeLabel = 'Suelta el archivo aqui...',
}) {
  const rootProps = getRootProps({
    onClick: (event) => disabled && event.preventDefault(),
    onDrop: (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onDragOver: (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onDragEnter: (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onDragLeave: (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  });

  return (
    <div {...rootProps} className={`file-dropzone ${disabled ? 'disabled' : ''}`}>
      <input {...getInputProps({ accept })} disabled={disabled} />

      {file ? (
        <div className="file-preview">
          <p className="file-name">{`Archivo: ${file.name}`}</p>
        </div>
      ) : (
        <div className="overlay-text">
          <FontAwesomeIcon className="icon" icon={faUpload} />
          {isDragActive ? activeLabel : emptyLabel}
        </div>
      )}
    </div>
  );
}

GenericFileDropzone.propTypes = {
  getRootProps: PropTypes.func.isRequired,
  getInputProps: PropTypes.func.isRequired,
  isDragActive: PropTypes.bool,
  file: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.number,
  }),
  disabled: PropTypes.bool,
  accept: PropTypes.string,
  emptyLabel: PropTypes.string,
  activeLabel: PropTypes.string,
};

export default GenericFileDropzone;
