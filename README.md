# AI-Powered Health & Nutrition Analyzer

A modern, comprehensive web application designed to help users track dietary logs, hydration levels, and weight metrics seamlessly. Equipped with active state dashboards, customized meal plans, and intelligent speech recognition, maintaining wellness has never been easier or more interactive.

## ✨ Core Features

*   🎙️ **Hands-Free AI Voice Logger:** Tap the microphone icon or use shortcuts to speak naturally (e.g., *"I had 2 idlis and masala dosa for breakfast"* or *"drank 500ml water"*). The app leverages the **Web Speech API** to capture speech and parses it into precise macros, hydration amounts, or weigh-in metrics using the **Gemini API**.
*   📊 **Interactive Health Dashboard:** Monitor target daily calories, protein, carbs, and fats. Watch your fluid intake dynamically increase and observe real-time progress.
*   ⚖️ **BMI & Weight Progress Tracker:** Record weight changes over time to calculate your Body Mass Index (BMI) instantly with responsive target trends.
*   🥗 **Smart Meal Recommendations:** Receive customized, healthy breakfast, lunch, and dinner suggestions aligned with your physical profiles and macro requirements.
*   💾 **Synced Database Integration:** Securely records user metrics, health parameters, and food logs for daily, seamless history retrieval.

## 🛠️ Technical Architecture

*   **Frontend:** React 18+, Vite, TypeScript, and Tailwind CSS.
*   **Animations:** Smooth state additions and slide-overs powered by `motion` React.
*   **Routing & State:** TanStack React Start, React Query.
*   **Database & Auth:** Supabase Client/Auth middlewares.
*   **Natural Language Processing:** Integration with Gemini AI Models for structural semantic parsing.
*   **Speech Input:** Native browser Web Speech API (`SpeechRecognition`).
