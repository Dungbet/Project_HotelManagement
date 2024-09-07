package com.example.demo.jobscheduler;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;

import com.example.demo.DTO.CountBookingsFromDateDTO;
import com.example.demo.Repository.BookingRepo;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Jobscheduler {

    @Autowired
    BookingRepo bookingRepo;

    public void exportExcel(Date startDate, Date endDate) throws IOException {

        // Tạo Workbook và định dạng tiêu đề
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Pr3");
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 4000);
        sheet.setColumnWidth(2, 4000);

        Row header = sheet.createRow(0);

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        XSSFFont font = ((XSSFWorkbook) workbook).createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 16);
        font.setBold(true);
        headerStyle.setFont(font);

        Cell headerCell = header.createCell(0);
        headerCell.setCellValue("Ngày tạo");
        headerCell.setCellStyle(headerStyle);

        headerCell = header.createCell(1);
        headerCell.setCellValue("Số lượng booking");
        headerCell.setCellStyle(headerStyle);

        headerCell = header.createCell(2);
        headerCell.setCellValue("Doanh thu");
        headerCell.setCellStyle(headerStyle);

        // Xuất dữ liệu từ danh sách vào file Excel
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);

        List<CountBookingsFromDateDTO> countBookingsFromDateDTOS = bookingRepo.countBookingsFromDate(startDate, endDate);

        int rowIndex = 1;
        double totalAmount = 0;
        int totalBookings = 0;

        for (CountBookingsFromDateDTO dto : countBookingsFromDateDTOS) {
            Row row = sheet.createRow(rowIndex++);
            Cell cell = row.createCell(0);
            cell.setCellValue(dto.getCreateAt());

            cell = row.createCell(1);
            cell.setCellValue(dto.getCountBooking());
            totalBookings += dto.getCountBooking();

            cell = row.createCell(2);
            cell.setCellValue(dto.getTotalAmount());
            totalAmount += dto.getTotalAmount();
        }

        // Tạo dòng tổng cộng
        Row totalRow = sheet.createRow(rowIndex);
        Cell totalCell = totalRow.createCell(0);
        totalCell.setCellValue("Tổng");
        totalCell.setCellStyle(headerStyle);

        totalRow.createCell(1).setCellValue(totalBookings);
        totalRow.createCell(2).setCellValue(totalAmount);

        // Lưu lại
        File currDir = new File(".");
        String path = currDir.getAbsolutePath();
        String fileLocation = path.substring(0, path.length() - 1) + "temp.xlsx";

        try (FileOutputStream outputStream = new FileOutputStream(fileLocation)) {
            workbook.write(outputStream);
        }

        workbook.close();
    }
}
