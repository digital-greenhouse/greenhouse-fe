import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserInfo from './UserInfo';

describe('UserInfo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders information from localStorage and normalizes roles', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Julian Admin',
        email: 'admin@example.com',
        phone: '123456789',
        roles: [{ name: 'SUPERADMIN' }],
        is_active: true,
        created_at: '2026-05-08T02:04:06Z',
      })
    );

    render(<UserInfo show onHide={vi.fn()} />);

    expect(screen.getByText('Julian Admin')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('SUPERADMIN')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows empty state when there is no stored user', () => {
    render(<UserInfo show onHide={vi.fn()} />);

    expect(
      screen.getByText('No hay información de usuario disponible en esta sesión.')
    ).toBeInTheDocument();
  });

  it('renders user data passed as an object', () => {
    render(
      <UserInfo
        show
        onHide={vi.fn()}
        user={{
          name: 'Laura',
          email: 'laura@example.com',
          phone: '55555',
          role: 'ADMIN',
          is_active: false,
          created_at: '2026-05-08T02:04:06Z',
        }}
      />
    );

    expect(screen.getByText('Laura')).toBeInTheDocument();
    expect(screen.getByText('laura@example.com')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('renders role lists joined from an array', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Ana',
        email: 'ana@example.com',
        roles: ['USER', { name: 'SUPERADMIN' }],
      })
    );

    render(<UserInfo show onHide={vi.fn()} />);

    expect(screen.getByText('USER, SUPERADMIN')).toBeInTheDocument();
  });

  it('falls back to No disponible for invalid created_at', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Ana',
        email: 'ana@example.com',
        created_at: 'invalid-date',
      })
    );

    render(<UserInfo show onHide={vi.fn()} />);

    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);
  });

  it('uses provided title when supplied', () => {
    render(<UserInfo show onHide={vi.fn()} title="Perfil de usuario" />);

    expect(screen.getByText('Perfil de usuario')).toBeInTheDocument();
  });

  it('shows unavailable text when optional fields are missing', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Sin campos',
      })
    );

    render(<UserInfo show onHide={vi.fn()} />);

    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(3);
  });

  it('shows inactive status when is_active is false', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Inactive',
        email: 'inactive@example.com',
        is_active: false,
      })
    );

    render(<UserInfo show onHide={vi.fn()} />);

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('keeps unsupported role values as unavailable', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Unknown',
        email: 'unknown@example.com',
        roles: null,
      })
    );

    render(<UserInfo show onHide={vi.fn()} />);

    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);
  });
});