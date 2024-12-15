package com.example.demo.Repository;

import com.example.demo.Entity.BookingStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingStatusHistoryRepo extends JpaRepository<BookingStatusHistory, Integer> {
}
