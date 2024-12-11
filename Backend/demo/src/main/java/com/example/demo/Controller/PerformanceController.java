package com.example.demo.Controller;

import com.example.demo.DTO.PerformanceDTO;
import com.example.demo.Service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {
    @Autowired
    private PerformanceService performanceService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<PerformanceDTO> getEmployeePerformance(@PathVariable int employeeId,@RequestParam("startDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date startDate,
                                                                 @RequestParam("endDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date endDate) {
        PerformanceDTO performance = performanceService.calculatePerformance(employeeId, startDate,endDate);
        return ResponseEntity.ok(performance);
    }
}
