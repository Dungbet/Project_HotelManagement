package com.example.demo.Service;

import com.example.demo.DTO.PerformanceDTO;
import com.example.demo.DTO.PerformanceTimeSeriesDTO;
import com.example.demo.Repository.BookingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class PerformanceService {
    @Autowired
    private BookingRepo bookingRepo;

    public PerformanceDTO calculatePerformance(int employeeId, Date startDate, Date endDate) {
        int totalHandled = bookingRepo.countTotalBookings(employeeId, startDate, endDate);
        int successful = bookingRepo.countSuccessfulBookings(employeeId, startDate, endDate);

        // Tính tỷ lệ thành công với kiểm tra tổng số xử lý > 0
        double successRate = totalHandled > 0 ? (double) successful / totalHandled : 0.0;

        // Kiểm tra null cho thời gian xử lý trung bình
        Double avgTime = bookingRepo.averageProcessingTime(employeeId, startDate, endDate);
        double avgProcessingTime = (avgTime != null) ? avgTime : 0.0;

        int totalCanceled = bookingRepo.countCanceledBookings(employeeId, startDate, endDate);

        // Kiểm tra null cho doanh thu
        Double revenue = bookingRepo.revenue(employeeId, startDate, endDate);
        double totalRevenue = (revenue != null) ? revenue : 0.0;

        // Tạo và gán giá trị vào DTO
        PerformanceDTO performanceDto = new PerformanceDTO();
        performanceDto.setTotalHandled(totalHandled);
        performanceDto.setSuccessRate(successRate);
        performanceDto.setAvgProcessingTime(avgProcessingTime);
        performanceDto.setRevenue(totalRevenue);
        performanceDto.setTotalCanceled(totalCanceled);

        return performanceDto;
    }
    public List<PerformanceTimeSeriesDTO> calculatePerformanceTimeSeries(int employeeId, Date startDate, Date endDate) {
        List<Date> dateRanges = getDateRanges(startDate, endDate);
        List<PerformanceTimeSeriesDTO> timeSeries = new ArrayList<>();

        for (Date date : dateRanges) {
            Date nextDate = getNextDate(date);
            int totalHandled = bookingRepo.countTotalBookings(employeeId, date, nextDate);
            int successful = bookingRepo.countSuccessfulBookings(employeeId, date, nextDate);

            // Thêm kiểm tra null cho avgTime
            Double avgTime = bookingRepo.averageProcessingTime(employeeId, date, nextDate);
            double avgProcessingTime = (avgTime != null) ? avgTime : 0.0;

            double successRate = totalHandled > 0 ? (double) successful / totalHandled : 0;
            int totalCanceled = bookingRepo.countCanceledBookings(employeeId, date, nextDate);

            // Thêm kiểm tra null cho revenue
            Double revenue = bookingRepo.revenue(employeeId, date, nextDate);
            double totalRevenue = (revenue != null) ? revenue : 0.0;

            PerformanceTimeSeriesDTO dto = new PerformanceTimeSeriesDTO();
            dto.setDate(date);
            dto.setTotalHandled(totalHandled);
            dto.setSuccessRate(successRate);
            dto.setAvgProcessingTime(avgProcessingTime);
            dto.setRevenue(totalRevenue);
            dto.setTotalCanceled(totalCanceled);

            timeSeries.add(dto);
        }

        return timeSeries;
    }

    public Date getNextDate(Date currentDate) {
        // Create a Calendar instance and set it to the current date
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(currentDate);

        // Add one day to the current date (you can adjust this logic for weeks or months)
        calendar.add(Calendar.DATE, 1); // Use `Calendar.WEEK_OF_YEAR` for weekly or `Calendar.MONTH` for monthly

        return calendar.getTime();
    }
    private List<Date> getDateRanges(Date startDate, Date endDate) {
        List<Date> dateRanges = new ArrayList<>();

        // Create a Calendar instance to manipulate dates
        Calendar calendar = Calendar.getInstance();

        // Set the calendar to the start date
        calendar.setTime(startDate);

        // Loop through the dates until we reach the end date
        while (!calendar.getTime().after(endDate)) {
            // Add the current date to the list
            dateRanges.add(calendar.getTime());

            // Move to the next day
            calendar.add(Calendar.DATE, 1);
        }

        return dateRanges;
    }
}
