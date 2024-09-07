package com.example.demo.Entity;

import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@EqualsAndHashCode(callSuper = true)
public class Bookings extends TimeAuditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private Date checkInDate;
	private Date  checkOutDate;
	private double totalAmount;
	private int guest;
	private boolean status;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private Users user;

	@ManyToOne
	@JoinColumn(name = "room_id")
	private Rooms room;

	// Booking-specific information
	private String bookingName;
	private String bookingEmail;
	private String bookingPhone;
}
