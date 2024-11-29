package com.example.demo.aop;

import com.example.demo.Entity.Hotels;
import com.example.demo.Entity.Roles;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.HotelRepo;
import com.example.demo.Repository.RoleRepo;
import com.example.demo.Repository.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@Slf4j
public class ApplicationInitConfig {

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private HotelRepo hotelRepo;

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            // Kiểm tra xem username "admin" có tồn tại không
            Users user = userRepo.findByUsername("admin");
            if (user == null) {
                // Tạo người dùng admin mới
                user = new Users();
                user.setUsername("admin");
                user.setPassword(new BCryptPasswordEncoder().encode("admin"));
                user.setEnable(true);

                // Tạo và gán vai trò cho người dùng
                Roles adminRole = roleRepo.findByName("ROLE_ADMIN");
                if (adminRole == null) {
                    // Tạo vai trò mới nếu chưa tồn tại
                    adminRole = new Roles();
                    adminRole.setName("ROLE_ADMIN");
                    roleRepo.save(adminRole);
                }
                user.setRole(adminRole);

                userRepo.save(user);
                log.info("Người dùng 'admin' đã được tạo với mật khẩu mặc định: admin. Vui lòng thay đổi mật khẩu.");
            } else {
                log.info("Người dùng 'admin' đã tồn tại.");
            }

            // Kiểm tra và tạo hotel mặc định
            String defaultHotelName = "Luxe Oasis";
            Hotels hotel = hotelRepo.findByName(defaultHotelName);
            if (hotel == null) {
                hotel = new Hotels();
                hotel.setName(defaultHotelName);
                hotel.setAddress("Thanh Vân - Hiệp Hòa - Bắc Giang");
                hotel.setPhoneNumber("0974.410.454");
                hotel.setEmail("contact@hotel-luxe-oasis.com");
                hotelRepo.save(hotel);
                log.info("Hotel mặc định đã được tạo: {}", defaultHotelName);
            } else {
                log.info("Hotel '{}' đã tồn tại.", defaultHotelName);
            }
        };
    }
}
