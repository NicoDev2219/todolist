# TODOLIST — Frontend React + Vite e backend Fastify

## Requisitos
- Node.js LTS
- MySQL Server

## Banco de dados
1. Execute `backend/schema.sql` no MySQL.
2. Copie `backend/.env.example` para `backend/.env` e preencha a senha do MySQL.

## Iniciar backend
No terminal, na raiz do projeto:
```bash
cd backend
npm install
npm run dev
```

## Iniciar frontend
Abra um segundo terminal na raiz do projeto:
```bash
cd frontend
npm install
npm run dev
```
Acesse o endereço local informado pelo Vite (normalmente http://localhost:5173).

O frontend usa Three.js para renderizar um dinossauro 3D estilizado correndo, com iluminação, cenário futurista e animações. O frontend consome a API local configurada por `VITE_API_URL`.
