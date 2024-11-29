package com.example.demo.DTO;

import com.example.demo.Entity.Hotels;
import com.example.demo.Entity.RoomCategories;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class RoomsDTO {
	private int id;
	private String name;
	private String roomNumber;
	private String roomImg;
	private double price;
	private String description;
	private int bed;
	private double size;
	private int capacity;
	private String view;
	private Hotels hotels;
	private double discount;
	private double discountedPrice;
	private RoomCategories category;
	private String roomImgPublicId;


	@JsonIgnore
	private MultipartFile file;
}