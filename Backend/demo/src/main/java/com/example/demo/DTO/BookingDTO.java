package com.example.demo.DTO;

import java.util.Date;

import com.example.demo.Entity.Rooms;
import com.example.demo.Entity.Users;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;


@Data
public class BookingDTO {

	private int id;
	@JsonFormat(pattern = "dd/MM/yyy", timezone = "Asia/Ho_Chi_Minh" )
	private Date checkInDate;
	@JsonFormat(pattern = "dd/MM/yyy", timezone = "Asia/Ho_Chi_Minh" )
	private Date checkOutDate;
	private int guest;
	private double totalAmount;
	private boolean status;
	private Users user;
	private Rooms room;
	// Booking-specific information
	private String bookingName;
	private String bookingEmail;
	private String bookingPhone;
}
