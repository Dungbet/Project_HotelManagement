package com.example.demo.Controller;

import com.example.demo.DTO.*;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.UserRepo;
import com.example.demo.Service.BookingService;
import com.example.demo.Service.JwtTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/booking")
public class BookingController {

    @Autowired
    JwtTokenService jwtTokenService;
    @Autowired
    BookingService bookingService;

    @Autowired
    UserRepo userRepo;

    @GetMapping("/{id}")
    public ResponseDTO<BookingDTO> getBookingById(@PathVariable int id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseDTO.<BookingDTO>builder()
                .status(200)
                .data(booking)
                .msg("Booking fetched successfully")
                .build();
    }

        @GetMapping("/get-all")
    public ResponseDTO<List<BookingDTO>> getAll(){
        return ResponseDTO.<List<BookingDTO>>builder().status(200).data(bookingService.getAll()).msg("ok").build();
    }
//
    @PostMapping("/create")
    public ResponseDTO<BookingDTO> createBooking(
            @RequestBody BookingDTO bookingDTO,
            @RequestHeader("Authorization") String token) {
        BookingDTO createdBooking = bookingService.create(bookingDTO, token);
        return ResponseDTO.<BookingDTO>builder().status(200).data(createdBooking).msg("Booking created successfully").build();
    }

        @GetMapping("/bookings")
    public ResponseDTO<List<BookingDTO>> getUserBookings(@RequestHeader("Authorization") String token) {
        String username = jwtTokenService.getUserName(token);
        System.out.println("Username: " +username);
        // Parse the token to get the user ID
        Users user = userRepo.findByUsername(username);
        return ResponseDTO.<List<BookingDTO>>builder().status(200).data( bookingService.getBookingsByUserId(user.getId())).msg("ok").build();

    }

        @GetMapping("/search")
    public ResponseDTO<BookingDTO> searchById(@RequestParam int id){
        return ResponseDTO.<BookingDTO>builder().status(200).msg("ok").data(bookingService.getBookingById(id)).build();
    }

//
//    @GetMapping("/")
//    public ResponseDTO<PageDTO<List<BookingDTO>>> getAllBooking(@RequestParam int page, @RequestParam int size){
//        SearchDTO searchDTO = new SearchDTO();
//        searchDTO.setCurrentPage(page);
//        searchDTO.setSize(size);
//        PageDTO<List<BookingDTO>> listPageDTO = bookingService.getAllBooking(searchDTO);
//        return ResponseDTO.<PageDTO<List<BookingDTO>>>builder().status(200).data(listPageDTO).msg("ok").build();
//    }


//
//    @PostMapping("update-status")
//    public ResponseDTO<Void> updateStatus(@RequestParam("bookingStatus") boolean status, @RequestParam("bookingId")Integer bookingId){
//        bookingService.updateStatus(status, bookingId);
//        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
//
//    }
//

//
//
//
//    @GetMapping("/count-by-date")
//    public ResponseDTO<List<CountBookingsFromDateDTO>> countBookingsFromDate(@RequestParam("startDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date startDate,@RequestParam("endDate") @DateTimeFormat(pattern = "dd/MM/yyyy")  Date endDate) {
//        List<CountBookingsFromDateDTO> count = bookingService.countBookingsFromDate(startDate, endDate);
//        return ResponseDTO.<List<CountBookingsFromDateDTO>>builder().status(200).data(count).msg("ok").build();
//    }
//    @GetMapping("/statistics-day")
//    public ResponseDTO<CountBookingsFromDateDTO> StatisticsDay() {
//        CountBookingsFromDateDTO count = bookingService.statisticsDay();
//        return ResponseDTO.<CountBookingsFromDateDTO>builder().status(200).data(count).msg("ok").build();
//    }
//




}