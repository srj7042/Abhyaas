# Database & Auth Architecture

## Database: PostgreSQL (via Supabase)

### Row Level Security (RLS)
RLS is strictly enforced on all tables. Users authenticate via JWT (managed by Supabase SSR). The database uses `auth.uid()` to determine access rights, completely isolating data between users.

### Schema Relationships
- **Profiles:** Core identity table, linked to `auth.users` via a PostgreSQL trigger (`handle_new_user`).
- **Data Tables:** `learning_goals`, `roadmaps`, `progress`, `assessments`, `mistakes`, `xp_transactions`. All foreign keyed to `user_id` with `ON DELETE CASCADE`.

### Account Deletion Lifecycle
When a user triggers account deletion:
1. Hard delete on `auth.users`.
2. PostgreSQL `ON DELETE CASCADE` propagates the deletion to `profiles`.
3. The cascade flows down to all relational tables (roadmaps, games, XP, AI chats, simulators), guaranteeing zero orphaned records.
