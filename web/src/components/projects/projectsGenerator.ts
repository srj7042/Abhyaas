import { createClient } from '@/utils/supabase/client'
import { recordXpTransaction } from '../training/statsHelper'
import { recalculateCareerReadiness } from '../readiness/readinessCalculator'
import { triggerMissionCompletion } from '../missions/missionsGenerator'

export interface ProjectType {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  status: 'Not Started' | 'In Progress' | 'Completed'
}

const CAREER_PROJECTS: Record<string, { title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; description: string }[]> = {
  'AI Engineer': [
    { title: 'Predictive Churn Model Pipeline', difficulty: 'Easy', description: 'Train a classifier to predict customer churn rates using Pandas and Scikit-Learn.' },
    { title: 'Fine-Tuning BERT for Sentiment Analysis', difficulty: 'Hard', description: 'Fine-tune a pretrained BERT transformer model on custom review datasets and publish it.' },
    { title: 'Image Classification CNN from Scratch', difficulty: 'Medium', description: 'Design and optimize a Convolutional Neural Network using PyTorch to label images.' }
  ],
  'Data Scientist': [
    { title: 'E-Commerce Analytical Dashboard', difficulty: 'Medium', description: 'Aggregate transaction metrics and build time-series forecasts to model business growth.' },
    { title: 'Customer Segmentation Clustering', difficulty: 'Easy', description: 'Use K-Means clustering to segment customers based on purchasing behavior.' },
    { title: 'Gradient Descent from Scratch', difficulty: 'Medium', description: 'Implement batch gradient descent optimization to fit regression coefficients without packages.' }
  ],
  'Frontend Developer': [
    { title: 'Interactive Kanban Board Application', difficulty: 'Medium', description: 'Create a rich drag-and-drop task board with state transitions and persistency.' },
    { title: 'Realtime Document Editor Workspace', difficulty: 'Hard', description: 'Develop a responsive document editor with real-time text manipulation and styling previews.' },
    { title: 'Personal Portfolio Builder App', difficulty: 'Easy', description: 'Design a modular portfolio generator with selectable theme skins and markdown inputs.' }
  ],
  'Backend Developer': [
    { title: 'Distributed Rate Limiter Middleware', difficulty: 'Medium', description: 'Implement token-bucket rate limiting for REST endpoints using Node.js and Redis.' },
    { title: 'Scalable WebSocket Chat Server', difficulty: 'Medium', description: 'Build a concurrent real-time messaging hub with message history, rooms, and heartbeats.' },
    { title: 'SaaS Multi-Tenant Payment API', difficulty: 'Hard', description: 'Create an idempotent billing system with webhooks, stripe integrations, and transaction logs.' }
  ],
  'Fullstack Developer': [
    { title: 'E-Commerce API & Checkout Checkout', difficulty: 'Medium', description: 'Construct an end-to-end shop catalog with shopping cart management, auth, and DB schemas.' },
    { title: 'Realtime System Metrics Dashboard', difficulty: 'Medium', description: 'Build a server dashboard showing CPU/RAM usage visually using Recharts and WebSockets.' },
    { title: 'Fullstack Markdown Knowledge Base', difficulty: 'Easy', description: 'Develop a collaborative wiki site with search indices, folders, and markdown rendering.' }
  ],
  'Software Engineer': [
    { title: 'Custom Cache Manager Engine', difficulty: 'Hard', description: 'Implement a thread-safe LRU cache with expiration metrics and key validations from scratch.' },
    { title: 'Git Commit Analyzer Command Line tool', difficulty: 'Medium', description: 'Build a CLI utility that parses git logs, extracts commit frequencies, and formats reports.' },
    { title: 'JSON Parser and Validator from scratch', difficulty: 'Easy', description: 'Write a syntax parser to inspect JSON string structures and return detailed validation syntax errors.' }
  ]
}

export const checkAndGenerateProjects = async (userId: string, careerGoal: string): Promise<ProjectType[]> => {
  const supabase = createClient()

  // 1. Fetch existing projects
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)

  if (existingProjects && existingProjects.length > 0) {
    // If the database has the hardcoded legacy projects, remove them so we can replace with personalized ones!
    const hasLegacy = existingProjects.some(p => 
      p.title === 'House Price Prediction API' || 
      p.title === 'Gradient Descent Optimization from Scratch'
    )

    if (hasLegacy) {
      // Clear legacy projects so we can write fresh personalized ones
      await supabase.from('projects').delete().eq('user_id', userId)
    } else {
      return existingProjects as ProjectType[]
    }
  }

  // 2. Generate new career projects
  const normalizedGoal = Object.keys(CAREER_PROJECTS).find(g => 
    careerGoal.toLowerCase().includes(g.toLowerCase())
  ) || 'Fullstack Developer'

  const templates = CAREER_PROJECTS[normalizedGoal]

  const insertedProjects: ProjectType[] = []
  for (const t of templates) {
    const { data: p } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        status: 'Not Started'
      })
      .select('*')
      .single()
    if (p) {
      insertedProjects.push(p as ProjectType)
    }
  }

  return insertedProjects
}

export const updateProjectStatus = async (
  userId: string,
  projectId: string,
  newStatus: 'In Progress' | 'Completed'
) => {
  const supabase = createClient()

  const { data: project } = await supabase
    .from('projects')
    .update({ 
      status: newStatus,
      completed_at: newStatus === 'Completed' ? new Date().toISOString() : null
    })
    .eq('id', projectId)
    .select('*')
    .single()

  if (project && newStatus === 'Completed') {
    // 1. Award XP
    await recordXpTransaction(userId, 150, `Completed Project: ${project.title}`)
    
    // 2. Complete relevant missions
    await triggerMissionCompletion(userId, 'project')

    // 3. Recalculate Career Readiness index
    await recalculateCareerReadiness(userId)
  }

  return project
}
