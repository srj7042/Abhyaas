# Abhyaas: Personalized AI Learning Path Recommender

Abhyaas is a highly personalized, AI-powered educational assistant and learning path recommender. Designed to guide students and professionals to their career goals, it leverages **Next.js (App Router)**, **React**, **Tailwind CSS**, **Supabase (Auth & Database)**, and the **Google Gemini API** (`gemini-3.6-flash`).

---

## 🌟 Key Features

- **AI-Powered Learning Roadmaps**: Generates custom, step-by-step career learning paths based on the user's career goals and current skill set.
- **Multiple Tutoring Modes**:
  - **Explain Concept**: Simple breakdown of concepts, relatable analogies, and key takeaways.
  - **Socratic Dialogue**: Prompts students with questions to guide them to answers, instead of giving them the solution outright.
  - **Mini-Exams**: Quick quizzes to test competency retention.
  - **Technical Interview Simulator**: Simulates real-world interviewer questions tailored to the student's career target.
  - **Bug Hunter**: Real-time code debugger to help spot issues.
  - **Flashcards & Revision**: Active recall system for review.
  - **Career Mentor**: Recommends practical project focuses to build a strong developer portfolio.
- **Gamified Progress Tracking**: Earn XP upon completing lessons, unlock next-level roadmap milestones, and track overall readiness.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons, Recharts (for analytics and progress diagrams)
- **Backend & Database**: Next.js Serverless API routes, Supabase PostgreSQL, Supabase Auth, Supabase SSR
- **Generative AI**: Google Gemini API via `@google/genai` sdk

---

## 📁 Project Structure

```
├── supabase/               # Supabase Database Migrations & Schemas
├── web/                    # Next.js Web App
│   ├── public/             # Static Assets
│   ├── src/
│   │   ├── app/            # App Router (pages, api routes)
│   │   │   ├── (auth)/     # Authentication Layout & Pages
│   │   │   ├── (dashboard)/# Student Dashboard & Tutor Console
│   │   │   ├── api/ai/     # Gemini AI API endpoint with CORS
│   │   │   ├── globals.css # Global Styles
│   │   │   └── page.tsx    # Landing Page
│   │   ├── components/     # UI Components (Missions, Training Stats, Games)
│   │   └── utils/          # Client & Server Supabase helpers
│   ├── package.json        # Next.js Dependencies
│   └── tsconfig.json       # TypeScript Configuration
├── .gitignore              # Git Ignore File
├── .env.example            # Environment variables template
└── README.md               # Documentation
```

---

## ⚙️ Environment Variables

Copy `.env.example` to create `.env.local` inside the `web` folder:

```bash
cp .env.example web/.env.local
```

Fill in the parameters:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=your-database-connection-string
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
NEXT_PUBLIC_DEMO_PASSWORD=demopassword
```

---

## 🚀 Local Setup

Follow these steps to run the application locally.

### 1. Install Dependencies
Navigate into the `web` directory and install the packages:
```bash
cd web
npm install
```

### 2. Database Migrations (Supabase)
Apply migrations or configure your remote Supabase instance. Under `supabase/migrations/`, find the database schemas and run them inside your Supabase SQL editor or CLI.

### 3. Run the Development Server
Launch the Next.js development server:
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔌 API Documentation

### Gemini AI Generation Endpoint
- **URL**: `/api/ai`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "prompt": "Your custom prompt for Gemini"
  }
  ```
- **Response**:
  ```json
  {
    "response": "Generated content text..."
  }
  ```
- **CORS Handling**: Ready for external clients. Includes preflight `OPTIONS` support and header configurations (`Access-Control-Allow-Origin: *`).

---

## 🌐 Deployment Instructions

### Frontend & API (Vercel)
1. Push your codebase to a private/public GitHub repository (ensure `.env.local` is **not** committed).
2. Create a new project in [Vercel](https://vercel.com).
3. Connect your repository and select the `web` folder as the root directory.
4. Add the environment variables from your `.env.local` to the Vercel project settings.
5. Click **Deploy**.

### Database (Supabase)
1. Setup a project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and apply schemas from the `supabase/migrations` folder.
3. Link your Supabase project credentials to the Vercel environment variables.

### Live Demo URL Placeholder
- **Live Site**: `https://abhyaas-demo-placeholder.vercel.app`
