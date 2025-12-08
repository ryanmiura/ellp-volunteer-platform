import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Volunteer } from '../types/volunteer.types';
import { volunteersService } from '../services/volunteers.service';
import viewIcon from '../assets/view-icon.svg';
import editIcon from '../assets/edit-icon.svg';
import trashIcon from '../assets/trash-icon.svg';

function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Carrega voluntários ao montar o componente
  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteersService.getAll({ is_active: true });
      setVolunteers(data);
    } catch (err) {
      console.error('Erro ao carregar voluntários:', err);
      setError('Erro ao carregar voluntários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVolunteers = filteredVolunteers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (volunteer: Volunteer) => {
    const entryDate = new Date(volunteer.entry_date).toLocaleDateString('pt-BR');
    alert(
      `Voluntário: ${volunteer.name}\n` +
      `Email: ${volunteer.email}\n` +
      `Telefone: ${volunteer.phone || 'Não informado'}\n` +
      `Acadêmico: ${volunteer.is_academic ? 'Sim' : 'Não'}\n` +
      `Curso: ${volunteer.course || 'N/A'}\n` +
      `RA: ${volunteer.ra || 'N/A'}\n` +
      `Data de entrada: ${entryDate}\n` +
      `Status: ${volunteer.is_active ? 'Ativo' : 'Inativo'}`
    );
  };

  const handleEdit = (volunteer: Volunteer) => {
    alert(`Editar voluntário: ${volunteer.name}\nFuncionalidade em desenvolvimento...`);
  };

  const handleDeactivate = async (volunteer: Volunteer) => {
    if (confirm(`Tem certeza que deseja inativar o voluntário ${volunteer.name}?`)) {
      try {
        const exitDate = new Date().toISOString().split('T')[0];
        await volunteersService.inactivate(volunteer.id, { exit_date: exitDate });
        alert(`Voluntário ${volunteer.name} foi inativado com sucesso!`);
        loadVolunteers(); // Recarrega a lista
      } catch (err) {
        console.error('Erro ao inativar voluntário:', err);
        alert('Erro ao inativar voluntário. Tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Carregando voluntários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadVolunteers}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Voluntários</h1>
            <p className="text-gray-600 mt-2">Gerencie os voluntários da plataforma</p>
          </div>
          <button
            onClick={() => navigate('/volunteers/register')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cadastrar Voluntário
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por nome
          </label>
          <input
            type="text"
            id="search"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            style={{ backgroundColor: 'white' }}
            placeholder="Digite o nome do voluntário..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                    Acadêmico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Curso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                    RA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {volunteer.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.phone || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.is_academic ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.course || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.ra || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-32">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(volunteer)}
                          className="w-8 h-8 text-blue-600 hover:text-blue-900 p-1 rounded flex items-center justify-center"
                          title="Visualizar"
                        >
                          <img src={viewIcon} alt="Visualizar" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(volunteer)}
                          className="w-8 h-8 text-yellow-600 hover:text-yellow-900 p-1 rounded flex items-center justify-center"
                          title="Editar"
                        >
                          <img src={editIcon} alt="Editar" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(volunteer)}
                          className="w-8 h-8 text-red-600 hover:text-red-900 p-1 rounded flex items-center justify-center"
                          title="Inativar"
                        >
                          <img src={trashIcon} alt="Inativar" className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{startIndex + 1}</span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(startIndex + itemsPerPage, filteredVolunteers.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{filteredVolunteers.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Próximo</span>
                      ›
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VolunteersPage;
