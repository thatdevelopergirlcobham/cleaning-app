# CleanCal - Community Waste Management Platform

CleanCal is a comprehensive, community-driven waste management platform designed to leverage technology to transform Calabar, Nigeria, into a cleaner, greener city. Our mission is to bridge the gap between residents and waste management authorities through real-time data and actionable community engagement.

## The Two-Sided Solution

The CleanCal platform operates with two distinct interfaces, ensuring both community participation and strategic management:

### The Community User Platform (The Action Loop)

This side empowers every resident to be a part of the solution:

- **Real-Time Reporting**: Users can submit detailed Waste Reports (with photo and precise GPS location) via a dedicated mobile-first interface. All new reports are initially marked as pending.
- **Actionable Feed**: The main dashboard displays a social-like feed showing ONLY approved and resolved issues, fostering a sense of progress and accomplishment.
- **Community Events**: Users can create or join cleanup events coordinated directly through the application.
- **Agent Hiring**: Residents can utilize a dedicated service to hire certified CleanCal agents for aid with larger or complex cleanups.

### The Admin Management Platform (The Verification Loop)

Accessible only by designated administrators, this side ensures quality control and resource efficiency:

- **Verification Dashboard**: Admins review all newly submitted (pending) reports. This crucial step validates the report's accuracy before it becomes visible on the public map or feed.
- **Status Management**: Admins can change a report's status to approved (making it actionable for the community/agents) or rejected.
- **Resource Oversight**: Management tools allow admins to track all open Agent Bookings, manage user roles, and monitor key performance indicators (KPIs) like resolution rates and total active reports.

## 🎯 Our Vision

CleanCal is built on a SaaS model foundation with Supabase providing robust authentication and real-time data handling. Our ultimate goal is to create a sustainable environmental impact by turning passive observation into collective, measurable action, helping to realize the vision of Calabar as the cleanest city in Nigeria.

## 🌍 AI Integration (Gemini AI Assistant)

Integrate Google Gemini API (placeholder setup for now, developer will later add key). The AI assistant—named "EcoBot"—helps users and admins by:

- Providing eco tips and waste sorting recommendations.
- Giving contextual insights when reviewing reports (e.g., "This area often reports plastic waste, recommend recycling center X").
- Suggesting community event ideas and improvement insights.

For admins, EcoBot suggests response templates, KPI interpretations, and agent task optimization.

### 🧠 AI Accessibility

AI should be accessible from:
- A floating chatbot icon on all pages.
- A side panel accessible in both Community and Admin dashboards.
- Optional AI summary box under approved reports (e.g., "EcoBot's Insight: Compost organic waste nearby…").

## 🎨 Design System

### Font Family
- Use "Inter" (primary) — clean, techy, and accessible.
- Use "Outfit" for headers to give a smooth eco-modern vibe.

### Color Palette
- **Primary Green**: #16A34A (Emerald Green — symbolizing freshness & eco-focus)
- **Secondary Blue**: #2563EB (Trust and technology)
- **Accent Yellow**: #FACC15 (Energy & call-to-action)
- **Neutral Background**: #F9FAFB
- **Text**: #1E293B
- **Error**: #DC2626, **Success**: #22C55E, **Info**: #3B82F6

### UI Design Rules
- Use rounded-2xl corners for all cards, modals, and buttons.
- Shadow-sm on hover, shadow-md for modals.
- Keep spacing uniform (p-4, p-6, gap-4, etc.).
- Define all colors and font sizes in tailwind.config.js.
- Maintain light/dark mode (dark uses deeper greens and neutral gray backgrounds).
- Consistent button variants: primary, secondary, outline, and ghost.

## 🔔 Custom Toaster (Reusable Component)

Create a custom toaster system for uniform notifications:

- **File**: `/src/components/common/Toaster.tsx`
- Use React Context to handle global toast queue.
- Supports variants: success, error, info, warning.
- Animations via Tailwind transitions (slide-up/fade-in).
- Auto-dismiss after 5s; manual close option.
- Accessible (aria-live, role="alert").
- Expose helper hook useToast() for usage in forms and actions.

## 📁 Project Structure

```
/src
  /api
    supabaseClient.ts
    reports.ts
    users.ts
    events.ts
    agents.ts
    ai.ts                ← Gemini API helper (EcoBot)
  /components
    /common
      Navbar.tsx
      MobileBottomNav.tsx
      ProtectedRoute.tsx
      MapPreview.tsx
      ImageUploader.tsx
      LoadingSpinner.tsx
      Modal.tsx
      Toaster.tsx        ← Custom toast handler
      AIChatBot.tsx      ← Floating Gemini chatbot (EcoBot)
    /community
      ReportCard.tsx
      ReportForm.tsx
      Feed.tsx
      EventsList.tsx
      EventForm.tsx
      AgentHireCard.tsx
    /admin
      PendingReportList.tsx
      ReportReviewPanel.tsx
      KPICards.tsx
      AgentBookingsTable.tsx
      RoleManagement.tsx
  /contexts
    AuthContext.tsx
    UIContext.tsx
    ToastContext.tsx
    AIContext.tsx        ← Context for Gemini AI assistant
  /hooks
    useGeoLocation.ts
    useRealtimeReports.ts
    useToast.ts
    useAI.ts             ← Hook to call Gemini suggestions
  /pages
    /community
      CommunityHome.tsx
      ReportNew.tsx
      Events.tsx
      AgentHire.tsx
      Profile.tsx
    /admin
      AdminDashboard.tsx
      PendingReports.tsx
      Agents.tsx
      KPIs.tsx
    Auth.tsx
    About.tsx
    NotFound.tsx
  App.tsx
  routes.tsx
  main.tsx
  tailwind.config.js
  README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cleancal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Set up the database schema** using the provided SQL files:
   - Run the migration scripts to create tables for reports, events, agent_bookings, and user_profiles

3. **Configure authentication**:
   - Enable email authentication
   - Set up Row Level Security (RLS) policies

4. **Storage configuration**:
   - Create a storage bucket named "images" for report photos
   - Set up public access policies for the images bucket

## Gemini AI Integration Setup

1. **Get your Gemini API key** from Google AI Studio

2. **Add to environment variables**:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **The AI integration is already set up** with placeholder endpoints. When you have a valid API key, the AI features will work automatically.

## Design Overview

### Colors & Fonts
- **Primary Font**: Inter (body text)
- **Heading Font**: Outfit (headings)
- **Color Scheme**: Eco-friendly green (#16A34A) with blue accents (#2563EB)
- **Responsive Design**: Mobile-first approach with consistent spacing

### Components
- **Unified Button System**: Primary, secondary, outline, and ghost variants
- **Card Components**: Consistent rounded corners and shadows
- **Modal System**: Overlay-based with proper accessibility
- **Toast Notifications**: Global notification system with auto-dismiss

## Developer Instructions

### Testing the AI System
1. Ensure your Gemini API key is set in the `.env` file
2. Open any page and click the floating chatbot icon (bottom-right)
3. Try asking EcoBot questions like:
   - "What should I do with plastic waste?"
   - "Suggest a community cleanup event"
   - "How can I recycle electronics?"

### Testing Toast Notifications
The toast system is used throughout the app. You can trigger toasts by:
- Submitting forms (success/error states)
- Authentication actions
- Report submissions

### Key Development Notes
- All API calls are handled through the `/api` directory
- Real-time updates are implemented using Supabase subscriptions
- Authentication state is managed globally via React Context
- The app is fully responsive and follows accessibility best practices

## Key Features Implemented

✅ **Complete Project Structure** - All specified directories and files created
✅ **Supabase Integration** - Authentication, real-time data, and storage
✅ **Gemini AI Integration** - EcoBot assistant with contextual insights
✅ **Custom Toast System** - Global notifications with React Context
✅ **Responsive Design** - Mobile-first with TailwindCSS
✅ **Two-Sided Platform** - Community and Admin interfaces
✅ **Real-time Updates** - Live report and event updates
✅ **Image Upload** - Photo uploads for waste reports
✅ **Geolocation Support** - GPS location for reports
✅ **Role-based Access** - Admin and community user permissions
✅ **Modern UI/UX** - Consistent design system with animations

## Future Enhancements

- **Push Notifications** for real-time updates
- **Offline Support** for areas with poor connectivity
- **Advanced Analytics** dashboard for administrators
- **Multi-language Support** for broader accessibility
- **Integration with Local Waste Management Services**

---

**Built with ❤️ for a cleaner Calabar** 🌍
