package com.example.demo.Controller;

import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.UsersDTO;
import com.example.demo.Entity.Roles;
import com.example.demo.Repository.RoleRepo;
import com.example.demo.Service.AuthService;
import com.example.demo.Service.BlacklistTokenService;
import com.example.demo.Service.JwtTokenService;
import com.example.demo.Service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController()
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtTokenService jwtTokenService;
    @Autowired
    BlacklistTokenService blacklistTokenService;
    @Autowired
    UserService userService;
    @Autowired
    AuthService authService;




    // Lấy thông tin của người dùng đăng đăng nhập
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UsersDTO me (Principal p){
        String username = p.getName();
        UsersDTO user = userService.findByUsername(username);
        return user;
    }
    @PostMapping("/register")
    public ResponseDTO<String> register(@RequestBody UsersDTO usersDTO) {

        authService.registerUser(usersDTO);
        return ResponseDTO.<String>builder().status(200).data("Đăng ký thành công, vui lòng kiểm tra email để xác minh tài khoản.").build();
    }

    @GetMapping("/verify")
    public ResponseDTO<String> verifyEmail(@RequestParam("token") String token) {
        try {
            authService.verifyEmail(token);
            return ResponseDTO.<String>builder().status(200).data("Email verified successfully!").build();
        } catch (Exception e) {
            return ResponseDTO.<String>builder().status(400).data(e.getMessage()).build();
        }
    }
    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@RequestHeader("Refresh-Token") String bearerToken) {
        // Loại bỏ "Bearer " khỏi token
        String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;

        // Kiểm tra tính hợp lệ của token
        if (jwtTokenService.isValidToken(token)) {
            String username = jwtTokenService.getUserName(token);

            // Lấy thông tin người dùng từ database hoặc service để lấy userId
            UsersDTO user = userService.findByUsername(username);
            int userId = user.getId(); // Giả sử rằng bạn đã có phương thức để lấy userId từ username
            String role = user.getRole().getName(); // Giả sử UsersDTO có trường role
            // Tạo lại access token và refresh token với userId
            String newAccessToken = jwtTokenService.createToken(username, userId,role);
            String newRefreshToken = jwtTokenService.createRefreshToken(username, userId, role);

            // Xây dựng phản hồi
            return ResponseEntity.ok()
                    .header("Refresh-Token", "Bearer " + newRefreshToken)
                    .body(newAccessToken);
        }

        // Nếu token không hợp lệ
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token");
    }



    @PostMapping("/login")
    public ResponseDTO<String> login(@RequestBody UsersDTO usersDTO) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usersDTO.getUsername(), usersDTO.getPassword())
            );
            // Lấy thông tin người dùng từ username
            UsersDTO user = userService.findByUsername(usersDTO.getUsername());
            int userId = user.getId(); // Giả sử UsersDTO có trường id
            String role = user.getRole().getName();
            // Generate token after successful authentication
            return ResponseDTO.<String>builder()
                    .status(200)
                    .data(jwtTokenService.createToken(usersDTO.getUsername(), userId,role))
                    .build();
        } catch (AuthenticationException e) {
            // Handle authentication exceptions
            return ResponseDTO.<String>builder()
                    .status(401)
                    .data("Invalid credentials")
                    .build();
        }
    }

    @PostMapping("/logout")
    public ResponseDTO<String> logout(@RequestHeader("Authorization") String bearerToken) {
        String token = bearerToken.substring(7);
        blacklistTokenService.addToBlacklist(token);
        return ResponseDTO.<String>builder().status(200).data("Logout successful").build();
    }
    @PostMapping("/forget-password")
    public ResponseDTO<String> forgetPassword(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");
        try {
            authService.forgetPassword(email);
            return ResponseDTO.<String>builder().status(200).data("Mật khẩu mới đã được gửi đến email của bạn.").build();
        } catch (IllegalArgumentException e) {
            return ResponseDTO.<String>builder().status(400).data(e.getMessage()).build();
        } catch (Exception e) {
            return ResponseDTO.<String>builder().status(500).data("Có lỗi xảy ra. Vui lòng thử lại.").build();
        }
    }


}