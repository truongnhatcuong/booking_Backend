//sk-05881d0fd37743568c29f7cf52144c33
import { LLM } from "@langchain/core/language_models/llms";

export class DeepSeekLLM extends LLM {
  constructor(fields = {}) {
    super(fields);
  }
  //gemini-2.5-flash
  //gemini-2.5-pro
  _llmType() {
    return "deepseek";
  }

  async _call(prompt) {
    const url = `https://api.deepseek.com/chat/completions`;
    const apiDeepSeek = "sk-05881d0fd37743568c29f7cf52144c33";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiDeepSeek}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "user", content: prompt }, // Nội dung câu hỏi của user
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${errText}`);
      }

      const data = await response.json();

      // ✅ Lấy text đúng chỗ
      const answer = data.choices[0].message;

      return answer;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}
