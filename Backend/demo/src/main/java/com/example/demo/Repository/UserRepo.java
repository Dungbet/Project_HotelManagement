package com.example.demo.Repository;

import com.example.demo.Entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    @Query(" SELECT COUNT (c) FROM Users c")
    long countTotalUser();

    @Query("SELECT COUNT(c) FROM Users c WHERE DATE(c.createAt) = CURRENT_DATE")
    long countNewCustomersToday();

    @Query(value = "SELECT COUNT(*) FROM users c WHERE DATE(c.create_at) = CURRENT_DATE - INTERVAL 1 DAY", nativeQuery = true)
    long countNewCustomersYesterday();

    @Query("SELECT DATE(c.createAt) as createDate, COUNT(c) as totalCustomers " +
            "FROM Users c " +
            "GROUP BY DATE(c.createAt) " +
            "ORDER BY DATE(c.createAt)")
    List<Object[]> countUserByDay();

    @Query("SELECT u FROM Users u WHERE u.manager.id = :managerId")
    List<Users> findEmployeesByManagerId(@Param("managerId") int managerId);

    @Query("SELECT u FROM Users u WHERE u.manager.id = :managerId")
    Page<Users> findEmployeesByManagerIdPaging(Pageable pageable,@Param("managerId") int managerId);

    @Query("SELECT u FROM Users u WHERE u.role.name = \"ROLE_USER\"")
    Page<Users> searchUser (Pageable pageable);
    @Query("SELECT u FROM Users u WHERE u.role.name = \"ROLE_MANAGER\"")
    Page<Users> searchManager (Pageable pageable);

    @Query("SELECT u FROM Users u WHERE u.role.name = \"ROLE_MANAGER\"")
    Page<Users> searchAdmin (Pageable pageable);

}