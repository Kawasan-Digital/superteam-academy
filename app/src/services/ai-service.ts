import { supabase } from '@/integrations/supabase/client';

type Msg = { role: "user" | "assistant"; content: string };

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

export async function streamChat({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  context?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const headers = await getAuthHeaders();
    const resp = await fetch(AI_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages, mode: "tutor", context }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "AI service error" }));
      onError(err.error || `Error ${resp.status}`);
      return;
    }

    if (!resp.body) { onError("No response body"); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Connection failed");
  }
}

export async function aiRequest({
  messages,
  mode,
  context,
}: {
  messages: Msg[];
  mode: "code-review" | "recommend";
  context?: string;
}): Promise<string> {
  const headers = await getAuthHeaders();
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages, mode, context }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "AI service error" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  const data = await resp.json();
  return data.content;
}
