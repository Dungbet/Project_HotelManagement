package com.example.demo.DTO;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BookedRoomDTO {
    private RoomsDTO room;
    private List<BookingDTO> bookings;
}
