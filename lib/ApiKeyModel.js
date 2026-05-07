import { LLM } from "@langchain/core/language_models/llms";

export class ModelAi extends LLM {
  constructor(fields = {}) {
    super(fields);
    this.apiKey = process.env.API_KEY_AI;
  }
  //GPT-4o mini
  //GPT-5.3 mini
  //grok-4.1-fast
  //gpt-5.4-mini-2026-03-17
  _llmType() {
    return "gpt-4o-mini";
  }

  async _call(prompt) {
    const url = `https://gpt1.shupremium.com/v1/chat/completions`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error: ${errText}`);
      }

      const data = await response.json();

      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}
