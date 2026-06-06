# AI-Powered Health & Nutrition Analyzer

A highly polished, full-stack health and nutrition suite built using **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **TanStack Start**. It features offline-first fallback capabilities, personalized health recommendation generators, real-time BMI calculations, precise weight tracking analytics, and a state-of-the-art **AI Voice-to-Text Speech Input** system powered by Google's Gemini models for effortless health and caloric logging.

---

## 🌟 Key Features

*   🎙️ **AI Voice-to-Text health Logger**: Speak naturally to log food calories, hydration metrics, or tracking weight. Simply dictate: *"I had two idli with sambar"* or *"Drank four hundred ml of water"*, and our integrated Gemini API parsing engine will format, estimate, and log your data securely.
*   🥗 **Smart Food Recs & Nutrition Engine**: Real-time evaluation of daily dynamic macros (Protein, Carbs, Fats, Calories, and Fiber) with interactive South & North Indian database representations.
*   ⚖️ **Interactive Weight & BMI Analytics Dashboard**: Visual progress charts tracking metabolic rates, target projections, and historical analytics.
*   🍲 **Personalized Meal Recommendations**: Dynamic query models recommending specialized diets according to your custom metrics.
*   🔌 **Supabase Dynamic Integration**: Persistent, authenticated synchronization with Supabase DB tables combined with smart offline-ready mock mockups for immediate utility.

---

## 🚀 Technical Architecture & Stack

*   **Frontend**: React 19 (Hooks, Context, Lazy components), Tailwind CSS (Fluid utility grids), Lucide Icons
*   **Routing & Server**: TanStack Start, TanStack React Router, TanStack React Query
*   **Database & Auth**: Supabase (PostgreSQL Schema architecture with offline fallback models)
*   **AI Intelligence**: Gemini 2.5 API via server-side secure endpoints

---

## 📁 Repository Structure

```text
├── src/
│   ├── components/       # Reusable React components (VoiceLogger, Header, Cards)
│   ├── routes/           # Type-safe file-based TanStack routing structure
│   ├── lib/              # AI Speech processing engines and calculations
│   ├── integrations/     # Supabase database client and security interfaces
│   └── App.tsx           # Global state initializations
├── supabase/             # Edge functions, migrations, and database schemas
├── metadata.json         # Platform configuration & microphone permissions
└── package.json          # Node dependency configurations
```

---

## ⚡ Quick Start & Development

### 1. Prerequisite Installations
Make sure to have [Node.js](https://nodejs.org/) installed on your local environment.

### 2. Configure Environment Secrets
Create a `.env` file at the project root matching the values specified in `.env.example`:
```env
GEMINI_API_KEY="Your_Gemini_API_Key"
APP_URL="http://localhost:3000"
```

### 3. Initialize & Launch Development Server
Navigate to the root directory and execution commands:
```bash
# Install NPM dependencies
npm install

# Boot local Vite engine
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) using your web browser to view, interact, and start logging with the voice interface!
