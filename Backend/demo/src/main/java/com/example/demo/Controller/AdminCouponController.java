package com.example.demo.Controller;

import com.example.demo.DTO.CouponDTO;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/coupon")
public class AdminCouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/")
    public ResponseEntity<ResponseDTO<PageDTO<List<CouponDTO>>>> getAll(@ModelAttribute SearchDTO searchDTO) {
        PageDTO<List<CouponDTO>> pageDTO = couponService.getCouponPaging(searchDTO);
        return ResponseEntity.ok(
                ResponseDTO.<PageDTO<List<CouponDTO>>>builder()
                        .status(200)
                        .msg("ok")
                        .data(pageDTO)
                        .build()
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseDTO<Void>> create(@RequestBody CouponDTO couponDTO) {
        couponService.create(couponDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ResponseDTO.<Void>builder()
                                .status(201)
                                .msg("Coupon created successfully")
                                .build()
                );
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDTO<CouponDTO>> update(@RequestBody CouponDTO couponDTO) {
        couponService.update(couponDTO);
        return ResponseEntity.ok(
                ResponseDTO.<CouponDTO>builder()
                        .status(200)
                        .msg("ok")
                        .data(couponService.getCouponById(couponDTO.getId()))
                        .build()
        );
    }

    @DeleteMapping("/")
    public ResponseEntity<ResponseDTO<Void>> delete(@RequestParam int id) {
        couponService.delete(id);
        return ResponseEntity.ok(
                ResponseDTO.<Void>builder()
                        .status(200)
                        .msg("Coupon deleted successfully")
                        .build()
        );
    }

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

//    @GetMapping("/code")
//    public ResponseEntity<ResponseDTO<CouponDTO>> getByCode(@RequestParam("code") String code) {
//        CouponDTO couponDTO = couponService.getCouponByCode(code);
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


}
