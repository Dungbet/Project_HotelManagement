package com.example.demo.Service;

import com.example.demo.DTO.UsersDTO;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.UserRepo;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.management.RuntimeErrorException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    //    public void sendVerificationEmail(String to, String token){
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(to);
//        message.setSubject("Email Verification");
//        message.setText("Please click the link below to verify your email address:\n" +
//                "http://localhost:8080/auth/verify?token=" + token);
//        javaMailSender.send(message);
//    }
    public void sendVerificationEmail(String to, String subject, String body) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true); // true indicates multipart message
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML content
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            // Handle exception
        }
    }

    public void sendBookingInvoice(Bookings booking) {
        String subject = "Hóa đơn đặt phòng #" + booking.getId();
        String body = generateInvoiceHtml(booking);

        sendVerificationEmail(booking.getBookingEmail(), subject, body);
    }

    private String generateInvoiceHtml(Bookings booking) {
        // Mẫu HTML hóa đơn
        String htmlTemplate = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>Hóa đơn đặt phòng</title>" +
                "<style>" +
                "body {" +
                "font-family: Arial, sans-serif;" +
                "margin: 0;" +
                "padding: 0;" +
                "background-color: #f4f4f4;" +
                "}" +
                ".invoice-container {" +
                "width: 80%;" +
                "margin: auto;" +
                "background-color: #ffffff;" +
                "padding: 20px;" +
                "border-radius: 10px;" +
                "box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);" +
                "}" +
                ".header {" +
                "text-align: center;" +
                "border-bottom: 1px solid #cccccc;" +
                "margin-bottom: 20px;" +
                "}" +
                ".header h1 {" +
                "margin: 0;" +
                "}" +
                ".header p {" +
                "margin: 5px 0;" +
                "}" +
                ".invoice-details {" +
                "margin-bottom: 20px;" +
                "}" +
                ".invoice-details h3 {" +
                "margin: 0 0 10px 0;" +
                "color: #333333;" +
                "}" +
                ".invoice-details p {" +
                "margin: 5px 0;" +
                "color: #555555;" +
                "}" +
                ".booking-details, .payment-details {" +
                "margin-bottom: 20px;" +
                "}" +
                ".booking-details h3, .payment-details h3 {" +
                "margin-bottom: 10px;" +
                "color: #333333;" +
                "}" +
                ".booking-details p, .payment-details p {" +
                "margin: 5px 0;" +
                "color: #555555;" +
                "}" +
                ".footer {" +
                "text-align: center;" +
                "margin-top: 20px;" +
                "border-top: 1px solid #cccccc;" +
                "padding-top: 10px;" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"invoice-container\">" +
                "<div class=\"header\">" +
                "<h1>HÓA ĐƠN ĐẶT PHÒNG</h1>" +
                "<p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>" +
                "</div>" +
                "<div class=\"invoice-details\">" +
                "<h3>Thông tin đặt phòng</h3>" +
                "<p><strong>Mã đặt phòng:</strong> {{bookingId}}</p>" +
                "<p><strong>Tên người đặt:</strong> {{bookingName}}</p>" +
                "<p><strong>Email:</strong> {{bookingEmail}}</p>" +
                "<p><strong>Số điện thoại:</strong> {{bookingPhone}}</p>" +
                "</div>" +
                "<div class=\"booking-details\">" +
                "<h3>Chi tiết phòng</h3>" +
                "<p><strong>Phòng:</strong> {{roomName}}</p>" +
                "<p><strong>Ngày check-in:</strong> {{checkInDate}}</p>" +
                "<p><strong>Ngày check-out:</strong> {{checkOutDate}}</p>" +
                "<p><strong>Số lượng khách:</strong> {{guest}}</p>" +
                "</div>" +
                "<div class=\"payment-details\">" +
                "<h3>Chi tiết thanh toán</h3>" +
                "<p><strong>Tổng số tiền:</strong> {{totalAmount}} VND</p>" +
                "<p><strong>Phương thức thanh toán:</strong> Thanh toán online</p>" +
                "<p><strong>Ngày thanh toán:</strong> {{paymentDate}}</p>" +
                "<p><strong>Trạng thái:</strong> Thành công</p>" +
                "</div>" +
                "<div class=\"footer\">" +
                "<p>Chúng tôi rất mong được đón tiếp quý khách!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        // Thay thế các biến trong HTML bằng dữ liệu thực tế
        return htmlTemplate
                .replace("{{bookingId}}", String.valueOf(booking.getId()))
                .replace("{{bookingName}}", booking.getBookingName())
                .replace("{{bookingEmail}}", booking.getBookingEmail())
                .replace("{{bookingPhone}}", booking.getBookingPhone())
                .replace("{{roomName}}", booking.getRoom().getName())
                .replace("{{checkInDate}}", booking.getCheckInDate().toString())
                .replace("{{checkOutDate}}", booking.getCheckOutDate().toString())
                .replace("{{guest}}", String.valueOf(booking.getGuest()))
                .replace("{{totalAmount}}", String.format("%,.2f", booking.getTotalAmount()))
                .replace("{{paymentDate}}", new SimpleDateFormat("dd/MM/yyyy").format(new Date()));
    }


}