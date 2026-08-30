import { useState } from "react";
import {
  Settings,
  Brain,
  Palette,
  Database,
  Info,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { testLLMConnection } from "@/services/llm/llmService";
import * as storage from "@/services/storage/storageService";
import type { Timeframe, AppSettings } from "@/types";
import { TIMEFRAMES } from "@/utils";

export default function SettingsPage() {
  const { t, lang, setLanguage } = useI18n();
  const { settings, updateSettings, updateLLMConfig } = useApp();

  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const handleTestConnection = async () => {
    setTestStatus("testing");
    try {
      const result = await testLLMConnection(settings.llm);
      setTestStatus(result.success ? "success" : "error");
      setTestMessage(result.message);
    } catch {
      setTestStatus("error");
      setTestMessage("Connection failed");
    }
  };

  const handleClearCache = () => {
    storage.clearMarketCache();
  };

  const handleClearHistory = () => {
    if (confirm(t.settings.data.confirmClearHistory)) {
      storage.clearHistory();
      window.location.reload();
    }
  };

  const handleThemeChange = (theme: AppSettings["theme"]) => {
    updateSettings({ theme });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* LLM Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              {t.settings.llm.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Provider Presets */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Quick Setup
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    name: "OpenRouter",
                    baseUrl: "https://openrouter.ai/api/v1",
                    model: "openai/gpt-4o",
                  },
                  {
                    name: "OpenAI",
                    baseUrl: "https://api.openai.com/v1",
                    model: "gpt-4o-mini",
                  },
                  {
                    name: "Anthropic",
                    baseUrl: "https://api.anthropic.com/v1",
                    model: "claude-sonnet-4-20250514",
                  },
                  {
                    name: "Local",
                    baseUrl: "http://localhost:11434/v1",
                    model: "llama3",
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      updateLLMConfig({
                        baseUrl: preset.baseUrl,
                        model: preset.model,
                      })
                    }
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                      settings.llm.baseUrl === preset.baseUrl
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Base URL */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t.settings.llm.baseUrl}
              </label>
              <Input
                value={settings.llm.baseUrl}
                onChange={(e) => updateLLMConfig({ baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t.settings.llm.apiKey}
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={settings.llm.apiKey}
                  onChange={(e) => updateLLMConfig({ apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="pe-10"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t.settings.llm.model}
              </label>
              <Input
                value={settings.llm.model}
                onChange={(e) => updateLLMConfig({ model: e.target.value })}
                placeholder="gpt-4o-mini"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t.settings.llm.temperature}: {settings.llm.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.llm.temperature}
                onChange={(e) => updateLLMConfig({ temperature: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none bg-secondary accent-primary"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t.settings.llm.maxTokens}
              </label>
              <Input
                type="number"
                value={settings.llm.maxTokens}
                onChange={(e) => updateLLMConfig({ maxTokens: parseInt(e.target.value) || 4096 })}
              />
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testStatus === "testing" || !settings.llm.apiKey}
                className="gap-1.5"
              >
                {testStatus === "testing" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : testStatus === "success" ? (
                  <CheckCircle className="w-3.5 h-3.5 text-bullish" />
                ) : testStatus === "error" ? (
                  <XCircle className="w-3.5 h-3.5 text-bearish" />
                ) : null}
                {t.settings.llm.testConnection}
              </Button>
              {testStatus !== "idle" && testStatus !== "testing" && (
                <span
                  className={cn(
                    "text-xs",
                    testStatus === "success" ? "text-bullish" : "text-bearish"
                  )}
                >
                  {testMessage}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              {t.settings.display.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                {t.settings.display.theme}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "dark" as const, icon: Moon, label: t.settings.display.dark },
                  { value: "light" as const, icon: Sun, label: t.settings.display.light },
                  { value: "system" as const, icon: Monitor, label: t.settings.display.system },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                      settings.theme === theme.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <theme.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                {t.settings.display.language}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    lang === "en"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-xs font-medium">{t.settings.display.english}</span>
                </button>
                <button
                  onClick={() => setLanguage("fa")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    lang === "fa"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-lg">🇮🇷</span>
                  <span className="text-xs font-medium">{t.settings.display.persian}</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              {t.settings.defaults.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                {t.settings.defaults.timeframe}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => updateSettings({ defaultTimeframe: tf.value })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      settings.defaultTimeframe === tf.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              {t.settings.data.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleClearCache}
            >
              <Database className="w-4 h-4" />
              {t.settings.data.clearCache}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleClearHistory}
            >
              <Database className="w-4 h-4" />
              {t.settings.data.clearHistory}
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {t.settings.about.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t.settings.about.version}</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.settings.about.description}
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              {t.settings.about.disclaimer}
            </p>
          </CardContent>
        </Card>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
