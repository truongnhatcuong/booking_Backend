import { LLM } from "@langchain/core/language_models/llms";

export class GeminiLLM extends LLM {
  constructor(fields = {}) {
    super(fields);
    this.apiKey = fields.apiKey || process.env.OPENAI_API_KEY;
    this.model = "gemini-2.5-flash";
  }
  //gemini-2.5-flash
  //gemini-2.5-pro
  _llmType() {
    return "gemini";
  }

  async _call(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    try {
      const response = await fetch(`${url}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${errText}`);
      }

      const data = await response.json();

      // ✅ Lấy text đúng chỗ
      const answer = data.candidates[0];
      console.log(answer);

      return answer;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}
