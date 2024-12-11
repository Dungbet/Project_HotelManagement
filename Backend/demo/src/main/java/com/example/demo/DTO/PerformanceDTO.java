package com.example.demo.DTO;

import lombok.Data;

@Data
public class PerformanceDTO {
    private int totalHandled;
    private double successRate;
    private double avgProcessingTime;
    private int totalCanceled;
    private double revenue;
}
