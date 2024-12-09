package com.example.demo.Controller;

import com.cloudinary.Cloudinary;
import com.example.demo.DTO.*;
import com.example.demo.Service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/admin/room")
public class AdminRoomController {

    private static final String CLOUDINARY_FOLDER = "Rooms";
    @Autowired
    private RoomService roomService;

    @Autowired
    private Cloudinary cloudinary;



    @GetMapping("/available-rooms")
    public ResponseDTO<List<RoomsDTO>> getAvailableRooms(
            @RequestParam("checkinDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date checkinDate,
                @RequestParam("checkoutDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date  checkoutDate) {

        return ResponseDTO.<List<RoomsDTO>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findAvailableRoomsAdmin(checkinDate, checkoutDate))
                .build();
    }
    @GetMapping("/most-rooms")
    public ResponseDTO<List<MostBookedRoomsDTO>> findMostBookedRooms( @RequestParam("startDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date startDate,
                                                                      @RequestParam("endDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date  endDate) {

        return ResponseDTO.<List<MostBookedRoomsDTO>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findMostBookedRooms(startDate, endDate))
                .build();
    }
    @GetMapping("/min-rooms")
    public ResponseDTO<List<MostBookedRoomsDTO>> findMinBookedRooms() {

        return ResponseDTO.<List<MostBookedRoomsDTO>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findMinBookedRooms())
                .build();
    }
    @GetMapping("/booked-rooms")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> bookedRoom(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findBookedRooms(searchDTO))
                .build();
    }@GetMapping("/empty-rooms")
    public ResponseDTO<PageDTO<List<RoomsDTO>>> emptyRoom(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
                .status(200)
                .msg("ok")
                .data(roomService.findEmptyRooms(searchDTO))
                .build();
    }


    @PostMapping("/create")
    public ResponseDTO<RoomsDTO> create(@ModelAttribute RoomsDTO roomsDTO) throws IOException {
        roomService.create(roomsDTO);

        return ResponseDTO.<RoomsDTO>builder().status(200).msg("Room created successfully") .build();
    }



    @PutMapping("/update/{id}")
    public ResponseDTO<RoomsDTO> update(
            @PathVariable int id,
            @ModelAttribute RoomsDTO roomsDTO) throws IOException {
        // Xác thực và set ID vào DTO
        roomsDTO.setId(id);

        // Gọi service update
        roomService.update(roomsDTO);

        return ResponseDTO.<RoomsDTO>builder()
                .status(200)
                .msg("Room updated successfully")
                .build();
    }





    @GetMapping("/search")
    public ResponseDTO<RoomsDTO> getById(@RequestParam int id){
        return ResponseDTO.<RoomsDTO>builder().status(200).msg("ok").data(roomService.getByid(id)).build();
    }

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

        @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        roomService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }

        @PutMapping("/update-discount")
    public void updateRoomDiscount(@RequestParam int roomId, @RequestParam double discount) {
        roomService.updateRoomDiscount(roomId, discount);
    }

    @PutMapping("/update-all-discounts")
    public void updateAllRoomsDiscount(@RequestParam double discount) {
        roomService.updateAllRoomsDiscount(discount);
    }
//
//    @GetMapping("/check-availability")
//    public ResponseDTO<Boolean> isRoomAvailable(@RequestParam("roomId") int roomId,
//                                                @RequestParam("checkinDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date checkinDate,
//                                                @RequestParam("checkoutDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date checkoutDate
//
//    ){
//        boolean isAvailable = roomService.isRoomAvailable(roomId, checkinDate, checkoutDate);
//        return ResponseDTO.<Boolean>builder().status(200).msg("ok").data(isAvailable).build();
//    }
//
//
//
//
//
//
//    @GetMapping("/get-room-random")
//    public ResponseDTO<List<RoomsDTO>> getRoomsByRandom(){
//
//        return ResponseDTO.<List<RoomsDTO>>builder().status(200).msg("ok").data(roomService.getRoomsByRandom()).build();
//    }
//
//
//
//
//
//
//
//    @GetMapping("/sort-by-price")
//    public ResponseDTO<PageDTO<List<RoomsDTO>>> sortByPrice(@RequestParam int page, @RequestParam int size) {
//        SearchDTO searchDTO = new SearchDTO();
//        searchDTO.setCurrentPage(page);
//        searchDTO.setSize(size);
//        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
//                .status(200)
//                .msg("ok")
//                .data(roomService.sortByPrice(searchDTO))
//                .build();
//    }
//
//    @GetMapping("/sort-by-capacity")
//    public ResponseDTO<PageDTO<List<RoomsDTO>>> sortByCapacity(@RequestParam int page, @RequestParam int size) {
//        SearchDTO searchDTO = new SearchDTO();
//        searchDTO.setCurrentPage(page);
//        searchDTO.setSize(size);
//        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
//                .status(200)
//                .msg("ok")
//                .data(roomService.sortByCapacity(searchDTO))
//                .build();
//    }
//
//    @GetMapping("/select-by-sale")
//    public ResponseDTO<PageDTO<List<RoomsDTO>>> selectBySale(@RequestParam int page, @RequestParam int size) {
//        SearchDTO searchDTO = new SearchDTO();
//        searchDTO.setCurrentPage(page);
//        searchDTO.setSize(size);
//        return ResponseDTO.<PageDTO<List<RoomsDTO>>>builder()
//                .status(200)
//                .msg("ok")
//                .data(roomService.selectBySale(searchDTO))
//                .build();
//    }
//
//    @PutMapping("/update-discount")
//    public void updateRoomDiscount(@RequestParam int roomId, @RequestParam double discount) {
//        roomService.updateRoomDiscount(roomId, discount);
//    }
//
//    @PutMapping("/update-all-discounts")
//    public void updateAllRoomsDiscount(@RequestParam double discount) {
//        roomService.updateAllRoomsDiscount(discount);
//    }
}