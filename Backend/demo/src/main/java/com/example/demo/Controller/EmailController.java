package com.example.demo.Controller;

import com.example.demo.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-coupon-exp")
    public ResponseEntity<String> sendCouponExp(@RequestBody Map<String, String> requestBody) {
        String to = requestBody.get("to"); // Lấy địa chỉ email từ body
        try {
            emailService.sendCouponExp(to); // Gọi phương thức gửi email
            return ResponseEntity.ok("Email đã được gửi thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Hãy kiểm tra lại email của bạn!");
        }
    }

}
