import { Mistral } from "@mistralai/mistralai";
import { config } from "../config/env";

let client: Mistral | null = null;

function getClient(): Mistral {
  if (!client) {
    const key = config.mistralApiKey;
    console.log(`🔑 Mistral API key: ${key ? key.slice(0, 8) + "..." + key.slice(-4) : "❌ NOT SET"}`);
    client = new Mistral({ apiKey: key });
  }
  return client;
}

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const mistral = getClient();

  console.log(`📤 Mistral request: system prompt (${systemPrompt.length} chars), user prompt (${userPrompt.length} chars)`);
  const startTime = Date.now();

  const response = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.7,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const content = response.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    console.error(`❌ Mistral returned empty response after ${elapsed}s`);
    throw new Error("Empty response from Mistral");
  }

  console.log(`📥 Mistral response: ${content.length} chars in ${elapsed}s`);
  return content;
}
