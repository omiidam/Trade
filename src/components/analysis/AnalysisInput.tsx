import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const SUGGESTION_KEYS = [
  "trend",
  "supportResistance",
  "reversal",
  "rsi",
  "movingAverages",
  "momentum",
  "risks",
  "complete",
] as const;

export function AnalysisInput({
  onAnalyze,
  isLoading,
}: {
  onAnalyze: (prompt: string) => void;
  isLoading: boolean;
}) {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onAnalyze(prompt.trim());
  };

  const handleSuggestion = (key: (typeof SUGGESTION_KEYS)[number]) => {
    const text = t.analysis.suggestions[key];
    setPrompt(text);
    onAnalyze(text);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.analysis.inputPlaceholder}
          className="min-h-[100px] text-sm pe-24"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          size="sm"
          className="absolute bottom-3 end-3 gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {t.analysis.analyze}
        </Button>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTION_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleSuggestion(key)}
            disabled={isLoading}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              "bg-secondary/50 text-secondary-foreground hover:bg-secondary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {t.analysis.suggestions[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
