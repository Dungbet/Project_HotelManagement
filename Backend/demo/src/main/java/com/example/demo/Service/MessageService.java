package com.example.demo.Service;

import com.example.demo.DTO.MessageDTO;
import com.example.demo.Entity.Messages;
import com.example.demo.Repository.MessageRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

public interface MessageService {
    List<MessageDTO> getMessagesByReceiver(String receiver);

    void saveMessage(Messages message);

    void markAsRead(int id);

    long getUnreadMessageCount(String receiver);
    public List<MessageDTO> getAllMessages();

}

@Service
class MessageServiceIpml implements MessageService {


    @Autowired
    private MessageRepo messageRepository;

    private final ModelMapper modelMapper = new ModelMapper();

    @Override
    public List<MessageDTO> getMessagesByReceiver(String receiver) {
        List<Messages> messages = messageRepository.findByReceiverOrderByTimestampDesc(receiver);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void saveMessage(Messages message) {
        messageRepository.save(message);
    }

    @Override
    public void markAsRead(int id) {
        Messages message = messageRepository.findById(id).orElse(null);
        if (message != null) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }

    @Override
    public long getUnreadMessageCount(String receiver) {
        return messageRepository.countByReceiverAndIsRead(receiver, false);
    }

    @Override
    public List<MessageDTO> getAllMessages() {
        return messageRepository.findAll().stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    private MessageDTO convertToDTO(Messages message) {
        return modelMapper.map(message, MessageDTO.class);
    }
}

