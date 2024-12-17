package com.example.demo.Controller;

import com.example.demo.DTO.CouponDTO;
import com.example.demo.DTO.MostBookedRoomsDTO;
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
            case "getMostBookedRooms":
                Map<String, Object> params = (Map<String, Object>) queryResult.get("parameters");
                if (params != null) {
                    Object countObject = params.get("count");
                    if (countObject instanceof Number) {
                        int count = ((Number) countObject).intValue();
                        responseJson = getMostBookedRooms(count); // JSON rich message
                    } else {
                        responseJson.put("fulfillmentText", "❌ Số lượng không hợp lệ.");
                    }
                } else {
                    responseJson.put("fulfillmentText", "❌ Không thể lấy thông tin số lượng.");
                }
                break;
            default:
                responseJson.put("fulfillmentText", "❌ Không xác định được yêu cầu.");

        }

        return responseJson;
    }

    @GetMapping("/getcoupon")
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

    @GetMapping("/Search-rooms")
    private Map<String, Object> getAvailableRooms(int numberOfGuests) {
        List<RoomsDTO> availableRooms = roomService.findAvailableRooms(numberOfGuests);
        Map<String, Object> responseJson = new HashMap<>();

        // Danh sách các phần tử trong richContent
        List<List<Map<String, Object>>> richContent = new ArrayList<>();

        if (availableRooms != null && !availableRooms.isEmpty()) {
            for (RoomsDTO room : availableRooms) {
                // Phần tử hình ảnh
                Map<String, Object> imageElement = new HashMap<>();
                imageElement.put("rawUrl", room.getRoomImg()); // URL hình ảnh của phòng
                imageElement.put("type", "image");
                imageElement.put("accessibilityText", "Hình ảnh phòng: " + room.getName());

                // Phần tử thông tin
                Map<String, Object> infoElement = new HashMap<>();
                infoElement.put("title", room.getName());
                infoElement.put("subtitle", String.format("Giá: %.2f VNĐ | Tối đa: %d người | Số giường: %d | Diện tích: %.1f m²",
                         room.getPrice(),room.getCapacity(), room.getBed(), room.getSize()));

                infoElement.put("type", "info");
                infoElement.put("actionLink", "http://localhost:3000/room-detail/" + room.getId());

                // Thêm cả 2 phần tử vào một danh sách con
                List<Map<String, Object>> roomContent = new ArrayList<>();
                roomContent.add(imageElement);
                roomContent.add(infoElement);

                // Thêm danh sách con vào richContent
                richContent.add(roomContent);
            }
        } else {
            // Xử lý khi không có phòng trống
            List<Map<String, Object>> noRoomsContent = new ArrayList<>();

            Map<String, Object> noRoomsInfo = new HashMap<>();
            noRoomsInfo.put("title", "Không có phòng trống");
            noRoomsInfo.put("subtitle", "❌ Không có phòng nào còn trống cho " + numberOfGuests + " người.");
            noRoomsInfo.put("type", "info");
            noRoomsInfo.put("actionLink", "https://example.com");

            noRoomsContent.add(noRoomsInfo);
            richContent.add(noRoomsContent);
        }

        // Đặt richContent vào payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("richContent", richContent);

        // Thêm payload vào fulfillmentMessages
        List<Map<String, Object>> fulfillmentMessages = new ArrayList<>();
        Map<String, Object> message = new HashMap<>();
        message.put("payload", payload);
        fulfillmentMessages.add(message);

        responseJson.put("fulfillmentMessages", fulfillmentMessages);
        return responseJson;
    }
    @GetMapping("/most-booked-rooms")
    public Map<String, Object> getMostBookedRooms(@RequestParam("count") int count) {
        // Gọi repository để lấy danh sách các phòng được đặt nhiều nhất
        List<MostBookedRoomsDTO> mostBookedRooms = roomService.findAllMostBookedRoomsByCapacity(count);
        Map<String, Object> responseJson = new HashMap<>();

        // Danh sách các phần tử trong richContent
        List<List<Map<String, Object>>> richContent = new ArrayList<>();

        if (mostBookedRooms != null && !mostBookedRooms.isEmpty()) {
            for (MostBookedRoomsDTO room : mostBookedRooms) {
                // Phần tử hình ảnh
                Map<String, Object> imageElement = new HashMap<>();
                imageElement.put("rawUrl", room.getUrl()); // URL hình ảnh của phòng
                imageElement.put("type", "image");
                imageElement.put("accessibilityText", "Hình ảnh phòng: " + room.getNameRooms());

                // Phần tử thông tin
                Map<String, Object> infoElement = new HashMap<>();
                infoElement.put("title", room.getNameRooms());
                infoElement.put("subtitle", String.format("Số lượng booking: %d | Giá: %.2f VNĐ | Số phòng: %s",
                        room.getCountBooked() ,room.getPrice(), room.getNumberRoom() ));

                infoElement.put("type", "info");
                infoElement.put("actionLink", "http://localhost:3000/room-detail/" + room.getNumberRoom());

                // Thêm cả 2 phần tử vào một danh sách con
                List<Map<String, Object>> roomContent = new ArrayList<>();
                roomContent.add(imageElement);
                roomContent.add(infoElement);

                // Thêm danh sách con vào richContent
                richContent.add(roomContent);
            }
        } else {
            // Xử lý khi không có phòng phù hợp
            List<Map<String, Object>> noRoomsContent = new ArrayList<>();

            Map<String, Object> noRoomsInfo = new HashMap<>();
            noRoomsInfo.put("title", "Không có phòng phù hợp");
            noRoomsInfo.put("subtitle", "❌ Không có phòng nào phù hợp với tiêu chí của bạn.");
            noRoomsInfo.put("type", "info");
            noRoomsInfo.put("actionLink", "https://example.com");

            noRoomsContent.add(noRoomsInfo);
            richContent.add(noRoomsContent);
        }

        // Đặt richContent vào payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("richContent", richContent);

        // Thêm payload vào fulfillmentMessages
        List<Map<String, Object>> fulfillmentMessages = new ArrayList<>();
        Map<String, Object> message = new HashMap<>();
        message.put("payload", payload);
        fulfillmentMessages.add(message);

        responseJson.put("fulfillmentMessages", fulfillmentMessages);
        return responseJson;
    }



}
