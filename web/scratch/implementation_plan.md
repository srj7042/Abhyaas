# Dynamic Roadmap & Personalization — Implementation Plan

Fix all hardcoded and non-functional content in Roadmap, Tutor, Daily Missions, Career Readiness, and Projects panel by integrating them with dynamic database mutations and calculations.

---

## Proposed Changes

### 1. Continue Lesson & Tutor Integration
- **Dashboard Action**: When "Continue Lesson" is clicked, it routes to `/tutor`.
- **Tutor Component** ([tutor/page.tsx](file:///Users/surajjaiswal/Abhyaas-main/web/src/app/(dashboard)/tutor/page.tsx)):
  - Automatically queries the active roadmap and extracts the module currently set to `In Progress` (fallback to first module in order).
  - Queries Gemini AI API `/api/ai` to generate real learning context, explanations, analogies, and quizzes based on the module title and career goal.
  - Implements a functional "Mark as Completed" action that:
    1. Updates the module status to `Completed` in Supabase.
    2. Finds the next locked module and updates it to `In Progress`.
    3. Awards `+100 XP` via database transaction logs.
    4. Triggers daily mission completion.
    5. Syncs the career readiness index.

### 2. Personalized Daily Missions
- **Generator Utility** ([missionsGenerator.ts](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/missions/missionsGenerator.ts)):
  - Automatically runs when dashboard or missions page mounts and finds 0 user missions.
  - Generates 3 personalized missions targeting: active module topic, a weak area/mistake topic, and general training exercises.
  - Connects the "Start" button to the respective route (`/tutor`, `/training`, `/projects`).
  - Connects "Claim XP" button to execute real `xp_transactions` inserts and mark status as `claimed` in Supabase.

### 3. Dynamic Projects Assignments
- **Projects Utility** ([projectsGenerator.ts](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/projects/projectsGenerator.ts)):
  - Replaces hardcoded project assignments with a dynamic portfolio of 3 projects customized to the user's `target_career` when a roadmap is created or loaded.
  - Connects the **Start**, **Continue**, and **Complete** actions to Supabase mutations.
  - Completing a project inserts a `+150 XP` transaction, marks completion in DB, and runs Career Readiness recalculation.

### 4. Career Readiness Calculation
- **Calculator Utility** ([readinessCalculator.ts](file:///Users/surajjaiswal/Abhyaas-main/web/src/components/readiness/readinessCalculator.ts)):
  - Computes readiness based on: Skill Mastery (mastered skills ratio), Assessments (accuracy in training), Project Evidence (completed projects ratio), Consistency (streaks), and Interview Readiness (roadmap module progress).
  - Updates the `career_readiness` Supabase table and runs dynamically when Career Readiness or Dashboard page loads.

---

## Verification Plan

### Build Check
- Run `npm run build --webpack` to ensure zero compilation or compilation warnings.

### Manual Verification
- [ ] Clicking "Continue Lesson" correctly redirects and loads Tutor active module.
- [ ] Tutor page displays dynamic content for active module (via Gemini or fallbacks).
- [ ] Daily missions show personalized topics.
- [ ] Start buttons under daily missions link to correct pages.
- [ ] Claim XP inserts a database record and updates header.
- [ ] Projects panel loads career-customized projects.
- [ ] Completing a project updates readiness score in radar chart.
- [ ] Light and Dark mode contrast tests.
