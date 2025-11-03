import { useForm } from 'react-hook-form';

interface VolunteerFormData {
  name: string;
  email: string;
  phone?: string;
  course?: string;
  entryDate: string;
}

function VolunteerRegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerFormData>();

  const onSubmit = (data: VolunteerFormData) => {
    // Validação simples
    if (!data.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    if (!data.email.trim()) {
      alert('Email é obrigatório');
      return;
    }
    if (!data.entryDate) {
      alert('Data de entrada é obrigatória');
      return;
    }

    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      alert('Email inválido');
      return;
    }

    console.log('Dados do voluntário:', data);
    alert('Voluntário cadastrado com sucesso!');
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
                Curso
              </label>
              <input
                type="text"
                id="course"
                {...register('course')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite o curso"
              />
            </div>

            <div>
              <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">
                Data de Entrada *
              </label>
              <input
                type="date"
                id="entryDate"
                {...register('entryDate', { required: 'Data de entrada é obrigatória' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.entryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.entryDate.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VolunteerRegistrationPage;