package com.example.demo.Repository;

import com.example.demo.Entity.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Messages, Integer> {

    List<Messages> findByReceiverOrderByTimestampDesc(String receiver);

    long countByReceiverAndIsRead(String receiver, boolean isRead);
    List<Messages> findAll();
}