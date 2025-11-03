import { useState } from 'react';
import type { Volunteer } from '../types/volunteer.types';

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

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acadêmico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {volunteer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.isAcademic ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.course || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.ra || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteersPage;
