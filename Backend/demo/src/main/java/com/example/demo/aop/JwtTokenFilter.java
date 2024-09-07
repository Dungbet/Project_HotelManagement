package com.example.demo.aop;


import com.example.demo.Service.BlacklistTokenService;
import com.example.demo.Service.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Loc
@Component
@Slf4j
public class JwtTokenFilter extends OncePerRequestFilter {
    @Autowired
    JwtTokenService jwtTokenService;

    @Autowired
    @Lazy
    UserDetailsService userDetailsService;

    @Autowired
    BlacklistTokenService blacklistTokenService;

    // Đọc token xác minh xem còn hiệu lực hay không
    // Đọc token ra (Đọc header-key)
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        System.out.println("JwtTokenFilter is called");
        // Đọc header authorization
        String bearerToken = request.getHeader("Authorization");

        if(bearerToken != null && bearerToken.startsWith("Bearer ")){
            String token = bearerToken.substring(7);
            System.out.println("Token: " + token);

            if (!jwtTokenService.isValidToken(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            String username = jwtTokenService.getUserName(token);
            if(username != null){
                //Token valid, create a authentication
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Tthong tin dnag nhap/ matkhau / list quyen
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails,
                        "",userDetails.getAuthorities());
                // Luu vao secutity context
                //Gia lap security
                // Co anthen roi thi setAuthentication coi nhu la da dang nhap
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Refresh token nếu gần hết hạn
                if (jwtTokenService.isTokenNearExpiration(token)) {
                    String newAccessToken = jwtTokenService.createToken(username);
                    String newRefreshToken = jwtTokenService.createRefreshToken(username);
                    response.setHeader("Authorization", "Bearer " + newAccessToken);
                    response.setHeader("Refresh-Token", "Bearer " + newRefreshToken);
                }
            }
        }
        // cho request đi
        filterChain.doFilter(request, response);
    }
}