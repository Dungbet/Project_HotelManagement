package com.example.demo.DTO;

import java.util.Date;
import java.util.List;

import com.example.demo.Entity.Rooms;
import com.example.demo.Entity.Users;
import com.fasterxml.jackson.annotation.JsonFormat;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;


@Data
public class BookingDTO {

	private int id;
	@JsonFormat(pattern = "dd/MM/yyy", timezone = "Asia/Ho_Chi_Minh" )
	private Date checkInDate;
	@JsonFormat(pattern = "dd/MM/yyy", timezone = "Asia/Ho_Chi_Minh" )
	private Date checkOutDate;
	private int guest;
	private int numChildren;
	private double totalAmount;
	private String status;
	private String bookingStatus;
	private Users user;
	// Danh sách ID phòng, thường dùng khi tạo booking hoặc gửi yêu cầu từ client
	private List<Integer> roomId;
	@JsonIgnoreProperties({"bookings"})
	private List<Rooms> rooms;

	// Booking-specific information
	private String bookingName;
	private String bookingEmail;
	private String bookingPhone;
	private Date createAt;
	private Date updateAt;

}
