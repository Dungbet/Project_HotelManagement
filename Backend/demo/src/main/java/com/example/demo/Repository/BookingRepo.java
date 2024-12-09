package com.example.demo.Repository;

import com.example.demo.DTO.CountBookingsFromDateDTO;
import com.example.demo.DTO.MostBookedRoomsDTO;
import com.example.demo.Entity.Bookings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

public interface BookingRepo extends JpaRepository<Bookings, Integer> {

    @Modifying
    @Transactional
    @Query("UPDATE Bookings b SET b.status = :bookingStatus WHERE b.id = :bookingId")
    void updateStatus(@Param("bookingStatus") boolean status,@Param("bookingId") Integer id);

    @Query("SELECT b FROM Bookings b JOIN b.rooms r WHERE r.id = :roomId AND :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate")
    List<Bookings> checkBooked(@Param("roomId") int roomId,
                               @Param("checkinDate") Date checkinDate,
                               @Param("checkoutDate") Date checkoutDate);

    // Statistics by date

    @Query("SELECT new com.example.demo.DTO.CountBookingsFromDateDTO(DATE(b.createAt), COUNT(b.id), SUM(b.totalAmount)) " +
            "FROM Bookings b " +
            "WHERE b.createAt BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(b.createAt) " +
            "ORDER BY DATE(b.createAt)")
    List<CountBookingsFromDateDTO> countBookingsFromDate(@Param("startDate") Date startDate, @Param("endDate") Date endDate);


    @Query("SELECT new com.example.demo.DTO.CountBookingsFromDateDTO(CURRENT_DATE, COUNT(b), SUM(b.totalAmount)) " +
            "FROM Bookings b " +
            "WHERE DATE(b.createAt) = CURRENT_DATE")
    CountBookingsFromDateDTO statisticsDay();

    @Query("SELECT b FROM Bookings b WHERE b.user.id = :userId")
    List<Bookings> getBookingsByUserId (@Param("userId") int userId);
    @Query("SELECT b FROM Bookings b JOIN FETCH b.rooms WHERE b.id = :bookingId")
    Bookings findByIdWithRooms(@Param("bookingId") int bookingId);

    @Query("SELECT new com.example.demo.DTO.MostBookedRoomsDTO (r.roomImg, r.name, r.roomNumber, r.price, COUNT(r.id)) " +
            "FROM Bookings b " +
            "JOIN b.rooms r " +
            "WHERE b.bookingStatus = 'Hoàn thành' " +
            "AND b.createAt BETWEEN :startDate AND :endDate " +
            "GROUP BY r.id, r.name, r.roomImg, r.roomNumber, r.price " +
            "ORDER BY COUNT(r.id) DESC")
    Page<MostBookedRoomsDTO> findMostBookedRooms(@Param("startDate") Date startDate,
                                                            @Param("endDate") Date endDate,
                                                            Pageable pageable);


    @Query("SELECT new com.example.demo.DTO.MostBookedRoomsDTO (r.roomImg, r.name, r.roomNumber, r.price, COUNT(r.id)) " +
            "FROM Bookings b " +
            "JOIN b.rooms r " +
            "WHERE b.bookingStatus = 'Hoàn thành' " +
            "GROUP BY r.id, r.name " +
            "ORDER BY COUNT(r.id) ASC")
    Page<MostBookedRoomsDTO> findMinBookedRooms(Pageable pageable);


    // check đếm phòng đã booking




}