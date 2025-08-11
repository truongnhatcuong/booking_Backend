import { OpenAIService } from "../services/OpenAl.service.js";

export async function chatController(req, res) {
  const userId = req.user ? req.user.id : null; // Nếu không có token thì userId = null
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await OpenAIService(message, userId);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error in chatController:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra, vui lòng thử lại",
    });
  }
}
