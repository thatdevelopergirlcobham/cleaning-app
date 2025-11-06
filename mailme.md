# CleanCal Summary

- Features
  - User auth (email/password), 3-hour session persistence
  - Report waste issues (create, view, manage), image upload
  - Reports map with search, closest filter, directions link, route draw
  - My Reports manager (CRUD)
  - Hire cleaners with date (no Sundays) and time (09:00-17:00) validation
  - Location picker: current location + Nominatim search
  - Admin dashboard with stats, members list (delete), pending reports
  - Admin collapsible sidebar (navigation)
  - Notifications scaffold and toasts
  - Profile page (view/update)
  - AI chat assistant with history (auth only), expand/minimize/clear
  - Refresh controls on HomeTau and Admin dashboard

- API Endpoints
  - Cloudinary upload: https://clean-cal-api.vercel.app/upload
  - Gemini (Google GenAI): https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
  - CleanCal AI Agent: https://cleancal-ai.vercel.app/ask-agent

- Supabase
  - Uses Supabase for Auth and Database (Postgres + RLS)
  - REST calls use anon key via headers; client via supabase-js
  - AI chat persists to table: public.ai_chat_messages

- Admin Panel
  - Login route: /admin/login
  - Routes: /admin, /admin/reports, /admin/agents, /admin/analytics
