import { PUTER_API_BASE } from "../constants";
import type { Message, ChatCompletionResponse } from "../types";

function getDriverForModel(model: string): string {
  if (model.includes("claude")) return "claude";
  if (model.includes("gpt")) return "openai-completion";
  if (model.includes("gemini")) return "google-ai";
  if (model.includes("deepseek")) return "deepseek";
  return "openai-completion"; // default
}

export const createPuterChatService = (token: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    /**
     * Send a non-streaming chat request
     */
    async chat(
      model: string,
      messages: Message[],
    ): Promise<ChatCompletionResponse> {
      const driver = getDriverForModel(model);

      const response = await fetch(`${PUTER_API_BASE}/drivers/call`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver,
          method: "complete",
          args: {
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Puter API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id || `puter-${Date.now()}`,
        choices: [
          {
            message: {
              role: "assistant",
              content:
                data.message?.content || data.result?.message?.content || "",
            },
            finish_reason: "stop",
          },
        ],
        model,
      };
    },

    /**
     * Send a streaming chat request
     * Returns an async generator that yields content chunks
     */
    async *streamChat(
      model: string,
      messages: Message[],
    ): AsyncGenerator<string, void, unknown> {
      const driver = getDriverForModel(model);

      const response = await fetch(`${PUTER_API_BASE}/drivers/call`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver,
          method: "complete",
          args: {
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            stream: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Puter API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    },
  };
};
