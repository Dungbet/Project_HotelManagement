package com.example.demo.Service;

import com.example.demo.DTO.*;
import com.example.demo.Entity.BookingStatusHistory;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Rooms;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.BookingStatusHistoryRepo;
import com.example.demo.Repository.RoomRepo;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.management.RuntimeErrorException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public interface   BookingService {
    void delete(int id);

    PageDTO<List<BookingDTO>> getAllBooking(SearchDTO searchDTO);
    List<BookingDTO> getAll();
    CountBookingsFromDateDTO statisticsDay();
    BookingDTO getBookingById(int id);
    BookingDTO create(BookingDTO bookingDTO, String token);
    void update (BookingDTO bookingDTO);
    void updateStatus(boolean status,Integer id);
    // Các phương thức thống kê
    List<CountBookingsFromDateDTO> countBookingsFromDate(Date startDate, Date endDate);
    List<BookingDTO> getBookingsByUserId(int userId);
    void confirmCancel (BookingDTO bookingDTO, boolean confirm);
    void requestCancel (BookingDTO bookingDTO);
    public void AdminCancel(BookingDTO bookingDTO);
    void finishBooking (BookingDTO bookingDTO);
    long countAllRooms();
    long countBookedRooms();
    long countTotalRoomEmpty();
     void assignEmployeeToBooking(int bookingId, int employeeId);

    PageDTO<List<BookingDTO>> searchBookingsByEmployee(SearchDTO searchDTO, int employeeId);
     void confirmBooking(int bookingId);



}
@Service
class BookingServiceImpl implements BookingService {


    @Autowired
            @Lazy
    JwtTokenService jwtTokenService;
    @Autowired
    BookingRepo bookingRepo;

    @Autowired
    RoomRepo roomRepo;

    @Autowired
    UserRepo userRepo;
    @Autowired
    private BookingStatusHistoryRepo bookingStatusHistoryRepo;

    public void assignEmployeeToBooking(int bookingId, int employeeId) {
        // Tìm nhân viên theo ID
        Users employee = userRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // Cập nhật nhân viên vào booking
        bookingRepo.updateEmployee(bookingId, employee);
    }

    @Override
    public PageDTO<List<BookingDTO>> searchBookingsByEmployee(SearchDTO searchDTO, int employeeId) {
        if (searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if(searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Bookings> page = bookingRepo.searchBookingsByEmployee(pageRequest, employeeId);

        // Tạo đối tượng PageDTO để chứa kết quả phân trang
        PageDTO<List<BookingDTO>> pageDTO = new PageDTO<>();
        pageDTO.setTotalPages(page.getTotalPages());
        pageDTO.setTotalElements(page.getTotalElements());

        List<BookingDTO> bookingDTOS = page.get().map(u -> convertToDTO(u)).collect(Collectors.toList());
        pageDTO.setData(bookingDTOS);
        return  pageDTO;
    }

    @Override
    public void confirmBooking(int bookingId) {
        Bookings booking = bookingRepo.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));

        // Kiểm tra nếu trạng thái hiện tại là "Chờ xác nhận"
        if (booking.getBookingStatus().equals("Chờ xác nhận")) {
            String oldStatus = booking.getBookingStatus();
            Date currentTime = new Date();

            // Lưu lịch sử trạng thái
            BookingStatusHistory history = new BookingStatusHistory();
            history.setBooking(booking);
            history.setStatus("Đã xác nhận");  // Trạng thái cũ "Chờ xác nhận"
            history.setUpdatedAt(currentTime);

            // Tính toán thời gian xử lý (chênh lệch giữa thời gian xác nhận và thời gian tạo)
            long processingTimeInMinutes = (currentTime.getTime() - booking.getCreateAt().getTime()) / (1000 * 60);
            history.setProcessingTime(processingTimeInMinutes);  // Lưu thời gian xử lý vào lịch sử

            bookingStatusHistoryRepo.save(history);

            // Cập nhật trạng thái mới "Đã xác nhận"
            booking.setBookingStatus("Đã xác nhận");
            bookingRepo.save(booking);
        } else {
            throw new RuntimeException("Booking không ở trạng thái 'Chờ xác nhận'");
        }
    }


    public BookingDTO convertToDTO(Bookings bookings){
        return new ModelMapper().map(bookings, BookingDTO.class);
    }

    @Override
    public void delete(int id) {
        bookingRepo.deleteById(id);
    }

    @Override
    public PageDTO<List<BookingDTO>> getAllBooking(SearchDTO searchDTO) {
        if (searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if(searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Bookings> page = bookingRepo.findAll(pageRequest);

        // Tạo đối tượng PageDTO để chứa kết quả phân trang
        PageDTO<List<BookingDTO>> pageDTO = new PageDTO<>();
        pageDTO.setTotalPages(page.getTotalPages());
        pageDTO.setTotalElements(page.getTotalElements());

        List<BookingDTO> bookingDTOS = page.get().map(u -> convertToDTO(u)).collect(Collectors.toList());
        pageDTO.setData(bookingDTOS);
        return  pageDTO;
    }

    @Override
    public List<BookingDTO> getAll() {
        return bookingRepo.findAll().stream().map(b -> convertToDTO(b)).collect(Collectors.toList());
    }

    @Override
    public CountBookingsFromDateDTO statisticsDay() {
        return bookingRepo.statisticsDay();
    }

    @Override
    public BookingDTO getBookingById(int id) {
        //return convertToDTO(bookingRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tồn tại booking có id: " + id)));
        return convertToDTO(bookingRepo.findByIdWithRooms(id));

    }

//    @Override
//    public BookingDTO create(BookingDTO bookingDTO, String token) {
//        // Get the currently logged-in user
//        String username = jwtTokenService.getUserName(token);
//        Users currentUser = userRepo.findByUsername(username);
//        if (currentUser == null) {
//            throw new RuntimeException("User not found.");
//        }
//
//        Bookings booking = new ModelMapper().map(bookingDTO, Bookings.class);
//
//        // Set the current user
//        booking.setUser(currentUser);
//        booking.setBookingStatus("Chờ xác nhận");
//
//        if (bookingDTO.getEmployeeId() > 0) {
//            Users employee = userRepo.findById(bookingDTO.getEmployeeId())
//                    .orElseThrow(() -> new RuntimeException("Employee not found"));
//            booking.setEmployee(employee);
//        } else {
//            // If no employeeId provided (0 or negative), set employee as null
//            booking.setEmployee(null);
//        }
//
//        // Add selected rooms to booking
//        List<Rooms> selectedRooms = roomRepo.findAllById(bookingDTO.getRoomId());
//        booking.setRooms(selectedRooms);
//
//        Bookings bookingSaved = bookingRepo.save(booking);
//        return convertToDTO(bookingSaved);
//    }
@Override
public BookingDTO create(BookingDTO bookingDTO, String token) {
    // Get the currently logged-in user
    String username = jwtTokenService.getUserName(token);
    Users currentUser = userRepo.findByUsername(username);
    if (currentUser == null) {
        throw new RuntimeException("User not found.");
    }

    Bookings booking = new ModelMapper().map(bookingDTO, Bookings.class);

    // Set the current user
    booking.setUser(currentUser);
    booking.setBookingStatus("Chờ xác nhận");

    // Check if the current user has the role EMPLOYEE
    if ("ROLE_EMPLOYEE".equalsIgnoreCase(currentUser.getRole().getName())) {
        // Set the employeeId as the current user's ID
        booking.setEmployee(currentUser);
    } else if (bookingDTO.getEmployeeId() > 0) {
        // If employeeId is provided and valid, set the employee
        Users employee = userRepo.findById(bookingDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        booking.setEmployee(employee);
    } else {
        // If no valid employeeId, set employee as null
        booking.setEmployee(null);
    }

    // Add selected rooms to booking
    List<Rooms> selectedRooms = roomRepo.findAllById(bookingDTO.getRoomId());
    booking.setRooms(selectedRooms);

    Bookings bookingSaved = bookingRepo.save(booking);
    return convertToDTO(bookingSaved);
}



    @Override
    public void update(BookingDTO bookingDTO) {
        Bookings booking = bookingRepo.findById(bookingDTO.getId()).orElse(null);
        if(booking != null){
            booking.setStatus("Đã thanh toán");
            bookingRepo.save(booking);
        }
    }

    @Override
    @Transactional
    public void updateStatus(boolean status, Integer id) {
        bookingRepo.updateStatus(status,id);
    }
    @Override
    public List<CountBookingsFromDateDTO> countBookingsFromDate(Date startDate, Date endDate) {
        return bookingRepo.countBookingsFromDate(startDate, endDate);
    }

    @Override
    public List<BookingDTO> getBookingsByUserId(int userId) {
        return bookingRepo.getBookingsByUserId(userId).stream().map(b -> convertToDTO(b)).collect(Collectors.toList());
    }

    @Override
    public void requestCancel(BookingDTO bookingDTO) {
        // Tìm đơn đặt phòng
        Bookings booking = bookingRepo.findById(bookingDTO.getId())
                .orElseThrow(() -> new RuntimeException("Không tồn tại booking"));

        // Kiểm tra nếu trạng thái hiện tại chưa phải là "Yêu cầu hủy"
        if (!booking.getBookingStatus().equals("Yêu cầu hủy")) {
            booking.setBookingStatus("Yêu cầu hủy");
            bookingRepo.save(booking);
        } else {
            throw new RuntimeException("Booking đã yêu cầu hủy");
        }
    }
    @Override
    public void AdminCancel(BookingDTO bookingDTO) {
        // Tìm đơn đặt phòng
        Bookings booking = bookingRepo.findById(bookingDTO.getId())
                .orElseThrow(() -> new RuntimeException("Không tồn tại booking"));

        // Kiểm tra nếu trạng thái hiện tại chưa phải là "Yêu cầu hủy"
        if (booking.getBookingStatus().equals("Chờ xác nhận") || booking.getBookingStatus().equals("Đã xác nhận")) {
            booking.setBookingStatus("Đã hủy");
            if(booking.getStatus().equals("Đã thanh toán")){
                booking.setStatus("Hoàn tiền");
            }
            bookingRepo.save(booking);
        } else {
            throw new RuntimeException("Booking hủy thất bại");
        }
    }

    @Override
    public void finishBooking(BookingDTO bookingDTO) {
        // Tìm đơn đặt phòng
        Bookings booking = bookingRepo.findById(bookingDTO.getId())
                .orElseThrow(() -> new RuntimeException("Không tồn tại booking"));

        if (booking.getBookingStatus().equals("Đã xác nhận")) {
            // Admin từ chối hủy, chuyển lại trạng thái "Đã xác nhận"
            booking.setBookingStatus("Hoàn thành");
            bookingRepo.save(booking);
        } else {
            throw new RuntimeException("Booking không ở trạng thái đã đặt");
        }
    }

    @Override
    public long countAllRooms() {
        return roomRepo.countAllRooms();
    }

    @Override
    public long countBookedRooms() {
        long total = countAllRooms();
        long booked = countTotalRoomEmpty();
        System.out.println(total - booked);
        return total - booked;



    }

    @Override
    public long countTotalRoomEmpty() {
        Date now = new Date();
        return roomRepo.countAvailableRoomsAdmin(now,now);

    }


    @Override
    public void confirmCancel(BookingDTO bookingDTO, boolean confirm) {
        // Tìm đơn đặt phòng
        Bookings booking = bookingRepo.findById(bookingDTO.getId())
                .orElseThrow(() -> new RuntimeException("Không tồn tại booking"));

        // Chỉ xử lý đơn có trạng thái "Yêu cầu hủy"
        if (booking.getBookingStatus().equals("Yêu cầu hủy")) {
            if (confirm) {
                // Admin xác nhận hủy
                booking.setBookingStatus("Đã hủy");
                if(booking.getStatus().equals("Đã thanh toán")){
                    booking.setStatus("Hoàn tiền");
                }
                booking.setStatus("Hoàn tiền"); // nếu có hoàn tiền

                } else {
                    // Admin từ chối hủy, chuyển lại trạng thái "Đã xác nhận"
                    booking.setBookingStatus("Chờ xác nhận");
                }
            bookingRepo.save(booking);
        } else {
            throw new RuntimeException("Booking không ở trạng thái yêu cầu hủy");
        }
    }

}