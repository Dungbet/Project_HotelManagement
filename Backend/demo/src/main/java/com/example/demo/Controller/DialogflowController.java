package com.example.demo.Controller;

import com.example.demo.DTO.CouponDTO;
import com.example.demo.DTO.RoomsDTO;
import com.example.demo.Service.CouponService;
import com.example.demo.Service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dialogflow")
public class DialogflowController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private RoomService roomService;

    @PostMapping
    public Map<String, Object> handleRequest(@RequestBody Map<String, Object> payload) {
        Map<String, Object> responseJson = new HashMap<>();

        if (payload == null || !payload.containsKey("queryResult")) {
            responseJson.put("fulfillmentText", "❌ Yêu cầu không hợp lệ.");
            return responseJson;
        }

        Map<String, Object> queryResult = (Map<String, Object>) payload.get("queryResult");
        Map<String, Object> intent = (Map<String, Object>) queryResult.get("intent");

        if (intent == null || !intent.containsKey("displayName")) {
            responseJson.put("fulfillmentText", "❌ Không thể xác định intent.");
            return responseJson;
        }

        String displayName = (String) intent.get("displayName");

        switch (displayName) {
            case "GetCoupon":
                responseJson.put("fulfillmentText", getCouponDetails());
                break;
            case "checkAvailableRooms":
                Map<String, Object> parameters = (Map<String, Object>) queryResult.get("parameters");
                if (parameters != null) {
                    Object guestsObject = parameters.get("numberOfGuests");
                    if (guestsObject instanceof Number) {
                        int numberOfGuests = ((Number) guestsObject).intValue();
                        responseJson = getAvailableRooms(numberOfGuests); // Sử dụng JSON rich message
                    } else {
                        responseJson.put("fulfillmentText", "❌ Số người không hợp lệ.");
                    }
                } else {
                    responseJson.put("fulfillmentText", "❌ Không thể lấy thông tin số người.");
                }
                break;
            default:
                responseJson.put("fulfillmentText", "❌ Không xác định được yêu cầu.");
        }

        return responseJson;
    }

    private String getCouponDetails() {
        List<CouponDTO> coupons = couponService.findCouponsByExpiryDateCurrent(); // Lấy danh sách coupon

        if (coupons != null && !coupons.isEmpty()) {
            CouponDTO coupon = coupons.get(0); // Lấy coupon đầu tiên

            // Tạo thông điệp
            return String.format(
                    "Bạn hãy áp mã giảm giá dưới đây để nhận ưu đãi: \n" +
                            "🎉 Mã: %s\n" +
                            "📉 Giảm giá: %.2f%%\n" +
                            "⏳ Ngày hết hạn: %s",
                    coupon.getCode(),
                    coupon.getDiscountPercentage(),
                    coupon.getExpiryDate()
            );
        } else {
            // Thông điệp không có coupon
            return "❌ Không có thông tin mã giảm giá nào.";
        }
    }

    private Map<String, Object> getAvailableRooms(int numberOfGuests) {
        List<RoomsDTO> availableRooms = roomService.findAvailableRooms(numberOfGuests);
        Map<String, Object> responseJson = new HashMap<>();

        if (availableRooms != null && !availableRooms.isEmpty()) {
            List<List<Map<String, Object>>> richMessages = new ArrayList<>();

            for (RoomsDTO room : availableRooms) {
                List<Map<String, Object>> card = new ArrayList<>();
                Map<String, Object> cardDetails = new HashMap<>();
                cardDetails.put("title", room.getName());
                cardDetails.put("subtitle", String.format("Giá: %.2f VNĐ | Số giường: %d | Diện tích: %.1f m²",
                        room.getPrice(), room.getBed(), room.getSize()));
                cardDetails.put("imageUri","https://m.media-amazon.com/images/I/71oqfuWhjeL.jpg");
                cardDetails.put("buttons", List.of(
                        Map.of("text", "Xem chi tiết", "postback", "https://localhost:8080/rooms/" + room.getRoomNumber())
                ));

                card.add(Map.of("card", cardDetails));
                richMessages.add(card);
            }

            responseJson.put("fulfillmentMessages", richMessages);
        } else {
            responseJson.put("fulfillmentText", "❌ Không có phòng nào còn trống cho " + numberOfGuests + " người.");
        }

        return responseJson;
    }
}
