import type { LLMConfig, LLMMessage, LLMResponse } from "@/types";

export async function callLLM(config: LLMConfig, messages: LLMMessage[], opts?: { temperature?:number; maxTokens?:number; timeout?:number; retries?:number }): Promise<LLMResponse> {
  const { temperature=config.temperature, maxTokens=config.maxTokens, timeout=60000, retries=2 } = opts ?? {};
  let lastErr: Error|null = null;
  for (let i=0;i<=retries;i++) {
    try {
      const ctrl = new AbortController(); const timer = setTimeout(()=>ctrl.abort(), timeout);
      const isOpenRouter = config.baseUrl.includes("openrouter.ai");
      const headers: Record<string,string> = { "Content-Type":"application/json", Authorization:`Bearer ${config.apiKey}` };
      if (isOpenRouter) { headers["HTTP-Referer"]=window.location.origin; headers["X-Title"]="TradeFinex"; }
      const res = await fetch(`${config.baseUrl}/chat/completions`, { method:"POST", headers, body:JSON.stringify({ model:config.model, messages, temperature, max_tokens:maxTokens, response_format:{type:"json_object"} }), signal:ctrl.signal });
      clearTimeout(timer);
      if (res.status===401) throw new Error("INVALID_API_KEY");
      if (res.status===429) throw new Error("RATE_LIMIT");
      if (!res.ok) { const b=await res.text().catch(()=>""); throw new Error(`LLM error ${res.status}: ${b}`); }
      const data = await res.json(); const content = data.choices?.[0]?.message?.content||"";
      if (!content) throw new Error("Empty LLM response");
      return { content, model:data.model||config.model, usage:data.usage?{promptTokens:data.usage.prompt_tokens,completionTokens:data.usage.completion_tokens,totalTokens:data.usage.total_tokens}:undefined };
    } catch(e) { lastErr=e instanceof Error?e:new Error(String(e)); if (lastErr.message==="INVALID_API_KEY"||lastErr.message==="RATE_LIMIT") throw lastErr; if(i<retries) await new Promise(r=>setTimeout(r,1000*(i+1))); }
  }
  throw lastErr||new Error("LLM failed");
}

export function parseLLMJson<T>(content: string): T {
  let s=content; const m=s.match(/```(?:json)?\s*([\s\S]*?)```/); if(m) s=m[1].trim();
  const jm=s.match(/\{[\s\S]*\}/); if(jm) s=jm[0];
  try { return JSON.parse(s) as T; } catch { throw new Error("MALFORMED_JSON"); }
}

export async function testLLMConnection(config: LLMConfig) {
  try { await callLLM(config, [{role:"system",content:'Reply with exactly: {"status":"ok"}'},{role:"user",content:"Test"}], {timeout:15000,retries:0,maxTokens:50}); return {success:true,message:"Connected"}; }
  catch(e) { const m=e instanceof Error?e.message:String(e); return {success:false, message:m==="INVALID_API_KEY"?"Invalid API key":m}; }
}
