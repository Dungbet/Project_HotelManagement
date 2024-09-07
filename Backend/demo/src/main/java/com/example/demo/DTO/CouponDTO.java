package com.example.demo.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class CouponDTO {
    private int id;
    private String code;
    private double discountPercentage;
    @JsonFormat(pattern = "dd/MM/yyy HH:mm", timezone = "Asia/Ho_Chi_Minh")
    private Date expiryDate;
}