# Abhyaas: Personalized AI Learning Path Recommender

Abhyaas is a highly personalized, AI-powered full-stack learning path recommender that leverages Next.js, React, Tailwind CSS, Supabase (Auth & PostgreSQL), and the Google Gemini API.

---

## Getting Started

Follow these steps to configure and run the application locally.

### 1. Prerequisites
Ensure you have the following installed on your system:
* **Node.js** >= 18.0.0 (Recommended: `v26.5.0` or `v24.8.0`)
* **NPM** >= 9.0.0 (Recommended: `v11.17.0`)
* **Supabase** database instance (local or cloud URL)

---

### 2. Configuration (Environment Variables)
Navigate to the `web` folder and configure your local environment variables:

1. Create a `.env.local` file inside the `web` directory:
   ```bash
   cp .env.example web/.env.local
   ```
2. Populate the environment parameters in `web/.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.
   * `GEMINI_API_KEY`: Your Google Gemini API key.
   * `DATABASE_URL`: Connection string to your PostgreSQL instance.

---

### 3. Installation
Navigate into the `web` directory and install the Node packages:
```bash
cd web
npm install
```

---

### 4. Running the Project

#### Development Server
To launch the Next.js development server with Webpack integration (required to bypass Turbopack worker process permission errors in restricted/sandboxed terminal environments):
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

#### Production Build
To compile and build the application for production using the Webpack builder:
```bash
cd web
npm run build
```

#### Production Start
To start the production server after compilation:
```bash
cd web
npm run start
```
