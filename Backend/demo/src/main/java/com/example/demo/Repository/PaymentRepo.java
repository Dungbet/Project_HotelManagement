package com.example.demo.Repository;

import com.example.demo.DTO.PageDTO;
import com.example.demo.Entity.Payments;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepo extends JpaRepository<Payments, Integer> {


    @Query("SELECT p FROM Payments p WHERE p.booking.employee.id =: employeeId")
    Page<Payments> getPaymentsByEmployeeId(Pageable pageable, @Param("employeeId") int employeeId);

}
