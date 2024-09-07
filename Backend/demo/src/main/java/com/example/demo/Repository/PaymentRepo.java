package com.example.demo.Repository;

import com.example.demo.Entity.Payments;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepo extends JpaRepository<Payments, Integer> {

}
