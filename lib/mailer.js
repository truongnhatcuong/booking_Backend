import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export async function sendResetMail(to, link) {
  await transporter.sendMail({
    to,
    subject: "Đặt Lại Mật Khẩu Của Bạn",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
            <h2 style="color: #2d3748; margin-bottom: 16px;">Yêu cầu đặt lại mật khẩu</h2>
            <p style="color: #4a5568; font-size: 16px;">
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.<br>
                Nhấn vào nút bên dưới để thay đổi mật khẩu:
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #3182ce; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">
                    Đặt lại mật khẩu
                </a>
            </div>
            <p style="color: #a0aec0; font-size: 13px;">
                Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này.
            </p>
        </div>
    `,
  });
}

export async function sendBookingMail({
  to,
  name,
  roomName,
  checkInDate,
  checkOutDate,
}) {
  try {
    const paymentDeadline = new Date(checkInDate);
    paymentDeadline.setDate(paymentDeadline.getDate() + 1); // +1 ngày
    paymentDeadline.setHours(14, 0, 0, 0); // 14:00:00.000

    // Tạo chuỗi hiển thị "HH:mm ngày dd/MM/yyyy"

    // 2️⃣ Cấu hình nội dung email
    const mailOptions = {
      from: `"Your Hotel" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Xác nhận đặt phòng thành công 🏨",
      html: `
    <div style="font-family:sans-serif;line-height:1.6">
      <h2>Xin chào ${name},</h2>
      <p>Bạn đã đặt phòng <strong>${roomName}</strong> thành công.</p>
      <p>
        <strong>Ngày nhận phòng:</strong> ${new Date(checkInDate).toLocaleDateString("vi-VN")}<br>
        <strong>Ngày trả phòng:</strong> ${new Date(checkOutDate).toLocaleDateString("vi-VN")}
      </p>
      <p>
        <strong>Thời gian nhận phòng:</strong> 14:00<br>
        <strong>Thời gian trả phòng:</strong> 12:00
      </p>
    <p>
  <strong>Lưu ý:</strong> Nếu bạn chọn thanh toán tiền mặt tại khách sạn,
  vui lòng đến nhận phòng và thanh toán trước ngày đặt 1 ngày
  Nếu quá thời gian này mà chưa thanh toán, đặt phòng của bạn sẽ tự động bị hủy để đảm bảo quyền lợi cho khách hàng khác.
</p>

      <p>Cảm ơn bạn đã tin tưởng lựa chọn chúng tôi ❤️</p>
      <p>Trân trọng,<br><strong>Đội ngũ khách sạn</strong></p>
    </div>
  `,
    };

    // 3️⃣ Gửi mail
    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error("❌ Send email failed:", error);
    throw error;
  }
}
