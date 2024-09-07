package com.example.demo.Repository;

import com.example.demo.DTO.HotelsDTO;
import com.example.demo.Entity.Hotels;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface HotelRepo extends JpaRepository<Hotels, Integer> {

}
