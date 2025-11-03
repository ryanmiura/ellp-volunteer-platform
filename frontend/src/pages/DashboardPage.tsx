import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import InfoCard from '../components/InfoCard';

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 mb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ELLP - Ensino Lúdico de Lógica e Programação
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Sistema de Gerenciamento de Voluntários
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Bem-vindo à plataforma de gerenciamento interno do projeto de extensão ELLP. 
            Este sistema foi desenvolvido para facilitar o controle e organização dos voluntários 
            que contribuem para levar o ensino de lógica e programação de forma lúdica e acessível.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FeatureCard
          title="Gerenciar Voluntários"
          description="Cadastre, edite e acompanhe todos os voluntários do projeto. Mantenha um registro completo com informações de contato, período de atuação e histórico de participação."
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          buttonText="Acessar Voluntários"
          onButtonClick={() => navigate('/volunteers')}
        />
        <FeatureCard
          title="Oficinas"
          description="Registre as oficinas realizadas, gerencie as datas e associe os voluntários que participaram de cada atividade. Mantenha um histórico completo das ações do projeto."
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          buttonText="Acessar Oficinas"
          onButtonClick={() => navigate('/workshops')}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          title="Cadastro Completo"
          description="Registre informações detalhadas de cada voluntário e suas participações"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <InfoCard
          title="Busca Rápida"
          description="Encontre rapidamente voluntários e oficinas com sistema de busca integrado"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <InfoCard
          title="Histórico Completo"
          description="Visualize o histórico de participação de cada voluntário nas oficinas"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sobre o Projeto ELLP</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nossa Missão</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                O ELLP é um projeto de extensão universitária dedicado a levar o ensino de lógica e 
                programação de forma lúdica e acessível para comunidades e escolas. Através de oficinas 
                práticas e dinâmicas, buscamos despertar o interesse pela tecnologia e desenvolver o 
                raciocínio lógico dos participantes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 ml-10">Funcionalidades do Sistema</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 ml-10">•</span>
                  Cadastro e gerenciamento de voluntários
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 ml-10">•</span>
                  Registro de oficinas e atividades realizadas
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 ml-10">•</span>
                  Associação de voluntários às oficinas
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 ml-10">•</span>
                  Geração de termos de voluntariado em PDF
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 ml-10">•</span>
                  Controle de entrada e saída de voluntários
                </li>
              </ul>
            </div>
          </div>
      </div>
    </div>
  );
}

export default DashboardPage;
