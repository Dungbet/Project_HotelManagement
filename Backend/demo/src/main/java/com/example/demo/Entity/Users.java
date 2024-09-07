package com.example.demo.Entity;

import java.util.Date;
import java.util.List;

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
}
