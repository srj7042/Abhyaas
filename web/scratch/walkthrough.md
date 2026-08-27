# Dynamic Roadmap & Personalization — Walkthrough

All static, mock, and non-functional templates in the Roadmap, Tutor, Daily Missions, Career Readiness, and Projects panel have been fully integrated with dynamic database mutations, calculations, and personalization triggers.

## Build Status

✅ **Next.js Production Build compiles successfully** — Webpack compilation exited with status `0`, resolving all TS type issues.

---

## Files Created

| File | Purpose |
|------|---------|
| [`tutorContent.ts`](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/tutor/tutorContent.ts) | Custom fallback educational content database for common modules (Math & Stats, Python Programming, Optimization, Neural Networks, etc.). |
| [`missionsGenerator.ts`](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/missions/missionsGenerator.ts) | Seeds, reads, and auto-completes dynamic daily missions personalized to the user's active roadmap module and career goals. |
| [`readinessCalculator.ts`](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/readiness/readinessCalculator.ts) | Dynamically computes 5 readiness indices (Skills, Assessments, Projects, Streak, and Progression) and recalculates the overall score. |
| [`projectsGenerator.ts`](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/projects/projectsGenerator.ts) | Automatically clears legacy hardcoded mock projects and seeds a personalized portfolio of 3 projects matching the selected career goal. |

---

## Sections Fixed & Flow Integrations

### 1. Continue Lesson & Tutor Integration
* **Dashboard Action**: Clicking "Continue Lesson" on the dashboard now loads the user's actual active module.
* **Tutor Page** ([`tutor/page.tsx`](file:///Users/surajjaiswal/Abhyaas-main/web/src/app/(dashboard)/tutor/page.tsx)):
  * Automatically fetches and mounts the active module.
  * Queries Gemini AI (`/api/ai`) with detailed prompts to generate custom explanations, analogies, socratic prompts, and mock quizzes.
  * Added a fully functional **Mark Lesson Completed** button that:
    1. Updates the module status in Supabase.
    2. Unlocks the next roadmap module in order (`Locked` -> `In Progress`).
    3. Triggers completion of the "Practice Lesson" daily mission.
    4. Recalculates Career Readiness and inserts a `+100 XP` transaction record.

### 2. Personalized Daily Missions
* **Dynamic Seeding**: If the user has 0 daily missions, the dashboard dynamically seeds 3 personalized missions targeting their active module topic, a weak area, and general practices.
* **Interactive Navigation**: The "Start" buttons under daily missions automatically link to the correct sub-modules (`/tutor` for lessons, `/training` for MCQs, `/projects` for projects).
* **Real Database Claims**: "Claim XP" buttons perform actual database insertions to `xp_transactions` and update the user's profile and progress metrics.

### 3. Dynamic Projects Assignments
* **Personalized Portfolios**: Automatically removes hardcoded baseline projects and generates 3 relevant portfolio projects matching the user's `target_career` (e.g. AI Engineer, Backend Developer, Frontend Developer).
* **Interactive Workspace**: Start, Continue, and Complete actions are fully functional. Completing a project updates its database status, claims `+150 XP`, completes the daily mission, and recalculates readiness.

### 4. Career Readiness Recalculation
* **Dynamic Indexing**: The competency breakdown index and overall radar stats are computed on-the-fly from the user's mastered skills, training accuracy, completed projects, and active streaks.
* **Real-time Synchronization**: Re-syncs the `career_readiness` Supabase table whenever modules or projects are updated.
