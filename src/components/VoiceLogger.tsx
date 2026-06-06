import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { parseVoiceLog } from "@/lib/voice.functions";
import { addFoodLog, addWaterIntake, addWeightEntry } from "@/lib/nutrition.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Scale, 
  Droplets, 
  Flame, 
  Beef, 
  Wheat, 
  Droplet, 
  Loader2, 
  CheckCircle2, 
  Utensils, 
  Keyboard, 
  Check,
  RotateCcw,
  Plus
} from "lucide-react";
import { toast } from "sonner";

export function VoiceLogger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const queryClient = useQueryClient();
  const parseVoiceFn = useServerFn(parseVoiceLog);
  const addFoodLogFn = useServerFn(addFoodLog);
  const addWaterFn = useServerFn(addWaterIntake);
  const addWeightFn = useServerFn(addWeightEntry);

  const recognitionRef = useRef<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      setIsKeyboardMode(true);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN"; // English (India) is perfect for South/North Indian food names and accents

    rec.onstart = () => {
      setIsListening(true);
      setSaved(false);
    };

    rec.onresult = (event: any) => {
      let currentResult = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentResult += event.results[i][0].transcript;
      }
      setTranscript(currentResult);
      setManualText(currentResult);
    };

    rec.onerror = (event: any) => {
      console.error("Speech Recognition error:", event);
      if (event.error === "not-allowed") {
        toast.error("Microphone access is denied. Please enable mic permissions or use manual keyboard mode.");
        setIsKeyboardMode(true);
      } else {
        toast.error(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setManualText("");
      setParsedResult(null);
      setSaved(false);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        toast.error("Unable to activate microphone. Please try manual entry mode.");
        setIsKeyboardMode(true);
      }
    }
  };

  const handleParseText = async (textToParse: string) => {
    if (!textToParse.trim()) {
      toast.error("Please say or type something before analyzing.");
      return;
    }
    setParsing(true);
    setParsedResult(null);
    try {
      const response = await parseVoiceFn({ data: { text: textToParse } });
      if (response && response.result) {
        setParsedResult(response.result);
        if (response.result.type === "unknown") {
          toast.warning(response.result.summary);
        } else {
          toast.success("Speech parsed successfully with AI!");
        }
      } else {
        throw new Error("No parsed result returning from Gemini server");
      }
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "AI Parse failed");
    } finally {
      setParsing(false);
    }
  };

  const handleSaveParsedData = async () => {
    if (!parsedResult) return;
    setSaving(true);
    try {
      if (parsedResult.type === "food" && parsedResult.food_data) {
        const { food_data } = parsedResult;
        await addFoodLogFn({
          data: {
            meal_type: food_data.meal_type || "snack",
            food_name: food_data.food_name || "Unknown food",
            calories: Math.round(food_data.calories || 0),
            protein: food_data.protein_g || 0,
            carbs: food_data.carbs_g || 0,
            fats: food_data.fats_g || 0,
            fiber: food_data.fiber_g || 0,
            sugar: food_data.sugar_g || 0,
            sodium: food_data.sodium_mg || 0,
            vitamins: {},
            notes: food_data.notes || "Logged via Speech Assistant"
          }
        });
        queryClient.invalidateQueries({ queryKey: ["food-logs"] });
      } else if (parsedResult.type === "water" && parsedResult.water_ml) {
        await addWaterFn({
          data: {
            amount_ml: parsedResult.water_ml
          }
        });
      } else if (parsedResult.type === "weight" && parsedResult.weight_kg) {
        await addWeightFn({
          data: {
            weight_kg: parsedResult.weight_kg
          }
        });
        queryClient.invalidateQueries({ queryKey: ["weight-history"] });
      }

      queryClient.invalidateQueries({ queryKey: ["today-summary"] });
      setSaved(true);
      toast.success("Data securely logged and synced to your dashboard!");
      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 1500);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Failed to log entries");
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setTranscript("");
    setManualText("");
    setParsedResult(null);
    setSaved(false);
    setIsListening(false);
  };

  const setSampleVoice = (sample: string) => {
    setManualText(sample);
    setTranscript(sample);
    handleParseText(sample);
  };

  return (
    <>
      {/* CSS For pulsating wave ring animation */}
      <style>{`
        @keyframes customPulse {
          0% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes waveGrow {
          0%, 100% { height: 12px; }
          50% { height: 35px; }
        }
      `}</style>

      {/* Floating Action FAB Button */}
      <button
        id="voice_logger_fab"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-orange-500 to-amber-500 text-white shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        title="AI Voice Logger"
      >
        <Mic className="h-6 w-6" />
        <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-neon-blue text-[9px] font-bold text-foreground">
          AI
        </span>
      </button>

      {/* Slide-Up Overlay Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-2xl rounded-t-3xl border-t border-border/60 bg-gradient-to-b from-card to-background p-6 shadow-2xl space-y-6 md:mb-6 md:rounded-3xl md:border">
            
            {/* Header section of overlay */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-sans">AI Voice-to-Text Log</h3>
                  <p className="text-xs text-muted-foreground">Log food, water or weight with speech</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  recognitionRef.current?.stop();
                  setIsOpen(false);
                }}
                className="rounded-full bg-secondary/60 p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interaction Area */}
            <div className="space-y-4">
              {/* If speaking/logging state controller */}
              {!parsedResult && (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                  {/* Wave Visualizer block */}
                  {isListening ? (
                    <div className="flex items-center justify-center gap-1 h-12">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((index) => (
                        <span 
                          key={index} 
                          className="w-1.5 bg-primary rounded-full"
                          style={{
                            animation: "waveGrow 1.2s ease-in-out infinite",
                            animationDelay: `${index * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic font-mono select-none">
                      {isKeyboardMode ? "Manual parsing mode active" : "Tap microphone to begin dictating!"}
                    </div>
                  )}

                  {/* Big Microphone button */}
                  {!isKeyboardMode ? (
                    <div className="relative flex justify-center">
                      <button
                        onClick={toggleListening}
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
                          isListening 
                          ? "bg-rose-500 text-white" 
                          : "bg-primary/10 border-2 border-primary/20 text-primary hover:bg-primary/20"
                        }`}
                        style={isListening ? { animation: "customPulse 2s infinite" } : {}}
                      >
                        {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-center py-2 text-primary text-xs font-semibold bg-primary/5 rounded px-2.5">
                      <Keyboard className="h-4 w-4" /> Typing & AI Parsing Enabled
                    </div>
                  )}

                  {/* Visual indication */}
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-foreground">
                      {isListening ? "Listening closely..." : "Speak naturally!"}
                    </span>
                    <p className="max-w-md text-xs text-muted-foreground">
                      {isListening 
                        ? "Say things like 'I ate 2 Wheat Dosa for breakfast' or 'I just drank a couple of water cups'" 
                        : "Tell AI what you had or your metrics. Example: 'Water 300ml' or 'my weight is 72.8 kilograms'."}
                    </p>
                  </div>
                </div>
              )}

              {/* Real-time Transcription/Edit Textarea box */}
              {!parsedResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground font-medium">Spoken or typed transcription:</Label>
                    {!recognitionSupported ? (
                      <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono">Microphone Not Supported (Use keyboard)</span>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setIsKeyboardMode(!isKeyboardMode)}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        {isKeyboardMode ? "Use Speech Mode" : "Fine-tune transcription"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      value={manualText}
                      onChange={(e) => {
                        setManualText(e.target.value);
                        setTranscript(e.target.value);
                      }}
                      placeholder="e.g. I had two idlis with sambar and half a liter of water"
                      className="border-border/60 bg-secondary/10 pr-10 text-sm focus:border-primary/50"
                      disabled={isListening}
                    />
                    {manualText && (
                      <button
                        onClick={() => setManualText("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preset Shortcuts */}
                  {!manualText && !isListening && (
                    <div className="pt-2">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Quick Try-Outs:</span>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <button 
                          onClick={() => setSampleVoice("I had a Masala Dosa for breakfast")}
                          className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-left text-[11px] text-foreground hover:bg-secondary transition-colors"
                        >
                          "I had Masala Dosa"
                        </button>
                        <button 
                          onClick={() => setSampleVoice("Drank two cups of water")}
                          className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-left text-[11px] text-foreground hover:bg-secondary transition-colors"
                        >
                          "Drank two water cups"
                        </button>
                        <button 
                          onClick={() => setSampleVoice("Logged weight 68.4 kg")}
                          className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-left text-[11px] text-foreground hover:bg-secondary transition-colors"
                        >
                          "Logged weight 68.4 kg"
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Trigger Action button */}
                  {manualText && !isListening && (
                    <Button 
                      onClick={() => handleParseText(manualText)} 
                      disabled={parsing} 
                      className="w-full gap-2 shadow-lg shadow-primary/20 brightness-105"
                    >
                      {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {parsing ? "Parsing Speech with AI..." : "Analyze Speech with AI"}
                    </Button>
                  )}
                </div>
              )}

              {/* Parsing Loading State */}
              {parsing && (
                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Gemini AI is parsing your health dictation...</span>
                </div>
              )}

              {/* Parsed Result Validation & Custom Cards */}
              {parsedResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground font-mono">Recognized Entry</span>
                    <button 
                      onClick={resetState}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Say something else
                    </button>
                  </div>

                  <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      
                      {/* Overall Text Representation */}
                      <p className="text-sm font-medium text-foreground bg-secondary/20 p-2.5 rounded border border-border/40 italic">
                        "{parsedResult.summary}"
                      </p>

                      {/* Display Food log metrics card */}
                      {parsedResult.type === "food" && parsedResult.food_data && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                              <Utensils className="h-4 w-4 text-primary" />
                              {parsedResult.food_data.food_name}
                            </span>
                            <span className="bg-primary/25 border border-primary/30 px-2 py-0.5 rounded text-[10px] font-bold text-primary uppercase">
                              {parsedResult.food_data.meal_type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1 text-center">
                            <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/30">
                              <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
                                <Flame className="h-3 w-3 text-primary" /> Calories
                              </div>
                              <div className="text-sm font-bold mt-0.5">{parsedResult.food_data.calories} kcal</div>
                            </div>
                            <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/30">
                              <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
                                <Beef className="h-3 w-3 text-neon-blue" /> Protein
                              </div>
                              <div className="text-sm font-bold mt-0.5 text-neon-blue">{parsedResult.food_data.protein_g}g</div>
                            </div>
                            <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/30">
                              <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
                                <Wheat className="h-3 w-3 text-neon-purple" /> Carbs
                              </div>
                              <div className="text-sm font-bold mt-0.5 text-neon-purple">{parsedResult.food_data.carbs_g}g</div>
                            </div>
                            <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/30">
                              <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
                                <Droplet className="h-3 w-3 text-chart-3" /> Fats
                              </div>
                              <div className="text-sm font-bold mt-0.5 text-chart-3">{parsedResult.food_data.fats_g}g</div>
                            </div>
                          </div>

                          {/* Extra info */}
                          <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-border/30">
                            Notes / Estimate: {parsedResult.food_data.notes || "Estimated nutrition metrics."}
                          </div>
                        </div>
                      )}

                      {/* Display Water logger metrics card */}
                      {parsedResult.type === "water" && parsedResult.water_ml && (
                        <div className="flex items-center gap-4 py-1.5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-blue/15 text-neon-blue">
                            <Droplets className="h-8 w-8 animate-bounce" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground">Water Hydration Intake</span>
                            <div className="text-xl font-extrabold text-neon-blue mt-0.5">{parsedResult.water_ml} ml</div>
                            <p className="text-xs text-muted-foreground">Will be logged toward your daily target water hydration</p>
                          </div>
                        </div>
                      )}

                      {/* Display Weight entry card */}
                      {parsedResult.type === "weight" && parsedResult.weight_kg && (
                        <div className="flex items-center gap-4 py-1.5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-chart-5/15 text-chart-5 animate-pulse">
                            <Scale className="h-8 w-8" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground">Body Weight Metric</span>
                            <div className="text-xl font-extrabold text-white mt-0.5">{parsedResult.weight_kg} kg</div>
                            <p className="text-xs text-muted-foreground">Will update your progress history, bmi calculations, and weight trends</p>
                          </div>
                        </div>
                      )}

                      {/* Display Unknown category card */}
                      {parsedResult.type === "unknown" && (
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-300">
                          We parsed your input but couldn't associate it with food, water, or weight logged items. Please say things like:
                          <ul className="list-disc pl-4 mt-2 space-y-1">
                            <li>"I had a snack of upma at 4 pm"</li>
                            <li>"I drank 250ml water"</li>
                            <li>"My weight logged as 70.4 kg"</li>
                          </ul>
                        </div>
                      )}

                    </CardContent>
                  </Card>

                  {/* Submission and Close controls */}
                  <div className="flex gap-2.5">
                    {parsedResult.type !== "unknown" && (
                      <Button 
                        onClick={handleSaveParsedData} 
                        disabled={saving || saved} 
                        className="flex-1 gap-2 bg-gradient-to-tr from-emerald-500 to-green-600 border-none select-none"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {saving ? "Saving Entries..." : saved ? "Successfully Logged!" : "Confirm and Save Log"}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={resetState}
                      disabled={saving}
                    >
                      Discard & Retry
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
