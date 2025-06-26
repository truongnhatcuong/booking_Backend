import nodemailer from "nodemailer";
export async function sendResetMail(to, link) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
