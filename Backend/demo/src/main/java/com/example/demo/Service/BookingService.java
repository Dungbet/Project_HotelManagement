package com.example.demo.Service;

import com.example.demo.DTO.*;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Rooms;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.RoomRepo;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
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




}
@Service
class BookingServiceImpl implements BookingService {

    @Autowired
    JwtTokenService jwtTokenService;
    @Autowired
    BookingRepo bookingRepo;

    @Autowired
    RoomRepo roomRepo;

    @Autowired
    UserRepo userRepo;

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

    @Override
    public BookingDTO create(BookingDTO bookingDTO, String token) {
        // Get the currently logged-in user
        String username = jwtTokenService.getUserName(token);
        Users currentUser = userRepo.findByUsername(username);
        if (currentUser == null) {
            throw new RuntimeException("User not found.");
        }

        System.out.println("Room IDs: " + bookingDTO.getRoomId());  // Add logging here

        Bookings booking = new ModelMapper().map(bookingDTO, Bookings.class);
        // Set the current user
        booking.setUser(currentUser);
        booking.setBookingStatus("Đã đặt");

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
        if (booking.getBookingStatus().equals("Đã đặt")) {
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

        if (booking.getBookingStatus().equals("Đã đặt")) {
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
                    booking.setBookingStatus("Đã đặt");
                }
            bookingRepo.save(booking);
        } else {
            throw new RuntimeException("Booking không ở trạng thái yêu cầu hủy");
        }
    }

}