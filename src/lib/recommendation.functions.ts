import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().split("T")[0];
    const { data: foodLogs } = await supabase
      .from("food_logs")
      .select("food_name, calories, protein, carbs, fats, logged_at")
      .eq("user_id", userId)
      .gte("logged_at", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
      .order("logged_at", { ascending: false })
      .limit(20);

    const { data: weightHistory } = await supabase
      .from("weight_history")
      .select("weight_kg, logged_at")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(7);

    const API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.warn("No AI API keys configured. Returning simulated Indian diet recommendations.");
      const mockResult = {
        summary: "Based on your South Indian fitness goal of maintaining a healthy body index, your diet shows balanced carbohydrates, but could benefit from a structured increase in clean plant proteins like lentils and fiber-rich local grains.",
        daily_targets: {
          calories: 2100,
          protein_g: 75,
          carbs_g: 280,
          fats_g: 65,
          fiber_g: 30,
          water_ml: 2500
        },
        recommendations: [
          {
            category: "meal_plan",
            title: "Introduce High-Protein Breakfasts",
            description: "Shift towards Sprouts Salad, Moong Dal Chilla, or high-protein Idli made from ragi/oats to kickstart protein synthesis in the morning.",
            priority: "high"
          },
          {
            category: "habit",
            title: "Hydration Balance",
            description: "Drink 500ml water 30 minutes before main meals to aid digestion and optimize satiety levels.",
            priority: "medium"
          },
          {
            category: "substitution",
            title: "Refined Carb Substitution",
            description: "Swap conventional white rice during lunch with brown rice, Kerala matta rice, or foxtail millet.",
            priority: "high"
          },
          {
            category: "exercise",
            title: "Post-Meal Walking",
            description: "Incorporate a brisk 15-minute walk after dinner to improve insulin sensitivity and support digestion.",
            priority: "medium"
          }
        ],
        meal_plan: {
          breakfast: "Ragi Dosa or Oats Idli served with vegetable sambar and mint chutney (protein & fiber boost)",
          lunch: "Brown rice, mixed vegetable curry, thick dal tadka, and a bowl of fresh curd",
          dinner: "Two multigrain rotis, palak paneer (topped with minimal oil), and cucumber raita",
          snacks: ["A handful of roasted chana or almonds", "Green tea with freshly squeezed lemon"]
        },
        healthier_alternatives: [
          {
            current: "Refined White Rice",
            alternative: "Foxtail Millet / Matta Rice",
            reason: "Provides a lower glycemic index, preventing sudden blood sugar spikes and offering more sustained dietary fiber."
          },
          {
            current: "Deep Fried Snacks (Samosa/Pakora)",
            alternative: "Roasted Makhana / Boiled Sprouts Chat",
            reason: "Reduces saturated fat intake significantly while adding rich source of calcium and plant-based protein."
          }
        ]
      };
      return { recommendations: mockResult };
    }

    const prompt = `You are an expert Indian nutritionist and dietician. Based on the user's profile and recent eating habits, provide personalized dietary recommendations.

User Profile:
${profile ? JSON.stringify({
  age: profile.age,
  gender: profile.gender,
  weight_kg: profile.weight_kg,
  height_cm: profile.height_cm,
  fitness_goal: profile.fitness_goal,
  activity_level: profile.activity_level,
  target_weight_kg: profile.target_weight_kg,
}) : "No profile set yet"}

Recent Food Log (last 7 days, up to 20 entries):
${JSON.stringify(foodLogs || [])}

Recent Weight History (last 7 entries):
${JSON.stringify(weightHistory || [])}

Provide a JSON response with this exact structure:
{
  "summary": "2-3 sentence overview of the user's current diet and progress",
  "daily_targets": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number,
    "fiber_g": number,
    "water_ml": number
  },
  "recommendations": [
    {
      "category": "meal_plan|habit|substitution|exercise",
      "title": "Short title",
      "description": "Detailed recommendation with specific Indian/South Indian food suggestions",
      "priority": "high|medium|low"
    }
  ],
  "meal_plan": {
    "breakfast": "Suggested breakfast with Indian options",
    "lunch": "Suggested lunch with Indian options",
    "dinner": "Suggested dinner with Indian options",
    "snacks": ["snack 1", "snack 2"]
  },
  "healthier_alternatives": [
    {
      "current": "Common unhealthy choice",
      "alternative": "Healthier Indian alternative",
      "reason": "Why this is better"
    }
  ]
}

Return ONLY valid JSON, no markdown, no extra text. Focus on practical, culturally relevant Indian and South Indian food recommendations.`;

    let content = "";

    if (process.env.AI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a nutrition expert. Always respond with valid JSON only." },
            { role: "user", content: prompt },
          ],
          max_tokens: 2048,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI gateway error: ${response.status} - ${text}`);
      }

      const result = await response.json();
      content = result.choices?.[0]?.message?.content || "";
    } else {
      // Direct official Google Gemini REST API call
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${text}`);
      }

      const result = await response.json();
      content = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      const match = jsonStr.match(/```(?:json)?\n?([\s\S]*?)```/);
      if (match) jsonStr = match[1].trim();
    }

    try {
      const recommendations = JSON.parse(jsonStr);
      return { recommendations };
    } catch {
      const braceStart = jsonStr.indexOf("{");
      const braceEnd = jsonStr.lastIndexOf("}");
      if (braceStart >= 0 && braceEnd > braceStart) {
        const recommendations = JSON.parse(jsonStr.slice(braceStart, braceEnd + 1));
        return { recommendations };
      }
      throw new Error("Could not parse AI recommendation response");
    }
  });
