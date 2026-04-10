import { getGoogleTTS } from "../services/face.Service.js";
import {
  generateMiniStatsService,
  generatePostService,
  GetChatHistoryService,
  OpenAIService,
  OPenAITestService,
  processVoiceCommand,
} from "../services/openai.service.js";

export async function chatController(req, res) {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim() === "") {
      const result = await GetChatHistoryService(sessionId);
      return res.status(200).json(result);
    }

    const result = await OpenAIService(message, sessionId);

    return res.status(200).json({
      success: true,
      reply: result.reply,
      history: result.history,
    });
  } catch (error) {
    console.error("Error in chatController:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra, vui lòng thử lại",
    });
  }
}

export async function chatTestController(req, res) {
  try {
    const { message } = req.body;

    const result = await OPenAITestService(message);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in chatController:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra, vui lòng thử lại",
    });
  }
}

export async function generatePost(req, res) {
  const { topic } = req.body;

  try {
    if (!topic) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu chủ đề (topic)" });
    }

    const result = await generatePostService(topic);
    console.log(result);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Lỗi generatePost:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
}

// thong ke

export async function generateMiniStats(req, res) {
  const { message } = req.body;

  try {
    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu nội dung (message)" });
    }

    const text = await generateMiniStatsService(message);

    return res.json({
      success: true,
      data: { text }, // chatbot lấy data.text để hiển thị
    });
  } catch (error) {
    console.error("❌ Lỗi generateMiniStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
}

export async function parseVoiceCommand(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Thiếu prompt từ giọng nói" });
    }

    const data = await processVoiceCommand(prompt);

    // Xử lý mã trạng thái dựa trên dữ liệu service trả về
    if (data.error) {
      return res.status(404).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error("Voice Controller Error:", error);

    // Phân loại lỗi để trả về status code phù hợp
    if (error.message === "KHONG_PARSE_DUOC_JSON") {
      return res.status(422).json({ message: "AI không hiểu được lệnh này" });
    }

    return res.status(500).json({ message: "Lỗi hệ thống xử lý giọng nói" });
  }
}
export const streamTTS = async (req, res) => {
  try {
    const { text } = req.query;
    if (!text)
      return res.status(400).json({ message: "Thiếu nội dung văn bản" });

    const audioBuffer = await getGoogleTTS(text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Controller Error:", error);
    res.status(500).json({ message: "Không thể tạo giọng nói" });
  }
};
