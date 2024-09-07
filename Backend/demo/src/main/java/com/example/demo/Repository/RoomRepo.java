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

    @Query("SELECT r FROM Rooms r WHERE r.id NOT IN (SELECT b.room.id FROM Bookings b WHERE :checkinDate < b.checkOutDate AND :checkoutDate > b.checkInDate)")
    Page<Rooms> findAvailableRooms(Pageable pageable, @Param("checkinDate") Date checkinDate, @Param("checkoutDate") Date checkoutDate);
    @Transactional
    @Modifying
    @Query("UPDATE Rooms r SET r.discount = :discount, r.discountedPrice = r.price - (r.price * :discount / 100) WHERE r.id = :roomId")
    void updateRoomDiscount(@Param("roomId") int roomId, @Param("discount") double discount);

    @Transactional
    @Modifying
    @Query("UPDATE Rooms r SET r.discount = :discount, r.discountedPrice = r.price - (r.price * :discount / 100)")
    void updateAllRoomsDiscount(@Param("discount") double discount);
}
