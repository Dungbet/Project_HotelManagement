package com.example.demo.Service;

import com.example.demo.DTO.PerformanceDTO;
import com.example.demo.Repository.BookingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class PerformanceService {
    @Autowired
    private BookingRepo bookingRepo;

    public PerformanceDTO calculatePerformance(int employeeId, Date startDate, Date endDate) {
        int totalHandled = bookingRepo.countTotalBookings(employeeId,startDate,endDate);
        int successful = bookingRepo.countSuccessfulBookings(employeeId,startDate,endDate);
        double successRate = (double) successful / totalHandled;
        Double avgTime = bookingRepo.averageProcessingTime(employeeId,startDate,endDate);
        int totalCanceled = bookingRepo.countCanceledBookings(employeeId,startDate,endDate);
        Double revenue = bookingRepo.revenue(employeeId,startDate,endDate);

        PerformanceDTO performanceDto = new PerformanceDTO();
        performanceDto.setTotalHandled(totalHandled);
        performanceDto.setSuccessRate(successRate);
        performanceDto.setAvgProcessingTime(avgTime);
        performanceDto.setRevenue(revenue);
        performanceDto.setTotalCanceled(totalCanceled);

        return performanceDto;
    }
}
