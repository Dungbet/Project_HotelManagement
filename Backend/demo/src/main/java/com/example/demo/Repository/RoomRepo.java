package com.example.demo.Repository;

import com.example.demo.Entity.Rooms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

public interface RoomRepo extends JpaRepository<Rooms, Integer> {


    @Query(value = "SELECT * FROM Rooms ORDER BY RAND() LIMIT 4", nativeQuery = true)
    List<Rooms> getRoomsByRandom();

    @Query("SELECT r FROM Rooms r WHERE r.capacity >= :totalGuest AND r.id NOT IN (SELECT br.id FROM Bookings b JOIN b.rooms br WHERE :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate)")
    Page<Rooms> findAvailableRooms(Pageable pageable, @Param("checkinDate") Date checkinDate, @Param("checkoutDate") Date checkoutDate, int totalGuest);

    @Query("SELECT r FROM Rooms r " +
            "JOIN FETCH r.bookings b " +
            "WHERE b.checkInDate < :checkoutDate AND b.checkOutDate > :checkinDate")
    Page<Rooms> findBookedRooms(Pageable pageable, @Param("checkinDate") Date checkinDate, @Param("checkoutDate") Date checkoutDate);

    @Query("SELECT r FROM Rooms r WHERE  r.id NOT IN (SELECT br.id FROM Bookings b JOIN b.rooms br WHERE :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate)")
    Page<Rooms> findEmptyRooms(Pageable pageable, @Param("checkinDate") Date checkinDate, @Param("checkoutDate") Date checkoutDate);

    @Query("SELECT r FROM Rooms r WHERE r.id NOT IN (SELECT br.id FROM Bookings b JOIN b.rooms br WHERE :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate)")
    List<Rooms> findAvailableRoomsAdmin(@Param("checkinDate") Date checkinDate, @Param("checkoutDate") Date checkoutDate);
    @Transactional
    @Modifying
    @Query("UPDATE Rooms r SET r.discount = :discount, r.discountedPrice = r.price - (r.price * :discount / 100) WHERE r.id = :roomId")
    void updateRoomDiscount(@Param("roomId") int roomId, @Param("discount") double discount);

    @Transactional
    @Modifying
    @Query("UPDATE Rooms r SET r.discount = :discount, r.discountedPrice = r.price - (r.price * :discount / 100)")
    void updateAllRoomsDiscount(@Param("discount") double discount);

    @Query(value = "SELECT * FROM rooms r WHERE r.id NOT IN (" +
            "SELECT br.room_id FROM booking_rooms br " +
            "JOIN bookings b ON b.id = br.booking_id " +
            "WHERE CURRENT_DATE < b.check_out_date " +
            "AND CURRENT_DATE + INTERVAL 1 DAY > b.check_in_date) " +
            "AND r.capacity >= :numberOfGuests", nativeQuery = true)
    List<Rooms> findAvailableRooms(@Param("numberOfGuests") int numberOfGuests);


    @Query("SELECT count(r) FROM Rooms r WHERE r.id NOT IN (SELECT br.id FROM Bookings b JOIN b.rooms br WHERE :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate)")
    long countAvailableRoomsAdmin(@Param("checkinDate") Date checkinDate, @Param("checkoutDate") Date checkoutDate);

    @Query("SELECT count(r) FROM Rooms r")
    long countAllRooms();

    @Query("SELECT r FROM Rooms r WHERE r.discount > 0")
    Page<Rooms> findRoomsByDiscount (Pageable pageable);



}
