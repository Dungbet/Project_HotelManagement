package com.example.demo.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtTokenService {
    @Value("${jwt.secret}")
    private String secretKey; // để tạo ra cái token


    // Hiệu lực của token mail
    private long verificationTokenValidity = 30;

    // Hiệu lực của token
    private long validity = 50; // 5phut
    private long refreshTokenValidity = 30 * 24 * 60;

    @Autowired
    private BlacklistTokenService blacklistTokenService;


    public String createToken(String username, int userId, String role){
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("userId", userId);
        String roleWithoutPrefix = role.startsWith("ROLE_") ? role.substring(5) : role;
        claims.put("role", roleWithoutPrefix.toLowerCase());
        Date now = new Date();
        Date exp = new Date(now.getTime() + validity*60*1000);
        return Jwts.builder().setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith( SignatureAlgorithm.HS256, secretKey)
                .compact();
    }
    public String createRefreshToken(String username, int userId,String role) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("userId", userId);
        String roleWithoutPrefix = role.startsWith("ROLE_") ? role.substring(5) : role;
        claims.put("role", roleWithoutPrefix.toLowerCase());
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshTokenValidity * 60 * 1000);
        return Jwts.builder().setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    //Xác thực token bằng cách kiểm tra xem nó có bị blacklist hay không và nếu không,
    // kiểm tra tính hợp lệ của token bằng cách phân tích claims của nó.
    public boolean isValidToken (String token){
        try{
            if (blacklistTokenService.isBlacklisted(token)){
                return false;
            }
            // nếu token không còn hiệu lực nó sẽ đẩy ra exception
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }

    // Lấy tên người dùng từ token bằng cách phân tích claims.
    // Token có thể bắt đầu với "Bearer ", nên phương thức này sẽ loại bỏ tiền tố đó.
    public String getUserName(String token) {
        // Xử lý token không chứa tiền tố "Bearer "
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.err.println("Token đã hết hạn");
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            System.err.println("Token không hợp lệ");
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            System.err.println("Token bị lỗi định dạng");
        } catch (Exception e) {
            System.err.println("Lỗi không xác định: " + e.getMessage());
        }
        return null;
    }


    //Kiểm tra xem token có sắp hết hạn không, nếu còn ít hơn 1 phút thì trả về true.
    public boolean isTokenNearExpiration(String token) {
        Date expiration = Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody().getExpiration();
        long remainingTime = expiration.getTime() - new Date().getTime();
        return remainingTime <= (1 * 60 * 1000); // Nếu còn ít hơn 1 phút
    }

    //Tạo token xác minh cho email. Token có thời gian hiệu lực ngắn hơn, dành cho việc xác minh email người dùng.
    public String generateVerificationToken(String email){
        return Jwts.builder().setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + verificationTokenValidity*60*1000))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    //Lấy email từ token bằng cách phân tích claims.
    public String getEmailFromToken (String token){
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    //Xác thực token bằng cách kiểm tra xem email có khớp với thông tin trong token không
    // và đảm bảo token không hết hạn và không bị blacklist.
    public boolean validateToken(String token, String email){
        return (email.equals(getEmailFromToken(token)) && !isTokenExpired(token) && !blacklistTokenService.isBlacklisted(token));
    }

    //Kiểm tra xem token có hết hạn không.
    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }
    // Xác minh xem token còn hoạt động hay không


}