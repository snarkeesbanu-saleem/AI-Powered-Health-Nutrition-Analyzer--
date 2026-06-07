import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera,
  Activity,
  Sparkles,
  Scale,
  Droplets,
  Utensils,
  Brain,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import foodDosa from "@/assets/food-dosa.jpg";
import foodBiryani from "@/assets/food-biryani.jpg";
import foodIdli from "@/assets/food-idli.jpg";
import foodPongal from "@/assets/food-pongal.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriAI — AI-Powered Health & Nutrition Analyzer" },
      {
        name: "description",
        content:
          "Analyze your meals with AI, track nutrition, and get personalized Indian & South Indian diet recommendations.",
      },
      { property: "og:title", content: "NutriAI — AI-Powered Health & Nutrition Analyzer" },
      {
        property: "og:description",
        content:
          "Snap a photo of your meal. Get instant nutrition analysis and personalized Indian diet recommendations.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [user, setUser] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(!!data.user));
  }, []);

  const features = [
    {
      icon: Camera,
      title: "AI Food Recognition",
      description:
        "Snap a photo of any meal and our AI instantly identifies Indian & South Indian dishes with detailed nutrition.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Utensils,
      title: "Nutrition Analysis",
      description:
        "Get complete macros — calories, protein, carbs, fats, fiber, vitamins & minerals for every meal.",
      color: "text-neon-blue",
      bg: "bg-neon-blue/10",
    },
    {
      icon: Brain,
      title: "Personalized Recommendations",
      description:
        "AI-powered meal plans and healthier alternatives tailored to your BMI, goals, and Indian food preferences.",
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
    },
    {
      icon: Activity,
      title: "BMI & Health Metrics",
      description:
        "Track your BMI, daily calorie goals, and weight progress with beautiful charts.",
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      icon: Droplets,
      title: "Water Intake Tracker",
      description: "Stay hydrated with daily water reminders and intake logging.",
      color: "text-neon-blue",
      bg: "bg-neon-blue/10",
    },
    {
      icon: Scale,
      title: "Weight Progress",
      description: "Monitor your weight journey over time and stay motivated toward your target.",
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
  ];

  const sampleFoods = [
    { name: "Masala Dosa", image: foodDosa, calories: "~290", tag: "South Indian" },
    { name: "Chicken Biryani", image: foodBiryani, calories: "~520", tag: "Hyderabadi" },
    { name: "Idli Sambar", image: foodIdli, calories: "~180", tag: "South Indian" },
    { name: "Ven Pongal", image: foodPongal, calories: "~280", tag: "Comfort Food" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; }
          50% { top: 95%; }
        }
      `}</style>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 text-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-neon-blue/20 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column (Hero Content) */}
            <div className="text-left lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                AI-Powered Nutrition for Indian Cuisine
              </div>
              <h1
                className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Understand Your Food,
                <br />
                <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Transform Your Health
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
                Unlock deep insights into your dietary health. Snap a photo of any meal to instantly
                identify South & North Indian dishes, log nutritional stats, and receive custom meal
                recommendations tailored to your BMI.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="lg" variant="outline">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Column (AI Food Recognition Mockup) */}
            <div className="relative lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] rounded-2xl border border-border/60 bg-gradient-to-b from-card to-background p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                    <span className="text-xs font-bold text-foreground tracking-wide font-mono">
                      NutriAI Recognition Engine
                    </span>
                  </div>
                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground font-mono">
                    LIVE_SCAN
                  </span>
                </div>

                {/* Visual scan frame */}
                <div className="relative aspect-square overflow-hidden rounded-xl border border-primary/20 shadow-inner">
                  <img
                    src={foodBiryani}
                    alt="AI Recognition Scanning"
                    className="h-full w-full object-cover select-none"
                    suppressHydrationWarning
                  />
                  {/* Glowing scan overlay line */}
                  <div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_#fbbf24]"
                    style={{
                      animation: "scan 4s ease-in-out infinite",
                      boxShadow: "0 0 16px #fbbf24, 0 0 4px #d97706",
                    }}
                  />

                  {/* Target corner reticles */}
                  <div className="absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-primary rounded-tl-sm opacity-80" />
                  <div className="absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-primary rounded-tr-sm opacity-80" />
                  <div className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-primary rounded-bl-sm opacity-80" />
                  <div className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-primary rounded-br-sm opacity-80" />

                  {/* Recognition overlay chip card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md rounded-lg p-2.5 border border-border flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-[11px] font-bold text-foreground">Chicken Biryani</div>
                        <div className="text-[9px] text-muted-foreground font-mono">
                          Cuisine Match: 98.7%
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      SOUTH_NORTH
                    </span>
                  </div>
                </div>

                {/* Macro analytics strip */}
                <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg bg-secondary/30 p-2 text-center border border-border/30">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Calories
                    </div>
                    <div className="text-xs font-bold text-foreground mt-0.5">520 kcal</div>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-2 text-center border border-border/30">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Protein
                    </div>
                    <div className="text-xs font-bold text-emerald-500 mt-0.5">26.5 g</div>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-2 text-center border border-border/30">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Carbs
                    </div>
                    <div className="text-xs font-bold text-amber-500 mt-0.5">54.0 g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Foods */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <h2
            className="mb-8 text-center text-2xl font-bold text-foreground"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Popular Indian Dishes We Analyze
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sampleFoods.map((food) => (
              <div
                key={food.name}
                className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <div className="aspect-screen sm:aspect-[4/3] overflow-hidden bg-secondary relative">
                  <img
                    src={food.image}
                    alt={food.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    suppressHydrationWarning
                  />
                  <div className="absolute top-2 right-2 rounded-md bg-background/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border/30">
                    {food.tag}
                  </div>
                </div>
                <div className="p-3.5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight line-clamp-1">
                      {food.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      {food.calories} cal / serving
                    </p>
                  </div>
                  <div className="mt-3.5 pt-2 border-t border-border/40 flex justify-between items-center">
                    <span className="text-[10px] text-primary font-bold tracking-tight">
                      Tap to analyze
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-2 text-center text-2xl font-bold text-foreground"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Everything You Need
          </h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            A complete nutrition toolkit powered by AI
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const title = feature.title;
              const isRecognition = title === "AI Food Recognition";
              const isNutrition = title === "Nutrition Analysis";
              const isRecs = title === "Personalized Recommendations";
              const isBMI = title === "BMI & Health Metrics";
              const isWater = title === "Water Intake Tracker";
              const isWeight = title === "Weight Progress";

              return (
                <div
                  key={feature.title}
                  className={`group rounded-xl border border-border/50 bg-card p-5 transition-shadow duration-300 hover:shadow-md hover:border-border/80 flex flex-col justify-between ${
                    isRecognition ? "border-primary/30 bg-primary/[0.02]" : ""
                  }`}
                >
                  <div className="mb-4">
                    <div
                      className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} ${feature.color}`}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {feature.title}
                      {isRecognition && (
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-primary bg-primary/10 rounded">
                          LIVE SCAN
                        </span>
                      )}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>

                  {/* Visual Components for each feature card */}
                  {isRecognition && (
                    <div className="mt-1 overflow-hidden rounded-lg border border-border/30 aspect-[16/9] relative select-none">
                      <img
                        src={foodDosa}
                        alt="Masala Dosa scan"
                        className="h-full w-full object-cover opacity-85"
                        suppressHydrationWarning
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white drop-shadow flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Masala Dosa Match (94.8%)
                      </div>
                    </div>
                  )}

                  {isNutrition && (
                    <div className="mt-1 rounded-lg border border-border/30 bg-secondary/20 p-2.5 space-y-2 select-none">
                      {/* Macro Bar */}
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span>Lentils & Rice</span>
                        <span className="text-emerald-500 font-bold">410 kcal</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: "25%" }} />
                        <div className="bg-emerald-500 h-full" style={{ width: "45%" }} />
                        <div className="bg-amber-500 h-full" style={{ width: "30%" }} />
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[9px] text-center font-mono">
                        <div className="text-primary font-bold">P: 25g</div>
                        <div className="text-emerald-500 font-bold">C: 45g</div>
                        <div className="text-amber-500 font-bold">F: 12g</div>
                      </div>
                    </div>
                  )}

                  {isRecs && (
                    <div className="mt-1 rounded-lg border border-border/30 bg-secondary/15 p-2.5 space-y-2 select-none text-[11px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                        Smart Indian Switch
                      </div>
                      <div className="flex items-center justify-between border border-destructive/20 bg-destructive/5 rounded p-1">
                        <span className="text-muted-foreground line-through">White Parotta</span>
                        <span className="text-destructive font-mono text-[9px] font-bold">
                          HIGH GI
                        </span>
                      </div>
                      <div className="flex items-center justify-between border border-emerald-500/25 bg-emerald-500/5 rounded p-1">
                        <span className="font-medium text-foreground">Multi-grain Chapati</span>
                        <span className="text-emerald-500 font-mono text-[9px] font-bold">
                          BEST MATCH
                        </span>
                      </div>
                    </div>
                  )}

                  {isBMI && (
                    <div className="mt-1 rounded-lg border border-border/30 bg-secondary/20 p-2.5 select-none space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-foreground">Current BMI</span>
                        <span className="text-xs font-black text-emerald-500 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          22.4 (Normal)
                        </span>
                      </div>
                      {/* Gradient Bar indicator */}
                      <div className="relative pt-1.5">
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-emerald-400 to-rose-400 rounded-full" />
                        <div className="absolute top-1 left-[45%] h-2.5 w-2.5 rounded-full bg-foreground border border-background shadow flex items-center justify-center">
                          <div className="h-1 w-1 rounded-full bg-background" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                        <span>18.5 Min</span>
                        <span>24.9 Max</span>
                      </div>
                    </div>
                  )}

                  {isWater && (
                    <div className="mt-1 rounded-lg border border-border/30 bg-secondary/20 p-2.5 select-none space-y-2">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-[10px] text-muted-foreground">Hydration</span>
                        <span className="text-[11px] font-bold text-neon-blue">
                          1,750 / 2,500 ml
                        </span>
                      </div>
                      {/* Cups row */}
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => (
                          <div
                            key={cup}
                            className={`h-5 flex-1 rounded border transition-colors ${
                              cup <= 5
                                ? "bg-neon-blue/25 border-neon-blue/40 text-neon-blue"
                                : "bg-muted/10 border-border/40 text-muted-foreground"
                            } flex items-center justify-center`}
                          >
                            <Droplets className="h-2.5 w-2.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isWeight && (
                    <div className="mt-1 rounded-lg border border-border/30 bg-secondary/20 p-2.5 select-none space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground font-mono">Goal: 65.0 kg</span>
                        <span className="font-extrabold text-foreground font-mono">
                          68.4 kg (-1.2kg)
                        </span>
                      </div>
                      {/* Interactive Weight sparkline mockup wrapper */}
                      <div className="h-8 w-full pt-1 flex items-end">
                        <svg
                          className="w-full h-full text-primary"
                          viewBox="0 0 100 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 25 C10 24, 20 18, 30 19 C40 20, 50 12, 60 14 C70 15, 80 5, 90 6 L100 2"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                          <circle cx="90" cy="5" r="2.5" className="fill-primary animate-ping" />
                          <circle cx="90" cy="5" r="1.5" className="fill-primary" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
          <h2
            className="text-2xl font-bold text-foreground sm:text-3xl"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Ready to Eat Smarter?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Join thousands of users tracking their nutrition with AI-powered insights.
          </p>
          <div className="mt-6">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="gap-2">
                {user ? "Go to Dashboard" : "Start Your Journey"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">AI-powered-Health-Nutrition-Analyzer</p>
      </footer>
    </div>
  );
}
