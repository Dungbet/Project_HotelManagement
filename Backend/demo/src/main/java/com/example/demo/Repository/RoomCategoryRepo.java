package com.example.demo.Repository;

import com.example.demo.Entity.RoomCategories;
import com.example.demo.Entity.Rooms;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomCategoryRepo extends JpaRepository<RoomCategories, Integer> {

}
