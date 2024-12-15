package com.example.demo.DTO;

import com.example.demo.Entity.Bookings;
import lombok.Data;

import java.util.Date;

@Data
public class PaymentsDTO {

	private int id;
	private Date paymentDate;
	private int amount;
	private String paymentMethod;
	private BookingDTO booking;
}
