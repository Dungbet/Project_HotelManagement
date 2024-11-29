package com.example.demo.Entity;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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
	private int numChildren;
	private String status;
	private String bookingStatus;


	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name = "user_id")
	private Users user;

	@ManyToMany(cascade = CascadeType.PERSIST)
	@JoinTable(
			name = "booking_rooms", // Join table to store the relationship
			joinColumns = @JoinColumn(name = "booking_id"),
			inverseJoinColumns = @JoinColumn(name = "room_id")
	)
	private List<Rooms> rooms;

	@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference("booking-reviews")
	private List<Reviews> reviews;

	// Booking-specific information
	private String bookingName;
	private String bookingEmail;
	private String bookingPhone;
}
