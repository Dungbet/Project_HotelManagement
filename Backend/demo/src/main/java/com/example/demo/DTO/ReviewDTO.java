package com.example.demo.DTO;

import java.util.Date;

import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Rooms;
import com.example.demo.Entity.Users;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Data
public class ReviewDTO {

	private int id;
	private int rating;
	private String comment;
	
	@JsonFormat(pattern= "dd/MM/yyyy HH:mm", timezone = "Asia/Ho_Chi_Minh")
	private Date createAt;
	private String avatar;
	private Bookings booking;
	private Users user;
	private Rooms room;
	
	@JsonIgnore // Bỏ qua file khi dạng json 
	private MultipartFile file;
}
