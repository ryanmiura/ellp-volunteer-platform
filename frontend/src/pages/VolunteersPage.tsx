import { useState } from 'react';
import type { Volunteer } from '../types/volunteer.types';
import viewIcon from '../assets/view-icon.svg';
import editIcon from '../assets/edit-icon.svg';
import trashIcon from '../assets/trash-icon.svg';

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    isAcademic: true,
    course: 'Engenharia de Computação',
    ra: '123456',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    isAcademic: true,
    course: 'Psicologia',
    ra: '234567',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 77777-7777',
    isAcademic: false,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 66666-6666',
    isAcademic: true,
    course: 'Medicina',
    ra: '345678',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: '5',
    name: 'Carlos Rodrigues',
    email: 'carlos.rodrigues@email.com',
    phone: '(11) 55555-5555',
    isAcademic: true,
    course: 'Direito',
    ra: '456789',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '6',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    phone: '(11) 44444-4444',
    isAcademic: false,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: '7',
    name: 'Lucas Pereira',
    email: 'lucas.pereira@email.com',
    phone: '(11) 33333-3333',
    isAcademic: true,
    course: 'Administração',
    ra: '567890',
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  },
  {
    id: '8',
    name: 'Juliana Alves',
    email: 'juliana.alves@email.com',
    phone: '(11) 22222-2222',
    isAcademic: true,
    course: 'Educação Física',
    ra: '678901',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01')
  }
];

function VolunteersPage() {
  const [volunteers] = useState<Volunteer[]>(mockVolunteers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    alert(`Visualizar voluntário: ${volunteer.name}\nEmail: ${volunteer.email}\nTelefone: ${volunteer.phone || 'Não informado'}`);
  };

  const handleEdit = (volunteer: Volunteer) => {
    alert(`Editar voluntário: ${volunteer.name}\nFuncionalidade em desenvolvimento...`);
  };

  const handleDeactivate = (volunteer: Volunteer) => {
    if (confirm(`Tem certeza que deseja inativar o voluntário ${volunteer.name}?`)) {
      alert(`Voluntário ${volunteer.name} foi inativado com sucesso!`);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Voluntários</h1>
        <p className="text-gray-600 mt-2">Gerencie os voluntários da plataforma</p>
      </div>

      <div className="mb-4">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por nome
          </label>
          <input
            type="text"
            id="search"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      {volunteer.isAcademic ? 'Sim' : 'Não'}
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
