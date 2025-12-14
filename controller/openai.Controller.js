import {
  generatePostService,
  GetChatHistoryService,
  OpenAIService,
  OPenAITestService,
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
