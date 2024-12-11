package com.example.demo.DTO;

import com.example.demo.Entity.Roles;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class UsersDTO {

	private int id;
	private String username;
	private String password;
	private String email;
	private String phoneNumber;
	private String name;
	private String address;
	private boolean gender;
	private String avatar;
	private String avatarPublicId;
	private RolesDTO role;
	private boolean enable;
	private int managerId;

	@JsonIgnore
	private MultipartFile file;
	private List<Integer> handledBookingIds; // Danh sách ID các booking đã xử lý

}
