package com.example.demo.Repository;

import com.example.demo.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface UserRepo extends JpaRepository<Users, Integer>{


    @Modifying
    @Transactional
    @Query("UPDATE Users u SET u.role.id = :roleId WHERE u.id = :userId")
    void updateRoleById(@Param("roleId") Integer roleId, @Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("UPDATE Users u SET u.enable = :userEnable WHERE u.id = :userId")
    void UpdateEnable(@Param("userEnable") boolean userEnable, @Param("userId") Integer userId);

    //    @Query("SELECT u FROM Users u WHERE u.username = :username")
    Users findByUsername(String username);

    Users findByEmail(String email);


    boolean existsByEmail (String email);
    boolean existsByUsername (String username);

}