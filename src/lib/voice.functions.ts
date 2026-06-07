import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const voiceInputSchema = z.object({
  text: z.string().min(1),
});

export const parseVoiceLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => voiceInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { text } = data;
    const API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      console.warn("No AI API keys configured. Returning simulated voice analysis.");

      const lower = text.toLowerCase();
      if (lower.includes("water") || lower.includes("drink") || lower.includes("glass")) {
        // Extract water
        const numMatch = lower.match(/\d+/);
        const amount = numMatch ? parseInt(numMatch[0]) : 250;
        return {
          result: {
            type: "water",
            water_ml: amount,
            summary: `Parsed water intake: ${amount} ml`,
          },
        };
      } else if (lower.includes("weight") || lower.includes("kilo") || lower.includes("kg")) {
        const numMatch = lower.match(/\d+(\.\d+)?/);
        const weight = numMatch ? parseFloat(numMatch[0]) : 70;
        return {
          result: {
            type: "weight",
            weight_kg: weight,
            summary: `Parsed weight entry: ${weight} kg`,
          },
        };
      } else {
        // Default to food
        let foodName = text;
        if (foodName.length > 50) {
          foodName = foodName.substring(0, 47) + "...";
        }
        return {
          result: {
            type: "food",
            food_data: {
              food_name: foodName,
              meal_type: "lunch",
              calories: 350,
              protein_g: 10,
              carbs_g: 50,
              fats_g: 8,
              fiber_g: 3,
              sugar_g: 4,
              sodium_mg: 380,
              notes: `Simulated analysis of: "${text}"`,
            },
            summary: `Parsed food: "${foodName}" (~350 kcal)`,
          },
        };
      }
    }

    const systemPrompt = `You are a helpful nutrition assistant parsing transcripts of spoken voice messages about food, water intake, or body weight.
Your job is to identify the CATEGORY of the spoken message and extract the numbers/parameters into a structured JSON.

We support three categories of logged data:
1. "food": User describes eating a meal, snack, or specific dishes (especially Indian & South Indian like Biryani, Dosa, Idli, Roti, Sambar, and standard global foods).
2. "water": User describes drinking water or beverages (e.g. "I drank a glass of water", "I just had half liter water", "water 500ml").
3. "weight": User describes their daily weight (e.g. "My weight is seventy two kilograms", "Logged weight 68.5", "weight is 80 kg").

If the statement is not about food, water, or weight, classify as "unknown" and write an explanatory user-friendly "summary" message.

Return ONLY a valid JSON object with the following structure:
{
  "type": "food" | "water" | "weight" | "unknown",
  
  // ONLY if type is "food" - estimate reasonable macros based on standard service/dishes
  "food_data": {
    "food_name": "Specific name of the dish or dishes (e.g. 'Idli with Vegetable Sambar', 'Paneer Tikka')",
    "meal_type": "breakfast" | "lunch" | "dinner" | "snack", // make best guess based on time cues or standard dish types
    "calories": number, // total estimated calories
    "protein_g": number, // in grams
    "carbs_g": number, // in grams
    "fats_g": number, // in grams
    "fiber_g": number, // in grams
    "sugar_g": number, // in grams
    "sodium_mg": number, // in milligrams
    "notes": "Brief notes about the ingredients or preparation"
  },

  // ONLY if type is "water"
  "water_ml": number, // estimate if unspecified (e.g., standard "glass" of water is 250, "bottle" is 500, "liter" is 1000)

  // ONLY if type is "weight"
  "weight_kg": number, // parse digits or phonetic numbers like "sixty eight point five" -> 68.5

  // Mandatory overall summary shown to the user on what was scanned/understood
  "summary": "Friendly summary of what we understood, e.g., 'Analyzing 2 Medu Vadas with Butter Chutney' or 'Logged 300ml of fresh water.'"
}

Be intelligent with quantities and Indian foods. For example:
- "Dosa with chutney" means ~320 calories, ~8g protein, ~54g carbs, ~9g fats.
- "Butter chicken with 2 butter naan" means ~900 calories, ~35g protein, ~85g carbs, ~42g fats.
- "Spoke to doctor, feeling good" -> unknown type with summary advising they can speak about logged items.

Return ONLY pure JSON. No backticks. No markdown.`;

    let content = "";

    try {
      if (process.env.AI_API_KEY) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Please parse this spoken text transcript: "${text}"` },
            ],
            max_tokens: 1024,
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          content = result.choices?.[0]?.message?.content || "";
        } else {
          throw new Error("AI gateway failed");
        }
      } else {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: systemPrompt + `\nPlease parse this spoken text transcript: "${text}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          },
        );

        if (response.ok) {
          const result = await response.json();
          content = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          throw new Error("Direct Gemini call failed");
        }
      }

      let jsonStr = content.trim();
      if (jsonStr.startsWith("```")) {
        const match = jsonStr.match(/```(?:json)?\n?([\s\S]*?)```/);
        if (match) jsonStr = match[1].trim();
      }

      try {
        const parsed = JSON.parse(jsonStr);
        return { result: parsed };
      } catch {
        const braceStart = jsonStr.indexOf("{");
        const braceEnd = jsonStr.lastIndexOf("}");
        if (braceStart >= 0 && braceEnd > braceStart) {
          const parsed = JSON.parse(jsonStr.slice(braceStart, braceEnd + 1));
          return { result: parsed };
        }
        throw new Error("Unable to parse voice log JSON output");
      }
    } catch (err) {
      console.error("Gemini Parse Transcribe error:", err);
      // Fallback response inside try/catch so user still gets a result
      return {
        result: {
          type: "unknown",
          summary: `Sorry, we had trouble processing the AI parsing. We heard: "${text}"`,
        },
      };
    }
  });
