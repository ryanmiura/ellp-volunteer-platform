import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import WorkshopsPage from '../WorkshopsPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('WorkshopsPage', () => {
  it('should render page title and description', () => {
    renderWithRouter(<WorkshopsPage />);
    
    expect(screen.getByText('Oficinas')).toBeInTheDocument();
    expect(screen.getByText(/gerencie as oficinas/i)).toBeInTheDocument();
  });

  it('should render create workshop button', () => {
    renderWithRouter(<WorkshopsPage />);
    
    const createButton = screen.getByRole('button', { name: /cadastrar oficina/i });
    expect(createButton).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithRouter(<WorkshopsPage />);
    
    expect(screen.getByPlaceholderText(/digite o nome da oficina/i)).toBeInTheDocument();
  });

  it('should render workshop list with mock data', () => {
    renderWithRouter(<WorkshopsPage />);
    
    // Check for some mock workshop names
    expect(screen.getByText(/introdução à programação/i)).toBeInTheDocument();
    expect(screen.getByText(/lógica de programação/i)).toBeInTheDocument();
  });

  it('should render table headers', () => {
    renderWithRouter(<WorkshopsPage />);
    
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Voluntários')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('should open create modal when clicking create button', async () => {
    const user = userEvent.setup();
    renderWithRouter(<WorkshopsPage />);
    
    const createButton = screen.getByRole('button', { name: /cadastrar oficina/i });
    await user.click(createButton);
    
    // Modal should appear with form
    expect(screen.getByText(/nome da oficina/i)).toBeInTheDocument();
  });

  it('should render action buttons for each workshop', () => {
    renderWithRouter(<WorkshopsPage />);
    
    // Each workshop should have view, edit, and delete buttons (using title attribute)
    const viewButtons = screen.getAllByTitle('Visualizar');
    const editButtons = screen.getAllByTitle('Editar');
    const deleteButtons = screen.getAllByTitle('Excluir');
    
    // Should have at least 4 of each button (one per workshop)
    expect(viewButtons.length).toBeGreaterThanOrEqual(4);
    expect(editButtons.length).toBeGreaterThanOrEqual(4);
    expect(deleteButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('should filter workshops when searching', async () => {
    const user = userEvent.setup();
    renderWithRouter(<WorkshopsPage />);
    
    const searchInput = screen.getByPlaceholderText(/digite o nome da oficina/i);
    await user.type(searchInput, 'Introdução');
    
    // "Introdução à Programação" should be visible
    expect(screen.getByText(/introdução à programação/i)).toBeInTheDocument();
  });
});
