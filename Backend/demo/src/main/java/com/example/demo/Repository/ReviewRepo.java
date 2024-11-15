package com.example.demo.Repository;

import com.example.demo.Entity.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;



public interface ReviewRepo extends JpaRepository<Reviews, Integer> {

    @Query("SELECT r FROM Reviews r WHERE r.room.id =:roomId")
    List<Reviews> findByRoomId(@Param("roomId") int id);


    List<Reviews> findByUserId(int userId);

    @Query("SELECT r FROM Reviews r WHERE r.rating = 5")
    List<Reviews> findReviewsByRate();


}
