package com.example.demo.Service;

import com.example.demo.DTO.RolesDTO;
import com.example.demo.DTO.UsersDTO;
import com.example.demo.Entity.Roles;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.RoleRepo;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.management.RuntimeErrorException;
import java.security.SecureRandom;

@Service
public class AuthService {
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private JwtTokenService jwtTokenService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private RoleRepo roleRepo;



    private static final String CHARACTERS = "0123456789";
    private static final int PASSWORD_LENGTH = 6;
    private SecureRandom random = new SecureRandom();
    public void registerUser(UsersDTO usersDTO) {
        Users existingUser = userRepo.findByEmail(usersDTO.getEmail());
        if (existingUser != null) {
            if (existingUser.isEnable()) {
                throw new IllegalArgumentException("Email đã tồn tại và đã được xác thực");
            } else {
                // Gửi lại email xác thực nếu người dùng đã đăng ký nhưng chưa xác thực
                String token = jwtTokenService.generateVerificationToken(usersDTO.getEmail());
                emailService.sendVerificationEmail(usersDTO.getEmail(), "Xác Thực Email", "Please click the link below to verify your email address:\n" +
                        "http://localhost:8080/auth/verify?token=" + token);
                return;
            }
        }
        // Tạo và gán vai trò cho người dùng
        Roles userRole = roleRepo.findByName("ROLE_USER");
        if (userRole == null) {
            // Tạo vai trò mới nếu chưa tồn tại
            userRole = new Roles();
            userRole.setName("ROLE_USER");
            roleRepo.save(userRole);
        }
        RolesDTO rolesDTO = new ModelMapper().map(userRole, RolesDTO.class);
        usersDTO.setRole(rolesDTO);
        userService.create(usersDTO);

        // Gửi email xác thực
        String token = jwtTokenService.generateVerificationToken(usersDTO.getEmail());
        emailService.sendVerificationEmail(usersDTO.getEmail(), "Xác Thực Email", "Please click the link below to verify your email address:\n" +
                "http://localhost:8080/auth/verify?token=" + token);
    }

    public void forgetPassword(String email){
        String newPassword = generateRandomPassword();
        userService.updatePassword(email,newPassword);
        emailService.sendVerificationEmail(email,"Khôi phục mật khẩu", "Mật khẩu mới của bạn là: " + newPassword );
    }
    private String generateRandomPassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(index));
        }
        return sb.toString();
    }


    public void verifyEmail(String token){
        String email = jwtTokenService.getEmailFromToken(token);
        if(jwtTokenService.validateToken(token,email)){
            // Xác thực email trong cơ sở dữ liệu
            Users user = userRepo.findByEmail(email);
            if(user != null && !user.isEnable()){
                user.setEnable(true); // Cập nhật trạng thái người dùng thành hoạt động
                userRepo.save(user);
            } else {
                throw new IllegalArgumentException("Email đã được xác minh hoặc không tìm thấy người dùng");
            }
        } else {
            throw new IllegalArgumentException("Token không hợp lệ hoặc đã hết hạn");
        }
    }



}