package com.example.demo.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;

import com.example.demo.DTO.CountBookingsFromDateDTO;
import com.example.demo.Repository.BookingRepo;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
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
        Sheet sheet = workbook.createSheet("Bookings Report");
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 4000);
        sheet.setColumnWidth(2, 4000);

        // Tiêu đề bảng
        Row titleRow = sheet.createRow(0);
        CellStyle titleStyle = workbook.createCellStyle();
        XSSFFont titleFont = ((XSSFWorkbook) workbook).createFont();
        titleFont.setFontHeightInPoints((short) 18);
        titleFont.setBold(true);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Booking Report");
        titleCell.setCellStyle(titleStyle);

        // Gộp các cột để tiêu đề chiếm hết các cột của bảng
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 2));

        // Tạo header row
        Row header = sheet.createRow(1);

        // Định dạng header màu xám nhạt và thêm viền
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        XSSFFont font = ((XSSFWorkbook) workbook).createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 14);
        font.setBold(true);
        headerStyle.setFont(font);

        // Các tiêu đề cột
        String[] columnHeaders = {"Ngày tạo", "Số lượng booking", "Doanh thu"};
        for (int i = 0; i < columnHeaders.length; i++) {
            Cell headerCell = header.createCell(i);
            headerCell.setCellValue(columnHeaders[i]);
            headerCell.setCellStyle(headerStyle);
        }

        // Định dạng cho cột ngày
        CellStyle dateCellStyle = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        dateCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));
        dateCellStyle.setBorderBottom(BorderStyle.THIN);
        dateCellStyle.setBorderTop(BorderStyle.THIN);
        dateCellStyle.setBorderLeft(BorderStyle.THIN);
        dateCellStyle.setBorderRight(BorderStyle.THIN);

        // Định dạng cho cột doanh thu
        CellStyle currencyCellStyle = workbook.createCellStyle();
        currencyCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("#,##0.00"));
        currencyCellStyle.setBorderBottom(BorderStyle.THIN);
        currencyCellStyle.setBorderTop(BorderStyle.THIN);
        currencyCellStyle.setBorderLeft(BorderStyle.THIN);
        currencyCellStyle.setBorderRight(BorderStyle.THIN);

        // Lấy danh sách bookings từ DB
        List<CountBookingsFromDateDTO> countBookingsFromDateDTOS = bookingRepo.countBookingsFromDate(startDate, endDate);

        int rowIndex = 2; // Bắt đầu từ dòng 2 vì dòng 0 là tiêu đề và dòng 1 là header
        double totalAmount = 0;
        int totalBookings = 0;

        // Xuất dữ liệu ra file Excel
        for (CountBookingsFromDateDTO dto : countBookingsFromDateDTOS) {
            Row row = sheet.createRow(rowIndex++);

            // Cột ngày tạo
            Cell cell = row.createCell(0);
            cell.setCellValue(dto.getCreateAt());
            cell.setCellStyle(dateCellStyle);

            // Cột số lượng booking
            cell = row.createCell(1);
            cell.setCellValue(dto.getCountBooking());
            totalBookings += dto.getCountBooking();

            // Cột doanh thu
            cell = row.createCell(2);
            cell.setCellValue(dto.getTotalAmount());
            cell.setCellStyle(currencyCellStyle);
            totalAmount += dto.getTotalAmount();
        }

        // Tạo dòng tổng cộng
        Row totalRow = sheet.createRow(rowIndex);
        Cell totalCell = totalRow.createCell(0);
        totalCell.setCellValue("Tổng");
        totalCell.setCellStyle(headerStyle);

        // Cột tổng số booking
        Cell totalBookingsCell = totalRow.createCell(1);
        totalBookingsCell.setCellValue(totalBookings);


        // Cột tổng doanh thu với định dạng đúng
        Cell totalAmountCell = totalRow.createCell(2);
        totalAmountCell.setCellValue(totalAmount);
        totalAmountCell.setCellStyle(currencyCellStyle);

        // Tạo bảng trong file Excel
        sheet.setAutoFilter(new CellRangeAddress(1, rowIndex - 1, 0, 2));

        // Lưu lại file Excel
        File currDir = new File(".");
        String path = currDir.getAbsolutePath();
        String fileLocation = path.substring(0, path.length() - 1) + "temp.xlsx";

        try (FileOutputStream outputStream = new FileOutputStream(fileLocation)) {
            workbook.write(outputStream);
        }

        workbook.close();
    }
}
