import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage', () => {
  it('should render login form by default', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite seu usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
  });

  it('should render register link', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Não tem uma conta?')).toBeInTheDocument();
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Esqueci minha senha')).toBeInTheDocument();
  });

  it('should switch to register view when clicking register link', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const registerLink = screen.getByText('Cadastre-se');
    await user.click(registerLink);
    
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite seu nome completo')).toBeInTheDocument();
  });

  it('should switch to forgot password view when clicking forgot password link', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const forgotLink = screen.getByText('Esqueci minha senha');
    await user.click(forgotLink);
    
    expect(screen.getByText('Recuperar Senha')).toBeInTheDocument();
    expect(screen.getByText(/Digite seu email/i)).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty login form', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Usuário é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty register form', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const registerLink = screen.getByText('Cadastre-se');
    await user.click(registerLink);
    
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Nome completo é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
  });

  it('should validate password match in register form', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const registerLink = screen.getByText('Cadastre-se');
    await user.click(registerLink);
    
    const passwordInput = screen.getByPlaceholderText('Digite sua senha (mínimo 6 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Digite sua senha novamente');
    
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different');
    
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    await user.click(submitButton);
    
    expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
  });
});
