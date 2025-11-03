import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

type ViewMode = 'login' | 'register' | 'forgot-password';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function LoginPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginForm>>({});
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [registerErrors, setRegisterErrors] = useState<Partial<RegisterForm>>({});
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const errors: Partial<LoginForm> = {};

    if (!loginForm.username.trim()) {
      errors.username = 'Usuário é obrigatório';
    }

    if (!loginForm.password) {
      errors.password = 'Senha é obrigatória';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    alert(`Login realizado!\nUsuário: ${loginForm.username}`);
    setLoginErrors({});
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    const errors: Partial<RegisterForm> = {};

    if (!registerForm.fullName.trim()) {
      errors.fullName = 'Nome completo é obrigatório';
    }

    if (!registerForm.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      errors.email = 'Email inválido';
    }

    if (!registerForm.password) {
      errors.password = 'Senha é obrigatória';
    } else if (registerForm.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    alert(`Cadastro realizado com sucesso!\nNome: ${registerForm.fullName}\nEmail: ${registerForm.email}`);
    setRegisterErrors({});
    setRegisterForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setCurrentView('login');
  };

  const handleForgotPassword = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      alert('Por favor, informe seu email');
      return;
    }
    alert(`Instruções de recuperação de senha foram enviadas para: ${forgotPasswordEmail}`);
    setForgotPasswordEmail('');
    setCurrentView('login');
  };

  const changeView = (view: ViewMode) => {
    setCurrentView(view);
    setLoginErrors({});
    setRegisterErrors({});
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                ELLP - Plataforma de Voluntários
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200 px-4 py-8 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
          {currentView === 'login' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bem-vindo
                </h1>
                <p className="text-gray-600">
                  Entre com suas credenciais para acessar a plataforma
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <Input
                  label="Usuário"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={loginForm.username}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, username: e.target.value });
                    if (loginErrors.username) {
                      setLoginErrors({ ...loginErrors, username: undefined });
                    }
                  }}
                  error={loginErrors.username}
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, password: e.target.value });
                    if (loginErrors.password) {
                      setLoginErrors({ ...loginErrors, password: undefined });
                    }
                  }}
                  error={loginErrors.password}
                />
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm px-0"
                    onClick={() => changeView('forgot-password')}
                  >
                    Esqueci minha senha
                  </Button>
                </div>
                <Button type="submit" fullWidth>
                  Entrar
                </Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => changeView('register')}
                  >
                    Cadastre-se
                  </Button>
                </p>
              </div>
            </div>
          )}
          {currentView === 'register' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Criar Conta
                </h1>
                <p className="text-gray-600">
                  Preencha seus dados para se cadastrar
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Nome Completo"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={registerForm.fullName}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, fullName: e.target.value });
                    if (registerErrors.fullName) {
                      setRegisterErrors({ ...registerErrors, fullName: undefined });
                    }
                  }}
                  error={registerErrors.fullName}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Digite seu email"
                  value={registerForm.email}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, email: e.target.value });
                    if (registerErrors.email) {
                      setRegisterErrors({ ...registerErrors, email: undefined });
                    }
                  }}
                  error={registerErrors.email}
                />

                <Input
                  label="Senha"
                  type="password"
                  placeholder="Digite sua senha (mínimo 6 caracteres)"
                  value={registerForm.password}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, password: e.target.value });
                    if (registerErrors.password) {
                      setRegisterErrors({ ...registerErrors, password: undefined });
                    }
                  }}
                  error={registerErrors.password}
                />

                <Input
                  label="Repetir Senha"
                  type="password"
                  placeholder="Digite sua senha novamente"
                  value={registerForm.confirmPassword}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                    if (registerErrors.confirmPassword) {
                      setRegisterErrors({ ...registerErrors, confirmPassword: undefined });
                    }
                  }}
                  error={registerErrors.confirmPassword}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => changeView('login')}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" fullWidth>
                    Cadastrar
                  </Button>
                </div>
              </form>
            </div>
          )}
          {currentView === 'forgot-password' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Recuperar Senha
                </h1>
                <p className="text-gray-600">
                  Digite seu email para receber instruções de recuperação
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Digite seu email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => changeView('login')}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" fullWidth>
                    Enviar
                  </Button>
                </div>
              </form>
            </div>
          )}
          </div>
          
          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            © 2025 ELLP - Plataforma de Voluntários
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
