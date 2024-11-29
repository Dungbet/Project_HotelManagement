package com.example.demo.Entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Reviews {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private int rating;
	private String comment;

	@CreatedDate
	@Column(updatable = false)
	private Date createAt;
	private String avatar;

	@ManyToOne
	@JoinColumn(name = "booking_id", nullable = false)
	@JsonBackReference("booking-reviews")
	private Bookings booking;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private Users user;

	@ManyToOne
	@JoinColumn(name = "room_id", nullable = false)
	@JsonBackReference("room-reviews")
	private Rooms room;

}
