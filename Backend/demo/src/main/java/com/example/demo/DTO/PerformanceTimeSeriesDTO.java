package com.example.demo.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceTimeSeriesDTO {
    private Date date;
    private int totalHandled;
    private double successRate;
    private double avgProcessingTime;
    private int totalCanceled;
    private double revenue;
}
