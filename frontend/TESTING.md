# 🧪 Guia de Testes Automatizados

## 📦 Bibliotecas Instaladas

- **Vitest**: Framework de testes rápido e moderno (compatível com Vite)
- **@testing-library/react**: Biblioteca para testar componentes React
- **@testing-library/jest-dom**: Matchers customizados para assertions
- **@testing-library/user-event**: Simula interações de usuário
- **jsdom**: Ambiente DOM para testes

## 🚀 Como Rodar os Testes

### 1. **Modo Watch (Desenvolvimento)**
Roda os testes automaticamente quando você salva arquivos:
```bash
npm test
```

### 2. **Rodar Todos os Testes Uma Vez**
Executa todos os testes e mostra o resultado:
```bash
npm run test:run
```

### 3. **Interface Visual (Recomendado)**
Abre uma interface web interativa para ver os testes:
```bash
npm run test:ui
```

### 4. **Cobertura de Código**
Gera relatório de cobertura de testes:
```bash
npm run test:coverage
```

## 📁 Estrutura de Testes Criados

```
src/
├── components/
│   └── tests/
│       ├── Button.test.tsx        ✅ 9 testes
│       ├── Input.test.tsx         ✅ 3 testes
│       ├── FeatureCard.test.tsx   ✅ 4 testes
│       └── InfoCard.test.tsx      ✅ 2 testes
└── pages/
    └── tests/
        ├── DashboardPage.test.tsx             ✅ 6 testes
        ├── LoginPage.test.tsx                 ✅ 8 testes
        ├── VolunteersPage.test.tsx            ✅ 8 testes
        ├── VolunteerRegistrationPage.test.tsx ✅ 6 testes
        └── WorkshopsPage.test.tsx             ✅ 8 testes
```

**Total: 54 testes automatizados**