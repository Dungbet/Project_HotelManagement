package com.example.demo.Controller;

import com.example.demo.DTO.CouponDTO;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/coupon")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/code")
    public ResponseEntity<ResponseDTO<CouponDTO>> getByCode(@RequestParam("code") String code) {
        CouponDTO couponDTO = couponService.getCouponByCode(code);
        if (couponDTO != null) {
            return ResponseEntity.ok(
                    ResponseDTO.<CouponDTO>builder()
                            .status(200)
                            .msg("ok")
                            .data(couponDTO)
                            .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                            ResponseDTO.<CouponDTO>builder()
                                    .status(404)
                                    .msg("Coupon not found")
                                    .build()
                    );
        }
    }

    @GetMapping("/get-coupon-exp")
    public ResponseDTO<List<CouponDTO>> getCouponExp(@RequestParam("currentDate") @DateTimeFormat(pattern = "dd/MM/yyyy") Date currentDate){
            return ResponseDTO.<List<CouponDTO>>builder().status(200).msg("ok").data(couponService.findCouponsByExpiryDate(currentDate)).build();

        }
//    @PostMapping("/get-coupon-exp-current")
//    public ResponseEntity<String> getCouponExpCurrent() {
//        List<CouponDTO> coupons = couponService.findCouponsByExpiryDateCurrent(); // Lấy danh sách coupon
//
//        if (coupons != null && !coupons.isEmpty()) {
//            CouponDTO coupon = coupons.get(0); // Lấy coupon đầu tiên
//
//            // Tạo thông điệp
//            String message = String.format(
//                    "Bạn hãy áp mã giảm giá dưới đây để nhận ưu đãi: \n"+
//                    "🎉 Mã: %s\n" +
//                            "📉 Giảm giá: %.2f%%\n" +
//                            "⏳ Ngày hết hạn: %s",
//                    coupon.getCode(),
//                    coupon.getDiscountPercentage(),
//                    coupon.getExpiryDate()
//            );
//
//            // Trả về JSON cho Dialogflow
//            String jsonResponse = String.format("{\"fulfillmentText\": \"%s\"}", message.replace("\"", "\\\""));
//            return ResponseEntity.ok(jsonResponse);
//        } else {
//            // Thông điệp không có coupon
//            String noCouponMessage = "❌ Không có thông tin mã giảm giá nào.";
//            String jsonResponse = String.format("{\"fulfillmentText\": \"%s\"}", noCouponMessage);
//            return ResponseEntity.ok(jsonResponse);
//        }
//    }



//    @PostMapping("/dialogflow")
//    public ResponseEntity<ResponseDTO<List<CouponDTO>>> dialogflowHandler(@RequestBody Map<String, Object> requestBody) {
//        // Kiểm tra intent
//        Map<String, Object> queryResult = (Map<String, Object>) requestBody.get("queryResult");
//        Map<String, Object> intent = (Map<String, Object>) queryResult.get("intent");
//        String intentName = (String) intent.get("displayName");
//
//        if ("GetCoupon".equals(intentName)) {
//            // Gọi API để lấy mã giảm giá
//            List<CouponDTO> coupons = couponService.findCouponsByExpiryDateCurrent();
//
//            // Tạo response cho Dialogflow
//            StringBuilder responseText = new StringBuilder("Bạn có mã giảm giá: ");
//            for (CouponDTO coupon : coupons) {
//                responseText.append("\n- Mã: ").append(coupon.getCode())
//                        .append(", Giảm giá: ").append(coupon.getDiscountPercentage())
//                        .append("%, Hạn sử dụng: ").append(coupon.getExpiryDate());
//            }
//
//            // Tạo response DTO cho Dialogflow
//            ResponseDTO<List<CouponDTO>> responseDTO = ResponseDTO.<List<CouponDTO>>builder()
//                    .status(200)
//                    .msg(responseText.toString())
//                    .data(coupons)
//                    .build();
//
//            return ResponseEntity.ok(responseDTO);
//        }
//
//        // Trả về phản hồi không hợp lệ nếu intent không khớp
//        return ResponseEntity.badRequest()
//                .body(ResponseDTO.<List<CouponDTO>>builder()
//                        .status(400)
//                        .msg("Invalid intent")
//                        .data(null)
//                        .build());
//    }




//
//    @GetMapping("/")
//    public ResponseEntity<ResponseDTO<PageDTO<List<CouponDTO>>>> getAll(@ModelAttribute SearchDTO searchDTO) {
//        PageDTO<List<CouponDTO>> pageDTO = couponService.getCouponPaging(searchDTO);
//        return ResponseEntity.ok(
//                ResponseDTO.<PageDTO<List<CouponDTO>>>builder()
//                        .status(200)
//                        .msg("ok")
//                        .data(pageDTO)
//                        .build()
//        );
//    }
//
//
//
//    @GetMapping("/search")
//    public ResponseEntity<ResponseDTO<CouponDTO>> getById(@RequestParam int id) {
//        CouponDTO couponDTO = couponService.getCouponById(id);
//        if (couponDTO != null) {
//            return ResponseEntity.ok(
//                    ResponseDTO.<CouponDTO>builder()
//                            .status(200)
//                            .msg("ok")
//                            .data(couponDTO)
//                            .build()
//            );
//        } else {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(
//                            ResponseDTO.<CouponDTO>builder()
//                                    .status(404)
//                                    .msg("Coupon not found")
//                                    .build()
//                    );
//        }
//    }
//
//    @PostMapping("/create")
//    public ResponseEntity<ResponseDTO<Void>> create(@RequestBody CouponDTO couponDTO) {
//        couponService.create(couponDTO);
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(
//                        ResponseDTO.<Void>builder()
//                                .status(201)
//                                .msg("Coupon created successfully")
//                                .build()
//                );
//    }
//
//    @PutMapping("/update")
//    public ResponseEntity<ResponseDTO<CouponDTO>> update(@RequestBody CouponDTO couponDTO) {
//        couponService.update(couponDTO);
//        return ResponseEntity.ok(
//                ResponseDTO.<CouponDTO>builder()
//                        .status(200)
//                        .msg("ok")
//                        .data(couponService.getCouponById(couponDTO.getId()))
//                        .build()
//        );
//    }
//
//    @DeleteMapping("/")
//    public ResponseEntity<ResponseDTO<Void>> delete(@RequestParam int id) {
//        couponService.delete(id);
//        return ResponseEntity.ok(
//                ResponseDTO.<Void>builder()
//                        .status(200)
//                        .msg("Coupon deleted successfully")
//                        .build()
//        );
//    }
}
