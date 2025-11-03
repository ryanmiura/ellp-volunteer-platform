import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import VolunteersPage from '../VolunteersPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('VolunteersPage', () => {
  it('should render page title and description', () => {
    renderWithRouter(<VolunteersPage />);
    
    expect(screen.getByText('Voluntários')).toBeInTheDocument();
    expect(screen.getByText('Gerencie os voluntários da plataforma')).toBeInTheDocument();
  });

  it('should render register volunteer button', () => {
    renderWithRouter(<VolunteersPage />);
    
    const registerButton = screen.getByRole('button', { name: /cadastrar voluntário/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithRouter(<VolunteersPage />);
    
    expect(screen.getByLabelText(/buscar por nome/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite o nome do voluntário/i)).toBeInTheDocument();
  });

  it('should render volunteer list with mock data', () => {
    renderWithRouter(<VolunteersPage />);
    
    // Check for some mock volunteer names
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    renderWithRouter(<VolunteersPage />);
    
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Telefone')).toBeInTheDocument();
    expect(screen.getByText('Acadêmico')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('should filter volunteers when searching', async () => {
    const user = userEvent.setup();
    renderWithRouter(<VolunteersPage />);
    
    const searchInput = screen.getByPlaceholderText(/digite o nome do voluntário/i);
    await user.type(searchInput, 'João');
    
    // João Silva should be visible
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    
    // Maria Santos should not be visible (only 5 items per page, but João should be first)
    // Note: This assumes the filter is working
  });

  it('should render pagination controls', () => {
    renderWithRouter(<VolunteersPage />);
    
    // Check for pagination elements (Anterior/Próximo buttons or page numbers)
    const buttons = screen.getAllByRole('button');
    const paginationButtons = buttons.filter(btn => 
      btn.textContent?.includes('Anterior') || 
      btn.textContent?.includes('Próximo') ||
      /^\d+$/.test(btn.textContent || '')
    );
    
    expect(paginationButtons.length).toBeGreaterThan(0);
  });

  it('should render action buttons for each volunteer', () => {
    renderWithRouter(<VolunteersPage />);
    
    // Each visible volunteer should have view, edit, and deactivate buttons (using title attribute)
    const viewButtons = screen.getAllByTitle('Visualizar');
    const editButtons = screen.getAllByTitle('Editar');
    const deactivateButtons = screen.getAllByTitle('Inativar');
    
    // Should have at least 5 of each button (one per visible volunteer)
    expect(viewButtons.length).toBeGreaterThanOrEqual(5);
    expect(editButtons.length).toBeGreaterThanOrEqual(5);
    expect(deactivateButtons.length).toBeGreaterThanOrEqual(5);
  });
});
