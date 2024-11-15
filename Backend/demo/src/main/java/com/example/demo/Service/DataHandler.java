    package com.example.demo.Service;

    import com.example.demo.DTO.MessageDTO;
    import com.example.demo.Entity.Messages;
    import com.example.demo.Service.MessageService;
    import com.fasterxml.jackson.databind.ObjectMapper;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.socket.CloseStatus;
    import org.springframework.web.socket.TextMessage;
    import org.springframework.web.socket.WebSocketMessage;
    import org.springframework.web.socket.WebSocketSession;
    import org.springframework.web.socket.handler.TextWebSocketHandler;

    import java.util.Date;
    import java.util.HashSet;
    import java.util.List;
    import java.util.Set;

    @Slf4j
    public class DataHandler extends TextWebSocketHandler {

        private static final Set<WebSocketSession> sessions = new HashSet<>();

        @Autowired
        private MessageService messageService;

        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            sessions.add(session);
            log.info("New WebSocket session established: {}", session.getId());

            // Send all previous messages to the newly connected client
            List<MessageDTO> previousMessages = messageService.getAllMessages(); // Fetch all previous messages
            for (MessageDTO msg : previousMessages) {
                session.sendMessage(new TextMessage(new ObjectMapper().writeValueAsString(msg)));
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
            sessions.remove(session);
            log.info("WebSocket session closed: {}", session.getId());
        }

        @Override
        public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
            String payload = message.getPayload().toString();
            log.info("Received WebSocket message: {}", payload);

            // Parse the incoming message
            MessageDTO receivedMessage = new ObjectMapper().readValue(payload, MessageDTO.class);

            // Save the message to the database
            Messages messageEntity = new Messages();
            messageEntity.setSender(receivedMessage.getSender());
            messageEntity.setReceiver(receivedMessage.getReceiver());
            messageEntity.setContent(receivedMessage.getContent());
            messageEntity.setTimestamp(new Date());
            messageEntity.setRead(receivedMessage.isRead());

            try {
                messageService.saveMessage(messageEntity);
            } catch (Exception e) {
                log.error("Failed to save message: {}", e.getMessage());
            }

            // Broadcast the message to all connected clients
            for (WebSocketSession webSocketSession : sessions) {
                if (webSocketSession.isOpen() && !webSocketSession.getId().equals(session.getId())) {
                    webSocketSession.sendMessage(new TextMessage(payload));
                }
            }
        }
    }
