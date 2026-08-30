import type { LLMConfig, LLMMessage, LLMResponse } from "@/types";

// ─── LLM API Call ───────────────────────────────────────────
export async function callLLM(
  config: LLMConfig,
  messages: LLMMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    retries?: number;
  }
): Promise<LLMResponse> {
  const {
    temperature = config.temperature,
    maxTokens = config.maxTokens,
    timeout = 60000,
    retries = 2,
  } = options ?? {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const isOpenRouter = config.baseUrl.includes("openrouter.ai");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      };
      if (isOpenRouter) {
        headers["HTTP-Referer"] = window.location.origin;
        headers["X-Title"] = "TradeFinex";
      }

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 401) {
        throw new Error("INVALID_API_KEY");
      }
      if (response.status === 429) {
        throw new Error("RATE_LIMIT");
      }
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`LLM API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      if (!content) {
        throw new Error("Empty response from LLM");
      }

      return {
        content,
        model: data.model || config.model,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (
        lastError.message === "INVALID_API_KEY" ||
        lastError.message === "RATE_LIMIT"
      ) {
        throw lastError;
      }

      if (attempt < retries) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("LLM request failed after retries");
}

// ─── Parse and validate JSON from LLM response ─────────────
export function parseLLMJson<T>(
  content: string,
  schema?: { parse: (data: unknown) => T }
): T {
  // Try to extract JSON from the response
  let jsonStr = content;

  // If wrapped in markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Try to find JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  // Try to find JSON array
  if (!jsonMatch) {
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonStr = arrayMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (schema) {
      return schema.parse(parsed);
    }
    return parsed as T;
  } catch {
    throw new Error("MALFORMED_JSON");
  }
}

// ─── Test LLM connection ───────────────────────────────────
export async function testLLMConnection(config: LLMConfig): Promise<{
  success: boolean;
  message: string;
  model?: string;
}> {
  try {
    const response = await callLLM(
      config,
      [
        { role: "system", content: "You are a helpful assistant. Reply with exactly: {\"status\": \"ok\"}" },
        { role: "user", content: "Test connection" },
      ],
      { timeout: 15000, retries: 0, maxTokens: 50 }
    );

    return {
      success: true,
      message: "Connected successfully",
      model: response.model,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "INVALID_API_KEY") {
      return { success: false, message: "Invalid API key" };
    }
    if (msg === "RATE_LIMIT") {
      return { success: false, message: "Rate limited" };
    }
    return { success: false, message: msg };
  }
}
