package com.example.demo.Service;

import com.example.demo.DTO.*;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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



}
@Service
class BookingServiceImpl implements BookingService {

    @Autowired
    JwtTokenService jwtTokenService;
    @Autowired
    BookingRepo bookingRepo;

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
        return convertToDTO(bookingRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tồn tại booking có id: " + id)));

    }

    @Override
    public BookingDTO create(BookingDTO bookingDTO, String token) {
        // Get the currently logged-in user
        String username = jwtTokenService.getUserName(token);
        Users currentUser = userRepo.findByUsername(username);

        Bookings booking = new ModelMapper().map(bookingDTO, Bookings.class);

        // Set the current user
        booking.setUser(currentUser);

        // Save booking
        Bookings bookingSaved = bookingRepo.save(booking);
        return convertToDTO(bookingSaved);
    }


    @Override
    public void update(BookingDTO bookingDTO) {
        Bookings booking = bookingRepo.findById(bookingDTO.getId()).orElse(null);
        if(booking != null){
            booking.setStatus(bookingDTO.isStatus());
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


}