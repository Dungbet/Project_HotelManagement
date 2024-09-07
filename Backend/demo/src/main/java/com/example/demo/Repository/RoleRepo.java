package com.example.demo.Repository;

import com.example.demo.Entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepo extends JpaRepository<Roles, Integer> {
    Roles findByName(String name);

}
