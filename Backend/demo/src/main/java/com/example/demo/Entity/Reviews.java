package com.example.demo.Entity;

import java.util.Date;

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
	@JoinColumn(name = "booking_id")
	private Bookings booking;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private Users user;

	@ManyToOne
	@JoinColumn(name = "room_id")
	private Rooms room;
}
