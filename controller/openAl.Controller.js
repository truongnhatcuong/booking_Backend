import { hotelAIService } from "../services/OpenAl.service.js";

export async function chatController(req, res) {
  try {
    const { question } = req.body;

    // Simple validation
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập câu hỏi",
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Câu hỏi quá dài, vui lòng rút ngắn",
      });
    }

    // Call AI service
    const answer = await hotelAIService(question);

    // Return response
    return res.status(200).json({
      success: true,
      question: question,
      answer: answer,
    });
  } catch (error) {
    console.error("Error in chatController:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra, vui lòng thử lại",
    });
  }
}
