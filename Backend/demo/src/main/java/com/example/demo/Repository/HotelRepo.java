package com.example.demo.Repository;

import com.example.demo.DTO.HotelsDTO;
import com.example.demo.Entity.Hotels;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HotelRepo extends JpaRepository<Hotels, Integer> {

    @Query("SELECT h FROM Hotels h WHERE h.name = :name")
    Hotels findByName(@Param("name") String name);

}
