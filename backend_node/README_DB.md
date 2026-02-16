PostgreSQL setup for backend_node

1) Create a database and set DATABASE_URL in .env (in backend_node/):

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gestion_achat?schema=public"
CLIENT_ORIGIN="http://localhost:3000"
JWT_SECRET="change_me"

2) Install deps and generate client

npm install
npm run prisma:generate

3) Run initial migration

npm run prisma:migrate

4) Start the API

npm run dev

Key endpoints
- POST /api/utilisateurs/register/ { fullName, email, phone?, department?, password }
- POST /api/utilisateurs/login/ { email, password }


