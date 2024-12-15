package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class BookingStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Bookings booking;

    private String status;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    private Long processingTime;
}