package com.example.demo.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

// thay vì chèn code vào của ngta, ta có thể chặn trước, chặn sau hàm đó
@Aspect
@Component
@Slf4j
public class LogAOP {
}
