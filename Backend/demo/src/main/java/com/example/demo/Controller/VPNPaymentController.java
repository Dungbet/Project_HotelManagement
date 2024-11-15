package com.example.demo.Controller;

import com.example.demo.DTO.ResponseDTO;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Payments;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.PaymentRepo;
import com.example.demo.Service.EmailService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.example.demo.aop.VNPayConfig;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServlet;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class VPNPaymentController extends HttpServlet {
    @Autowired
    BookingRepo bookingRepo;

    @Autowired
    EmailService emailService;

    @Autowired
    PaymentRepo paymentRepo;
    @GetMapping("/create-payment")
    public ResponseEntity<?> createPayment(HttpServletRequest req, @RequestParam("amount") double amount, @RequestParam("bookingId") int bookingId) throws IOException {
        long total_amount = (long) amount*100;

        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        String vnp_IpAddr = VNPayConfig.getIpAddress(req);

        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.vnp_Version);
        vnp_Params.put("vnp_Command", VNPayConfig.vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(total_amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", VNPayConfig.orderType);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_Locale", "vn");
        String locate = req.getParameter("language");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl + "?bookingId="+ bookingId );

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;



        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        JsonObject job = new JsonObject();
        job.addProperty("code", "00");
        job.addProperty("message", "success");
        job.addProperty("data", paymentUrl);
        return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(job));
    }

    @GetMapping("/payment-infor")
    public ResponseEntity<?> transaction(@RequestParam(value = "vnp_Amount") String amount,
                                         @RequestParam(value = "vnp_PayDate") String payDate,
                                         @RequestParam(value = "vnp_TransactionStatus") String responseCode,
                                         @RequestParam(value = "bookingId") String bookingId) {
        if (responseCode.equals("00")) {
            Bookings booking = bookingRepo.findById(Integer.parseInt(bookingId)).orElse(null);
            if (booking != null) {
                booking.setStatus("Đã thanh toán");
                bookingRepo.save(booking);

                Payments payments = new Payments();
                payments.setBooking(booking);
                payments.setPaymentDate(new Date());
                payments.setAmount(Integer.parseInt(amount) / 100);
                payments.setPaymentMethod("Thanh Toán Online");
                paymentRepo.save(payments);

                // Gửi email hóa đơn
                emailService.sendBookingInvoice(booking);
            }

            // Trả về phản hồi
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setStatus(200);
            responseDTO.setMsg("Payment successful");
            responseDTO.setData(Map.of(
                    "bookingId", bookingId,
                    "totalPrice", amount,
                    "paymentDate", payDate,
                    "status", responseCode
            ));
            return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
        } else {
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setStatus(404);
            responseDTO.setMsg("Payment failed, please try again.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseDTO);
        }
    }


}