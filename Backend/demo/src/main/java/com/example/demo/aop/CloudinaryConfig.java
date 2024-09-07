package com.example.demo.aop;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        // Thay thế bằng các thông số thực tế của bạn
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dgpmmjpmd",
                "api_key", "931258452576318",
                "api_secret", "Rdl7IJMjnDHk4SkhWTZHi4fPLyk"
        ));
    }
}
