package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CountBookingsFromDateDTO {
    private Date createAt;          // Date of booking creation
    private long countBooking;      // Number of bookings
    private double totalAmount;
}
