package com.example.demo.DTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor

public class MessageDTO {

    private int id;
    private String sender; // Tên người gửi
    private String receiver; // Tên người nhận
    private String content; // Nội dung tin nhắn

    @JsonFormat(pattern = "dd/MM/yyy HH:mm", timezone = "Asia/Ho_Chi_Minh")
    private Date timestamp;
    private boolean isRead;


    // Constructor for creating MessageDTO from entity
    public MessageDTO(int id, String sender, String receiver, String content, Date timestamp, boolean isRead) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }
}