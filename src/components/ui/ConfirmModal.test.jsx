import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  it('renders title, message and triggers callbacks', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        show
        title="Cerrar sesión"
        message="¿Seguro que deseas salir?"
        confirmText="Sí"
        cancelText="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    expect(screen.getByText('¿Seguro que deseas salir?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant class when variant is not danger', () => {
    render(
      <ConfirmModal
        show
        variant="primary"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass('is-primary');
  });

  it('uses danger class by default', () => {
    render(<ConfirmModal show onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass('is-danger');
  });

  it('renders default labels when no custom text is provided', () => {
    render(<ConfirmModal show onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Confirmar accion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('renders custom footer texts', () => {
    render(
      <ConfirmModal
        show
        confirmText="Aceptar"
        cancelText="Volver"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
  });
});