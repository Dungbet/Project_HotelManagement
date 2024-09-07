package com.example.demo.Repository;

import com.example.demo.Entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CouponRepo extends JpaRepository<Coupon, Integer> {
    @Query("SELECT c FROM Coupon c WHERE c.code = :code")
    Coupon findByCode(@Param("code") String code);
}
