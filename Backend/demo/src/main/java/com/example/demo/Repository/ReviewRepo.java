package com.example.demo.Repository;

import com.example.demo.Entity.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;



public interface ReviewRepo extends JpaRepository<Reviews, Integer> {

}
