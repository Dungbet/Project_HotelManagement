package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Rooms {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private String name;
	@Column(unique = true)
	private String roomNumber;
	private String roomImg;
	private double price;
	private String description;
	private int bed;
	private double size;
	private double discount;
	private double discountedPrice;
	private int capacity;
	private String view;
	private String roomImgPublicId;

	@ManyToOne
	@JoinColumn(name="hotel_id")
	private Hotels hotels;

	@ManyToOne
	@JoinColumn(name="category_id")
	private RoomCategories category;
}