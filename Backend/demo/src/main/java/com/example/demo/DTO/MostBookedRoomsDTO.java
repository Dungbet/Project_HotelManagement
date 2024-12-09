package com.example.demo.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MostBookedRoomsDTO {
    private String url;
    private String nameRooms;
    private String numberRoom;
    private double price;
    private long countBooked;
}
