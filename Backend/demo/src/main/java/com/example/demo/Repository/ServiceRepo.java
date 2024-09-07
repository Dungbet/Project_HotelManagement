package com.example.demo.Repository;

import com.example.demo.Entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ServiceRepo extends JpaRepository<Services, Integer> {

}
