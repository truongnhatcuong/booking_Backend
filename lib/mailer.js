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
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1e3a8a; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Xác Nhận Đặt Phòng</h1>
          <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 16px;">Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e3a8a; font-size: 20px; margin-top: 0; margin-bottom: 20px;">Xin chào ${name},</h2>
          <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
            Thật tuyệt vời! Chúng tôi đã nhận được yêu cầu đặt phòng của bạn. Dưới đây là thông tin chi tiết cho kỳ nghỉ sắp tới tại phòng <strong style="color: #1e3a8a; font-size: 18px;">${roomName}</strong>.
          </p>

          <!-- Booking Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase;">Thông tin chi tiết</h3>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding-bottom: 15px; color: #64748b; width: 45%;"><strong>Ngày nhận phòng:</strong></td>
                <td style="padding-bottom: 15px; color: #0f172a; text-align: right; font-weight: 600;">${new Date(checkInDate).toLocaleDateString("vi-VN")}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 15px; color: #64748b;"><strong>Ngày trả phòng:</strong></td>
                <td style="padding-bottom: 15px; color: #0f172a; text-align: right; font-weight: 600;">${new Date(checkOutDate).toLocaleDateString("vi-VN")}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 15px; color: #64748b;"><strong>Giờ nhận phòng:</strong></td>
                <td style="padding-bottom: 15px; color: #0f172a; text-align: right; font-weight: 600;">14:00</td>
              </tr>
              <tr>
                <td style="color: #64748b;"><strong>Giờ trả phòng:</strong></td>
                <td style="color: #0f172a; text-align: right; font-weight: 600;">12:00</td>
              </tr>
            </table>
          </div>

          <!-- Warning/Note -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
            <h4 style="margin: 0 0 10px 0; color: #b45309; font-size: 15px;">⚠️ Lưu ý quan trọng</h4>
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
              Nếu bạn chọn thanh toán tiền mặt tại khách sạn, vui lòng đến nhận phòng và thanh toán <strong>trước ngày đặt 1 ngày</strong>. Nếu quá thời gian này mà chưa hoàn tất thanh toán, hệ thống sẽ tự động hủy phòng để đảm bảo quyền lợi cho các khách hàng khác.
            </p>
          </div>

          <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 10px;">
            Chúng tôi rất mong được đón tiếp bạn! ❤️
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 25px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase;"><strong>Đội ngũ Khách sạn</strong></p>
          <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 13px;">Hotline: 1900 xxxx | Email: support@yourhotel.com</p>
        </div>
      </div>
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
