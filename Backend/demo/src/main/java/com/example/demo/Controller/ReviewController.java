package com.example.demo.Controller;

import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.ReviewDTO;
import com.example.demo.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/review")
@RestController
public class ReviewController {

    @Autowired
    ReviewService reviewService;

    @GetMapping("/review-by-room")
    public ResponseDTO<List<ReviewDTO>> getReviewByRoomId (@RequestParam int id){
         return ResponseDTO.<List<ReviewDTO>>builder().status(200).msg("ok").data(reviewService.findReviewByRoomId(id)).build();
    }

    @PostMapping("/create")
    public ResponseDTO<Void> create (@RequestBody ReviewDTO reviewDTO, @RequestHeader("Authorization") String token){
        reviewService.create(reviewDTO, token);
        return  ResponseDTO.<Void>builder().status(200).msg("ok").build();

    }

    @GetMapping("/user-reviews")
    public ResponseDTO<List<ReviewDTO>> getUserReview (@RequestParam int id){
        return ResponseDTO.<List<ReviewDTO>>builder().status(200).msg("ok").data(reviewService.findByUserId(id)).build();
    }

    @GetMapping("/get-review-good")
    public ResponseDTO<List<ReviewDTO>> getReviewByRate (){
        return ResponseDTO.<List<ReviewDTO>>builder().status(200).msg("ok").data(reviewService.findReviewsByRate()).build();
    }

}
