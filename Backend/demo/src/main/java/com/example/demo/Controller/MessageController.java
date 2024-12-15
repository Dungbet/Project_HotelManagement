package com.example.demo.Controller;

import com.example.demo.DTO.MessageDTO;
import com.example.demo.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/user/{username}")
    public List<MessageDTO> getMessagesByUser(@PathVariable("username") String username) {
        return messageService.getMessagesByReceiver(username);
    }

    @PostMapping("/mark-as-read/{id}")  
    public void markMessageAsRead(@PathVariable("id") int id) {
        messageService.markAsRead(id);
    }

    @GetMapping("/unread-count/{receiver}")
    public long getUnreadMessageCount(@PathVariable("receiver") String receiver) {
        return messageService.getUnreadMessageCount(receiver);
    }
}