-- Seed System Daily Missions
insert into public.daily_missions (id, title, description, xp_reward)
values 
  ('c3d07384-d113-4ceb-a5cf-81ff0768b92b', 'Complete 1 Core Assessment', 'Assessments build career readiness', 100),
  ('e5f07384-d113-4ceb-a5cf-81ff0768b92b', 'Revise 5 Concept Cards', 'Practice via active recall', 50)
on conflict (id) do nothing;
