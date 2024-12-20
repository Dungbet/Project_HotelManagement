package com.example.demo.Controller;

import com.example.demo.DTO.*;
import com.example.demo.Service.BookingService;
import com.example.demo.Service.Jobscheduler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/admin/booking")
public class AdminBookingController {

    @Autowired
    BookingService bookingService;

    @Autowired
    Jobscheduler jobscheduler;


    @PutMapping("/update-employee")
    public ResponseDTO<BookingDTO> update(@RequestParam int bookingId,@RequestParam int employeeId) {
        bookingService.assignEmployeeToBooking(bookingId,employeeId);
        return ResponseDTO.<BookingDTO>builder().status(200).msg("ok").build();
    }


    @GetMapping("/count-room-booked")
    public ResponseDTO<Long> countBooked (){
        return ResponseDTO.<Long>builder().status(200).data(bookingService.countBookedRooms()).msg("ok").build();
    }

    @GetMapping("/count-all-room")
    public ResponseDTO<Long> countAllRoom(){
        return ResponseDTO.<Long>builder().status(200).data(bookingService.countAllRooms()).msg("ok").build();
    }
    @GetMapping("/count-room-empty")
    public ResponseDTO<Long> countRoomEmpty (){
        return ResponseDTO.<Long>builder().status(200).data(bookingService.countTotalRoomEmpty()).msg("ok").build();
    }

    @PostMapping("/create")
    public ResponseDTO<BookingDTO> createBooking(
            @RequestBody BookingDTO bookingDTO,
            @RequestHeader("Authorization") String token) {
        BookingDTO createdBooking = bookingService.create(bookingDTO, token);
        return ResponseDTO.<BookingDTO>builder().status(200).data(createdBooking).msg("Booking created successfully").build();
    }


    @PutMapping("/update")
    public ResponseDTO<BookingDTO> update(@RequestBody BookingDTO bookingDTO) {
        bookingService.update(bookingDTO);
        return ResponseDTO.<BookingDTO>builder().status(200).msg("ok").data(bookingService.getBookingById(bookingDTO.getId())).build();
    }

    @PutMapping("/cancel-booking")
    public ResponseDTO<BookingDTO> AdminCancel(@RequestBody BookingDTO bookingDTO) {
        bookingService.AdminCancel(bookingDTO);
        return ResponseDTO.<BookingDTO>builder().status(200).msg("ok").data(bookingService.getBookingById(bookingDTO.getId())).build();
    }
    @PutMapping("/confirm-cancel")
    public ResponseDTO<BookingDTO> confirmCancel(@RequestBody BookingDTO bookingDTO, @RequestParam boolean confirm) {
        bookingService.confirmCancel(bookingDTO, confirm);
        return ResponseDTO.<BookingDTO>builder().status(200).msg("ok").data(bookingService.getBookingById(bookingDTO.getId())).build();
    }
    @PutMapping("/finish-booking")
    public ResponseDTO<BookingDTO> finishBooking(@RequestBody BookingDTO bookingDTO) {
        bookingService.finishBooking(bookingDTO);
        return ResponseDTO.<BookingDTO>builder().status(200).msg("ok").data(bookingService.getBookingById(bookingDTO.getId())).build();
    }

    @GetMapping("/")
    public ResponseDTO<PageDTO<List<BookingDTO>>> getAllBooking(@RequestParam int page, @RequestParam int size) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        PageDTO<List<BookingDTO>> listPageDTO = bookingService.getAllBooking(searchDTO);
        return ResponseDTO.<PageDTO<List<BookingDTO>>>builder().status(200).data(listPageDTO).msg("ok").build();
    }
    @GetMapping("/search-booking-by-employee")
    public ResponseDTO<PageDTO<List<BookingDTO>>> searchBookingsByEmployee(@RequestParam int page, @RequestParam int size, @RequestParam int employeeId) {
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        PageDTO<List<BookingDTO>> listPageDTO = bookingService.searchBookingsByEmployee(searchDTO, employeeId);
        return ResponseDTO.<PageDTO<List<BookingDTO>>>builder().status(200).data(listPageDTO).msg("ok").build();
    }
    @GetMapping("/get-all-booking-by-employee")
    public ResponseDTO<List<BookingDTO>> getAllBookingsByEmployee(@RequestParam int employeeId) {

        List<BookingDTO> listPageDTO = bookingService.getAllBookingsByEmployee( employeeId);
        return ResponseDTO.<List<BookingDTO>>builder().status(200).data(listPageDTO).msg("ok").build();
    }

    @PostMapping("update-status")
    public ResponseDTO<Void> updateStatus(@RequestParam("bookingStatus") boolean status, @RequestParam("bookingId") Integer bookingId) {
        bookingService.updateStatus(status, bookingId);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }
    @PutMapping("/confirm-booking-employee")
    public ResponseDTO<Void> confirmBooking(@RequestParam("bookingId") Integer bookingId) {
        bookingService.confirmBooking(bookingId);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }


    @GetMapping("/statistics-day")
    public ResponseDTO<CountBookingsFromDateDTO> StatisticsDay() {
        CountBookingsFromDateDTO count = bookingService.statisticsDay();
        return ResponseDTO.<CountBookingsFromDateDTO>builder().status(200).data(count).msg("ok").build();
    }



    @GetMapping("/count-by-date")
    public ResponseDTO<List<CountBookingsFromDateDTO>> countBookingsFromDate(
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date endDate) {
        List<CountBookingsFromDateDTO> count = bookingService.countBookingsFromDate(startDate, endDate);
        return ResponseDTO.<List<CountBookingsFromDateDTO>>builder().status(200).data(count).msg("ok").build();
    }



    @GetMapping("/export-excel")
    public void exportExcel(
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date endDate,
            HttpServletResponse response) {
        try {
            // Gọi phương thức xuất Excel
            jobscheduler.exportExcel(startDate, endDate);

            // Đọc file Excel đã tạo
            File file = new File("temp.xlsx");
            FileInputStream fileInputStream = new FileInputStream(file);

            // Cấu hình phản hồi để tải xuống file
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=temp.xlsx");

            // Ghi file vào phản hồi
            OutputStream outputStream = response.getOutputStream();
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
            outputStream.close();
            fileInputStream.close();

            // Xóa file tạm sau khi gửi phản hồi
            file.delete();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        BookingDTO booking = bookingService.getBookingById(id);
        // Kiểm tra trạng thái thanh toán
        if (booking.getBookingStatus().equals("Đã hoàn thành")) {
            return ResponseDTO.<Void>builder()
                    .status(400)
                    .msg("Không thể xóa phòng đã hoàn thành")
                    .build();
        }

        // Nếu chưa thanh toán, tiến hành xóa
        bookingService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("Đặt phòng đã được xóa").build();
    }
}
