# The Daily Planet 🚀

A space-themed MERN application built on NASA's open APIs. Browse the Astronomy
Picture of the Day, speak to an AI chatbot for space-related questions, track the ISS, astroids and objects in the sky near you.

## Features

- **Astronomy Picture of the Day (APOD)** — NASA's daily image or video on the
  homepage, with caching so it loads fast and stays resilient if NASA is busy
- **AI-generated facts** — interesting facts about the day's picture
- **User Profile** — User's an access their own profile page to view amend or delete their details
- **Favourites** — logged-in users can save pictures to their collection and
  view them on a dedicated favourites page
- **User accounts** — signup and login with JWT authentication
- **Chatbot** — Users can ask space related questions to a GEMINI AI, any non-space related questions will not be answered
- **ISS Tracker** — a global map showing the location of the ISS, with location services to advise how far away the user is from the ISS.
- **Asteroid Tracker** —


## Structure

This repo contains two applications that run separately and communicate over
HTTP:

- `frontend/` — a React app (Vite)
- `api/` — a backend Express server, with MongoDB (Atlas)

## Card wall

https://trello.com/invite/b/6a392ebbe3207603b6f41b7f/ATTI07bf07fd00b31a2fb2171db516385e96D33682B5/the-daily-planet

---

## Quickstart

### 1. Use the right version of Node

This project runs on **Node 20**. Using a newer version (e.g. Node 26) causes
the backend to crash on startup with a `SlowBuffer` error from the JWT library.

If you don't have Node Version Manager (NVM):

```
brew install nvm
```

(then follow the instructions to update your `~/.zshrc`, and open a new terminal)

Install and use Node 20:

```
nvm install 20
nvm use 20
```

**Tip:** to avoid switching every time you open a terminal, set it as default:

```
nvm alias default 20
```

### 2. Clone the repo

Every team member clones the repository to their local machine:

```
git clone https://github.com/Humaira-Hossain/the-daily-planet.git
cd the-daily-planet
```

### 3. Install dependencies for both apps

```
cd frontend
npm install
cd ../api
npm install
```

Install an ESLint plugin for your editor, e.g.
[ESLint for VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

---

## Environment variables

You need two `.env` files — one in `frontend`, one in `api`. These are
**gitignored** and must never be committed. Copy from the `.env.example` files
and fill in the values.

### Frontend

Create `frontend/.env`:

```
VITE_BACKEND_URL=http://localhost:3000
```

> **Important:** the variable is `VITE_BACKEND_URL` — not `VITE_API_URL`. Using
> the wrong name makes API calls fail with an "Unexpected token '<'" error,
> because the request goes to the frontend instead of the backend.

### Backend

Create `api/.env`:

```
MONGODB_URL="mongodb://0.0.0.0/daily-planet"
NODE_ENV="development"
JWT_SECRET="secret"
NASA_API_KEY=<your key from https://api.nasa.gov>
GEMINI_API_KEY=<your key from https://aistudio.google.com/api-keys>
```
##Notes:
Each dev and QE needs their own NASA and GEMINI API KEY as above ^
---

## Running the app

You need both servers running, in two terminals. Make sure you're on **Node 20**
in each (`nvm use 20`).

**Terminal 1 — backend:**

```
cd api
npm run dev
```

You should see `Successfully connected to MongoDB` and `Now listening on port 3000`.

**Terminal 2 — frontend:**

```
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

Go to `/signup` to create a user, then `/login` to log in. Once logged in you
can save pictures to your favourites and view them at `/favourites`.

---

## Running the tests

**Backend** (Jest), from the `api` directory:

```
npm test                  # run the tests
npx jest --coverage       # with a coverage report
```

**Frontend** (Vitest), from the `frontend` directory:

```
npm test                  # run the tests
npx vitest run --coverage # with a coverage report
```

---

## Troubleshooting

A few issues the team has hit, and their fixes:

- **Backend crashes with a `SlowBuffer` / `prototype` error on startup** — you're
  on the wrong Node version. Run `nvm use 20`.
- **`EADDRINUSE: address already in use :::3000`** — another backend is already
  running on port 3000. Free it with `lsof -ti:3000 | xargs kill -9`, then
  start again.
- **"Unexpected token '<' ... is not valid JSON" in the browser** — the frontend
  can't reach the backend. Check `VITE_BACKEND_URL` is set correctly in
  `frontend/.env` (not `VITE_API_URL`), and **restart Vite** after changing it
  (env vars are only read at startup).
- **"Failed to fetch"** — the backend isn't running, isn't reachable, or crashed.
  Check the `api` terminal is up and connected to MongoDB.
-**Creating new user issue - trying to signup with a password that doesn't fit the requirements still saved
the user to the database.
-**

---

## Team

Built by a team of 5 software developers and 2 QEs — Makers apprenticeship final
project.

Amy Holland - dev
Bethany Carter-Daniels - QE
Brian Kartey - dev
Cheryl Lee - QE
Humaira Hossain - dev
Nayna Mittu - dev
Rebecca Savage - dev
Toby Edwards Rean - dev

## Acknowledgements

- NASA Open APIs — https://api.nasa.gov
- Imagery courtesy of NASA/JPL-Caltech

-Open Notify ISS location - http://api.open-notify.org/iss-now.json (free, no key needed)
-Open Notify astronauts - http://api.open-notify.org/astros.json (free, no key needed)
-OpenStreetMap via Leaflet - free map tiles

- GEMINI Open APIs - https://aistudio.google.com/api-keys
- ISS
- Asteriod tracker
  -AstronomyAPI - sign up required: https://astronomyapi.com/auth/sign-in
- AstronomyAPI key- saved in api/.env as: "ASTRONOMY_ID" and "ASTRONOMY_SECRET"


## Original
- https://github.com/Humaira-Hossain/the-daily-planet 