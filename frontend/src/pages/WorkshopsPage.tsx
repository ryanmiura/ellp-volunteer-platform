import { useState, useEffect } from 'react';
import type { Workshop, CreateWorkshopRequest, UpdateWorkshopRequest } from '../types/workshop.types';
import type { Volunteer } from '../types/volunteer.types';
import { workshopsService } from '../services/workshops.service';
import { volunteersService } from '../services/volunteers.service';
import Button from '../components/Button';
import Modal from '../components/Modal';
import viewIcon from '../assets/view-icon.svg';
import editIcon from '../assets/edit-icon.svg';
import trashIcon from '../assets/trash-icon.svg';

function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 5;

  // Carrega oficinas e voluntários ao montar o componente
  useEffect(() => {
    loadWorkshops();
    loadVolunteers();
  }, []);

  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workshopsService.getAll();
      setWorkshops(data);
    } catch (err) {
      console.error('Erro ao carregar oficinas:', err);
      setError('Erro ao carregar oficinas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteers = async () => {
    try {
      const data = await volunteersService.getAll();
      setVolunteers(data);
    } catch (err) {
      console.error('Erro ao carregar voluntários:', err);
    }
  };

  const getVolunteersByIds = (volunteerIds: string[]) => {
    return volunteers.filter(volunteer => volunteerIds.includes(volunteer.id));
  };

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkshops = filteredWorkshops.slice(startIndex, startIndex + itemsPerPage);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.date) {
      errors.date = 'Data é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: ''
    });
    setFormErrors({});
  };

  const handleCreateWorkshop = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const workshopData: CreateWorkshopRequest = {
        name: formData.name,
        date: formData.date,
        description: formData.description
      };

      await workshopsService.create(workshopData);
      await loadWorkshops();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar oficina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditWorkshop = async () => {
    if (!validateForm() || !selectedWorkshop) return;

    setSubmitting(true);
    setError(null);

    try {
      const workshopData: UpdateWorkshopRequest = {
        name: formData.name,
        date: formData.date,
        description: formData.description
      };

      await workshopsService.update(selectedWorkshop.id, workshopData);
      await loadWorkshops();
      setShowEditModal(false);
      resetForm();
      setSelectedWorkshop(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar oficina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkshop = async (workshop: Workshop) => {
    if (!confirm(`Tem certeza que deseja excluir a oficina "${workshop.name}"?`)) {
      return;
    }

    setError(null);

    try {
      await workshopsService.delete(workshop.id);
      await loadWorkshops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir oficina');
    }
  };

  const handleView = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setShowViewModal(true);
  };

  const handleEdit = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setFormData({
      name: workshop.name,
      date: workshop.date,
      description: workshop.description || ''
    });
    setShowEditModal(true);
  };

  const handleManageVolunteers = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setShowVolunteersModal(true);
  };

  const handleToggleVolunteer = async (volunteerId: string) => {
    if (!selectedWorkshop) return;

    setError(null);

    try {
      const currentVolunteers = selectedWorkshop.volunteers || [];
      const isRemoving = currentVolunteers.includes(volunteerId);

      if (isRemoving) {
        await workshopsService.removeVolunteer(selectedWorkshop.id, volunteerId);
      } else {
        await workshopsService.addVolunteer(selectedWorkshop.id, volunteerId);
      }

      await loadWorkshops();
      
      // Atualizar selectedWorkshop com dados mais recentes
      const updatedWorkshop = workshops.find(w => w.id === selectedWorkshop.id);
      if (updatedWorkshop) {
        setSelectedWorkshop(updatedWorkshop);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar voluntários');
    }
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Oficinas</h1>
            <p className="text-gray-600 mt-2">Gerencie as oficinas da plataforma</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Cadastrar Oficina
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Carregando oficinas...</p>
        </div>
      ) : (
        <>
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
            placeholder="Digite o nome da oficina..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voluntários
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedWorkshops.map((workshop) => (
                  <tr key={workshop.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{workshop.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(workshop.date)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {workshop.description || 'Sem descrição'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {workshop.volunteers?.length || 0} voluntário(s)
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(workshop)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <img src={viewIcon} alt="Visualizar" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(workshop)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <img src={editIcon} alt="Editar" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleManageVolunteers(workshop)}
                          className="text-green-600 hover:text-green-900"
                          title="Gerenciar Voluntários"
                        >
                          👥
                        </button>
                        <button
                          onClick={() => handleDeleteWorkshop(workshop)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <img src={trashIcon} alt="Excluir" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma oficina encontrada.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'text-white bg-blue-600 border border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Create Workshop Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Cadastrar Nova Oficina"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateWorkshop(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Oficina *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite o nome da oficina"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Data de Realização *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite uma descrição para a oficina"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Workshop Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedWorkshop(null);
        }}
        title="Editar Oficina"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleEditWorkshop(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                Nome da Oficina *
              </label>
              <input
                type="text"
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite o nome da oficina"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
                Data de Realização *
              </label>
              <input
                type="date"
                id="edit-date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite uma descrição para a oficina"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedWorkshop(null);
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Workshop Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedWorkshop(null);
        }}
        title="Detalhes da Oficina"
      >
        {selectedWorkshop && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <p className="mt-1 text-sm text-gray-900">{selectedWorkshop.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Realização</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedWorkshop.date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <p className="mt-1 text-sm text-gray-900">{selectedWorkshop.description || 'Sem descrição'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Voluntários Associados</label>
              <div className="mt-1">
                {selectedWorkshop.volunteers && selectedWorkshop.volunteers.length > 0 ? (
                  <ul className="space-y-1">
                    {getVolunteersByIds(selectedWorkshop.volunteers).map((volunteer) => (
                      <li key={volunteer.id} className="text-sm text-gray-900">
                        • {volunteer.name} ({volunteer.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum voluntário associado</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Manage Volunteers Modal */}
      <Modal
        isOpen={showVolunteersModal}
        onClose={() => {
          setShowVolunteersModal(false);
          setSelectedWorkshop(null);
        }}
        title="Gerenciar Voluntários"
        size="xl"
      >
        {selectedWorkshop && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Oficina: {selectedWorkshop.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Selecione os voluntários que trabalharam nesta oficina:
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {volunteers.map((volunteer) => (
                  <label
                    key={volunteer.id}
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkshop.volunteers?.includes(volunteer.id) || false}
                      onChange={() => handleToggleVolunteer(volunteer.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                      <div className="text-sm text-gray-500">{volunteer.email}</div>
                      {volunteer.course && (
                        <div className="text-xs text-gray-400">{volunteer.course}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setShowVolunteersModal(false);
                  setSelectedWorkshop(null);
                }}
              >
                Concluir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default WorkshopsPage
