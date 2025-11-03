import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';


const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardPage', () => {
  it('should render hero section with title and description', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('ELLP - Ensino Lúdico de Lógica e Programação')).toBeInTheDocument();
    expect(screen.getByText(/Sistema de Gerenciamento de Voluntários/i)).toBeInTheDocument();
  });

  it('should render feature cards for Volunteers and Workshops', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Gerenciar Voluntários')).toBeInTheDocument();
    expect(screen.getByText('Oficinas')).toBeInTheDocument();
  });

  it('should render info cards with system features', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Cadastro Completo')).toBeInTheDocument();
    expect(screen.getByText('Busca Rápida')).toBeInTheDocument();
    expect(screen.getByText('Histórico Completo')).toBeInTheDocument();
  });

  it('should render about section', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Sobre o Projeto ELLP')).toBeInTheDocument();
    expect(screen.getByText('Nossa Missão')).toBeInTheDocument();
    expect(screen.getByText('Funcionalidades do Sistema')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Acessar Voluntários')).toBeInTheDocument();
    expect(screen.getByText('Acessar Oficinas')).toBeInTheDocument();
  });

  it('should render system features list', () => {
    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Cadastro e gerenciamento de voluntários')).toBeInTheDocument();
    expect(screen.getByText('Registro de oficinas e atividades realizadas')).toBeInTheDocument();
    expect(screen.getByText('Associação de voluntários às oficinas')).toBeInTheDocument();
    expect(screen.getByText('Geração de termos de voluntariado em PDF')).toBeInTheDocument();
    expect(screen.getByText('Controle de entrada e saída de voluntários')).toBeInTheDocument();
  });
});
