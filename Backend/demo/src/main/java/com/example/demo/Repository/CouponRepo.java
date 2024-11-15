package com.example.demo.Repository;

import com.example.demo.Entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface CouponRepo extends JpaRepository<Coupon, Integer> {
    @Query("SELECT c FROM Coupon c WHERE c.code = :code")
    Coupon findByCode(@Param("code") String code);

    @Query("SELECT c FROM Coupon c WHERE c.expiryDate >:currentDate ")
    List<Coupon> findCouponsByExpiryDate(@Param("currentDate") Date currentDate);

    @Query("SELECT c FROM Coupon c WHERE c.expiryDate > CURRENT_DATE")
    List<Coupon> findCouponsByExpiryDateCurrent();
}
