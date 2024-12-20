package com.example.demo.aop;

import com.example.demo.Service.BlacklistTokenService;
import com.example.demo.Service.JwtTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.authentication.configuration.EnableGlobalAuthentication;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Autowired
    @Lazy
    UserDetailsService userDetailsService;

    @Autowired
    JwtTokenFilter jwtTokenFilter;
    @Autowired
    JwtTokenService jwtTokenService;

    @Autowired
    BlacklistTokenService blacklistTokenService;

    @Autowired
    public void config(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(new BCryptPasswordEncoder());
    }

    //AuthenticationManager là một interface, nó chịu trách nhiệm xác thực thông tin đăng nhập (username và password)
    //và quyết định liệu người dùng có được phép truy cập hay không.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Kiểm tra đường dẫn
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(
                        requests -> requests
//                                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                                .requestMatchers("/admin/booking/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER","ROLE_EMPLOYEE")
                                .requestMatchers("/admin/payment/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER","ROLE_EMPLOYEE")
                                .requestMatchers("/admin/contact/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER","ROLE_EMPLOYEE")
                                .requestMatchers("/admin/review/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER","ROLE_EMPLOYEE")
                                .requestMatchers("/admin/room/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER", "ROLE_EMPLOYEE")

                                .requestMatchers("/admin/coupon/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER")
                                .requestMatchers("/admin/user/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER")
                                .requestMatchers("/admin/role/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER")
//                                .requestMatchers("/auth/me/**").hasAnyAuthority("ROLE_ADMIN","ROLE_MANAGER","ROLE_EMPLOYEE")
                                .requestMatchers("/booking/**").authenticated()
                                .requestMatchers("/role/**").permitAll()
                                .requestMatchers("/auth/**").permitAll()
                                .requestMatchers("/**").permitAll()

                                .anyRequest().permitAll())
                .httpBasic(Customizer.withDefaults())
                .csrf().disable()
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }



}