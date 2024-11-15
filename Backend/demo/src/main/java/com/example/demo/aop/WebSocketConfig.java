package com.example.demo.aop;

import com.example.demo.Service.DataHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements  WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(getDataHandler(), "/data").setAllowedOrigins("*");
    }

    @Bean
    DataHandler getDataHandler() {
        return new DataHandler();
    }

}