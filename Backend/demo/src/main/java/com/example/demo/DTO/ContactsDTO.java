package com.example.demo.DTO;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactsDTO {

	private int id;
	private String name;
	private String email;
	private String phoneNumber;
	private String message;
	
	@JsonFormat (pattern = "dd/MM/yyy HH:mm", timezone = "Asia/Ho_Chi_Minh")
	private Date createAt;
}
