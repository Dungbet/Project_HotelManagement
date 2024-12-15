package com.example.demo.Entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Payments {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private Date paymentDate;
	private int amount;
	private String paymentMethod;
	
	@ManyToOne
	@JoinColumn(name="booking_id")
	@JsonIgnore
	private Bookings booking;
	
	
}
