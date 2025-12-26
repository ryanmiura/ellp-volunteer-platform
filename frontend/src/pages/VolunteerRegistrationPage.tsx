import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { volunteersService } from '../services/volunteers.service';
import type { VolunteerFormData } from '../types/volunteer.types';

function VolunteerRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VolunteerFormData>();

  const isAcademic = watch('isAcademic');

  const onSubmit = async (data: VolunteerFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Convert date string (YYYY-MM-DD) to ISO 8601 datetime format
      const dateObject = new Date(data.entryDate);
      const isoDateTime = dateObject.toISOString();

      // Convert isAcademic to boolean if it's a string
      const isAcademicBool = typeof data.isAcademic === 'string' 
        ? data.isAcademic === 'true' 
        : data.isAcademic;

      // Converte dados do formulário para formato da API
      await volunteersService.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        is_academic: isAcademicBool,
        course: isAcademicBool ? data.course : undefined,
        ra: isAcademicBool ? data.ra : undefined,
        entry_date: isoDateTime,
      });

      alert('Voluntário cadastrado com sucesso!');
      navigate('/volunteers');
    } catch (err: any) {
      console.error('Erro ao cadastrar voluntário:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao cadastrar voluntário. Tente novamente.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cadastrar Voluntário</h1>
        <p className="text-gray-600 mt-2">Preencha os dados para cadastrar um novo voluntário</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite o nome completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite o email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite o telefone"
              />
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Curso {isAcademic && '*'}
              </label>
              <input
                type="text"
                id="course"
                {...register('course', {
                  required: isAcademic ? 'Curso é obrigatório para acadêmicos' : false
                })}
                disabled={!isAcademic}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Digite o curso"
              />
              {errors.course && (
                <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="isAcademic" className="block text-sm font-medium text-gray-700">
                É acadêmico? *
              </label>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('isAcademic', { required: 'Campo obrigatório' })}
                    value="true"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Sim</span>
                </label>
                <label className="inline-flex items-center ml-6">
                  <input
                    type="radio"
                    {...register('isAcademic', { required: 'Campo obrigatório' })}
                    value="false"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Não</span>
                </label>
              </div>
              {errors.isAcademic && (
                <p className="mt-1 text-sm text-red-600">{errors.isAcademic.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="ra" className="block text-sm font-medium text-gray-700">
                RA (Registro Acadêmico) {isAcademic && '*'}
              </label>
              <input
                type="text"
                id="ra"
                {...register('ra', {
                  required: isAcademic ? 'RA é obrigatório para acadêmicos' : false
                })}
                disabled={!isAcademic}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Digite o registro acadêmico"
              />
              {errors.ra && (
                <p className="mt-1 text-sm text-red-600">{errors.ra.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">
                Data de Entrada *
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="date"
                  id="entryDate"
                  {...register('entryDate', { 
                    required: 'Data de entrada é obrigatória',
                    validate: (value) => {
                      const date = new Date(value);
                      const today = new Date();
                      if (date > today) {
                        return 'A data não pode ser no futuro';
                      }
                      return true;
                    }
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <svg className="ml-2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.entryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.entryDate.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Selecione a data de entrada do voluntário no programa
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/volunteers')}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

export default VolunteerRegistrationPage;