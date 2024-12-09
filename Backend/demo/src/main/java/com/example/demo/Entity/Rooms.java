package com.example.demo.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

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

	@OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<RoomImage> roomImages; // Danh sách các ảnh bổ sung


	@ManyToOne
	@JoinColumn(name="hotel_id")
	private Hotels hotels;

	@ManyToOne
	@JoinColumn(name="category_id")
	private RoomCategories category;


	@ManyToMany(mappedBy = "rooms") // 'rooms' is the property name in Bookings entity
	@JsonIgnore
	private List<Bookings> bookings;

	@OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonBackReference("room-reviews")
	private List<Reviews> reviews;


}