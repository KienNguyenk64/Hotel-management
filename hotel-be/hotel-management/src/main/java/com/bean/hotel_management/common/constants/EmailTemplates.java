package com.bean.hotel_management.common.constants;

/**
 * Email HTML templates
 */
public class EmailTemplates {

    private static final String BASE_TEMPLATE = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        margin: 0;
                        padding: 0;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .header { 
                        background-color: %s; 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content { 
                        padding: 30px; 
                        background-color: #ffffff;
                        border-radius: 0 0 8px 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .button { 
                        display: inline-block; 
                        padding: 14px 32px; 
                        background-color: %s; 
                        color: white !important; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        margin: 20px 0;
                        font-weight: bold;
                        transition: background-color 0.3s;
                    }
                    .button:hover {
                        opacity: 0.9;
                    }
                    .link-box {
                        background-color: #f9f9f9;
                        padding: 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        word-break: break-all;
                        font-size: 13px;
                        color: #666;
                    }
                    .footer { 
                        text-align: center; 
                        padding: 20px; 
                        color: #888; 
                        font-size: 12px;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 12px;
                        margin: 15px 0;
                        border-radius: 4px;
                    }
                    .warning strong {
                        color: #856404;
                    }
                    ul {
                        margin: 10px 0;
                        padding-left: 20px;
                    }
                    li {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header' style='background-color: %s;'>
                        <h1>%s</h1>
                    </div>
                    <div class='content'>
                        %s
                    </div>
                    <div class='footer'>
                        <p>&copy; 2025 Hotel Management System. All rights reserved.</p>
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                    </div>
                </div>
            </body>
            </html>
            """;

    public static String getVerificationEmailTemplate(String verificationLink) {
        String content = String.format("""
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Hotel Management</strong>.</p>
                <p>Vui lòng nhấn vào nút bên dưới để xác thực email của bạn:</p>
                <div style='text-align: center;'>
                    <a href='%s' class='button' style='background-color: #4CAF50;'>Xác thực Email</a>
                </div>
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <div class='link-box'>%s</div>
                <p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 24 giờ.</p>
                <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
                """, verificationLink, verificationLink);

        return String.format(BASE_TEMPLATE,
                "#4CAF50", "#4CAF50", "#4CAF50",
                "Xác thực tài khoản", content);
    }

    public static String getResetPasswordEmailTemplate(String resetLink) {
        String content = String.format("""
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>Hotel Management</strong>.</p>
                <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                <div style='text-align: center;'>
                    <a href='%s' class='button' style='background-color: #FF5722;'>Đặt lại mật khẩu</a>
                </div>
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <div class='link-box'>%s</div>
                <div class='warning'>
                    <strong>⚠️ Lưu ý quan trọng:</strong>
                    <ul>
                        <li>Link này sẽ hết hạn sau 1 giờ</li>
                        <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                        <li>Không chia sẻ link này với bất kỳ ai</li>
                    </ul>
                </div>
                """, resetLink, resetLink);

        return String.format(BASE_TEMPLATE,
                "#FF5722", "#FF5722", "#FF5722",
                "Đặt lại mật khẩu", content);
    }
}