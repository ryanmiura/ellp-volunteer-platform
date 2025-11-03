import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import VolunteerRegistrationPage from '../VolunteerRegistrationPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('VolunteerRegistrationPage', () => {
  it('should render page title and description', () => {
    renderWithRouter(<VolunteerRegistrationPage />);
    
    expect(screen.getByText('Cadastrar Voluntário')).toBeInTheDocument();
    expect(screen.getByText(/preencha os dados/i)).toBeInTheDocument();
  });

  it('should render form input placeholders', () => {
    renderWithRouter(<VolunteerRegistrationPage />);
    
    expect(screen.getByPlaceholderText(/digite o nome completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite o email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite o telefone/i)).toBeInTheDocument();
  });

  it('should render academic radio buttons', () => {
    renderWithRouter(<VolunteerRegistrationPage />);
    
    expect(screen.getByText('É acadêmico?')).toBeInTheDocument();
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    renderWithRouter(<VolunteerRegistrationPage />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderWithRouter(<VolunteerRegistrationPage />);
    
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithRouter(<VolunteerRegistrationPage />);
    
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);
    
    // Should show validation errors
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
  });
});
