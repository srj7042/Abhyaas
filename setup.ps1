$BackendDir = "backend"
$FrontendDir = "frontend"

$GeminiService = @"
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateLearningRoadmap = async (goal: string, skills: string[]) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const prompt = \`Generate a learning roadmap for the goal: \${goal}. Current skills: \${skills.join(', ')}. Return as JSON.\`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
"@

Set-Content -Path "$BackendDir/src/ai/gemini.service.ts" -Value $GeminiService

$AiController = @"
import { Request, Response } from 'express';
import { generateLearningRoadmap } from '../ai/gemini.service';

export const getRoadmap = async (req: Request, res: Response) => {
  try {
    const { goal, skills } = req.body;
    const roadmap = await generateLearningRoadmap(goal, skills);
    res.json({ success: true, roadmap: JSON.parse(roadmap) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
"@

Set-Content -Path "$BackendDir/src/controllers/ai.controller.ts" -Value $AiController

$AiRoutes = @"
import { Router } from 'express';
import { getRoadmap } from '../controllers/ai.controller';

const router = Router();
router.post('/roadmaps/generate', getRoadmap);

export default router;
"@

Set-Content -Path "$BackendDir/src/routes/ai.routes.ts" -Value $AiRoutes

$EnvExample = @"
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
"@

Set-Content -Path ".env.example" -Value $EnvExample

$DashboardPage = @"
import React from 'react';

export const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold">Target Career</h2>
          <p className="mt-2 text-gray-600">Software Engineer</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold">Overall Progress</h2>
          <p className="mt-2 text-blue-600 font-bold">45%</p>
        </div>
      </div>
    </div>
  );
};
"@

Set-Content -Path "$FrontendDir/src/pages/Dashboard.tsx" -Value $DashboardPage
