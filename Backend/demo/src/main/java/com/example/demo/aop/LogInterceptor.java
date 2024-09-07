//package com.example.demo.aop;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Component;
//import org.springframework.web.servlet.HandlerInterceptor;
//
//// Đóng vai trò là bộ lọc, chặn các request gửi lên và response trả về
//// check đường dẫn gửi lên là đường dẫn nào và quyền truy cập vào đường dẫn là gì (vai trò người dùng)
//@Component
//@Slf4j
//public class LogInterceptor implements HandlerInterceptor {
//    //check request trước khi gọi các hàm trong controler
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//
//        log.info("INTERCEPTOR");
//        log.info(request.getRemoteAddr());
////        log.info
//        // true cho đi tiếp
//        return true;
//    }
//}
