# LearnedUp

# LearnedUo

LearnedUo is a full-stack learning platform with a Node.js/Express backend and a Vite + React frontend.

## Project Structure

- `backend/` - API server, authentication, AI, history, and transcript routes
- `Frontend/` - React application built with Vite

## Requirements

- Node.js 18 or newer
- npm
- MongoDB connection string
- Google AI API key

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd LearnedUo
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

## Environment Setup

Create a local environment file in `backend/` based on `backend/example.env`.

Example:

```env
PORT=4500
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
GEMANI_API_KEY=your_google_ai_key
```

Important:

- Do not commit `backend/.env`
- Use `backend/example.env` as the template
- Keep secrets local only

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:4500` by default from the example env file, or on the port set in `PORT`.

### Start the frontend

```bash
cd Frontend
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Available Scripts

### Backend

- `npm run start` - start the server
- `npm run dev` - start the server with nodemon

### Frontend

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run test` - run tests with Vitest
- `npm run preview` - preview the production build

## How to Contribute

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Create a new branch for your change.
4. Make your changes and test them.
5. Commit and push the branch to your fork.
6. Open a pull request to the main repository.

### Suggested git flow

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Describe your change"
git push origin feature/your-feature
```

## How to Fork, Push, and Merge

### Fork

- Open the repository on GitHub
- Click **Fork** to create your own copy

### Push

After making changes locally, push them to your fork:

```bash
git push origin your-branch-name
```

### Merge

There are two common ways to merge changes:

#### 1. Merge through a pull request

- Push your branch to your fork
- Open a pull request from your branch into the main repository
- After review, the maintainer merges it

#### 2. Merge locally with git

If you are combining branches on your own machine:

```bash
git checkout main
git pull origin main
git merge your-branch-name
```

If you are working from a fork, you may also need to add the original repository as an upstream remote:

```bash
git remote add upstream <original-repo-url>
git fetch upstream
git merge upstream/main
```

## Notes

- Keep API keys and database credentials out of version control
- Check `backend/example.env` before starting the server
- If the frontend cannot reach the backend, confirm `FRONTEND_URL` and `PORT` match your local setup
