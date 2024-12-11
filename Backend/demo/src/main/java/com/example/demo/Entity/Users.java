package com.example.demo.Entity;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@EqualsAndHashCode (callSuper = true)
public class Users extends TimeAuditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	@Column(unique = true)
	private String username;
	private String password;
	@Column(unique = true)
	private String email;
	private String phoneNumber;
	private String name;
	private String address;
	private boolean gender;
	private String avatar;
	private String avatarPublicId;
	private boolean enable;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "role_id", nullable = false)
	private Roles role;

	// Quan hệ với manager: Mỗi nhân viên có thể có một manager
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "manager_id")
	@JsonIgnore // Không tuần tự hóa
	private Users manager;

	@OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
	@JsonIgnore // Không tuần tự hóa
	private List<Users> employees;

	@OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
	@JsonIgnore // Không tuần tự hóa danh sách bookings
	private List<Bookings> handledBookings;






}
