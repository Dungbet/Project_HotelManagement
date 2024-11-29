package com.example.demo.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.RoomsDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/room")
public class RoomController {

    private static final String CLOUDINARY_FOLDER = "Rooms";
    @Autowired
    private RoomService roomService;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> getAllRooms(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.getAllRooms(searchDTO))
                .build();
    }
    @GetMapping("/romtrong")
    public ResponseDTO<List<RoomsDTO>> getAllRoomstrong() {
        return ResponseDTO.<List<RoomsDTO>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findAvailableRooms(2))
                .build();
    }

        @GetMapping("/get-room-random")
    public ResponseDTO<List<RoomsDTO>> getRoomsByRandom(){

        return ResponseDTO.<List<RoomsDTO>>builder().status(200).msg("ok").data(roomService.getRoomsByRandom()).build();
    }

        @GetMapping("/search")
    public ResponseDTO<RoomsDTO> getById(@RequestParam int id){
        return ResponseDTO.<RoomsDTO>builder().status(200).msg("ok").data(roomService.getByid(id)).build();
    }

    @GetMapping("/check-availability")
    public ResponseDTO<Boolean> isRoomAvailable(@RequestParam("roomId") int roomId,
                                                @RequestParam("checkinDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date checkinDate,
                                                @RequestParam("checkoutDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date checkoutDate){
        boolean isAvailable = roomService.isRoomAvailable(roomId, checkinDate, checkoutDate);
        return ResponseDTO.<Boolean>builder().status(200).msg("ok").data(isAvailable).build();
    }


    @GetMapping("/sort-by-price")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> sortByPrice(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.sortByPrice(searchDTO))
                .build();
    }

    @GetMapping("/sort-by-capacity")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> sortByCapacity(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.sortByCapacity(searchDTO))
                .build();
    }

    @GetMapping("/select-by-sale")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> selectBySale(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.selectBySale(searchDTO))
                .build();
    }
    @GetMapping("/available-rooms")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> getAvailableRooms(
            @RequestParam("checkinDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date checkinDate,
            @RequestParam("checkoutDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date  checkoutDate,@RequestParam("numAdults") int numAdults,
            @RequestParam("numChildren") int numChildren,

            SearchDTO searchDTO) {
        System.out.println("Check-in Date: " + checkinDate);
        System.out.println("Check-out Date: " + checkoutDate);

        int totalGuest = numAdults + numChildren;
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findAvailableRooms(searchDTO, checkinDate, checkoutDate,totalGuest))
                .build();
    }
//
//
//    @GetMapping("/get-all")
//    public ResponseDTO<List<RoomsDTO>> getAll(){
//        return ResponseDTO.<List<RoomsDTO>>builder().status(200).msg("ok").data(roomService.getAll()).build();
//    }



}