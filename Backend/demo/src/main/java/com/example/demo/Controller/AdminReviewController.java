package com.example.demo.Controller;


import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.ReviewDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/review")
public class AdminReviewController {

    @Autowired
    ReviewService reviewService;

    @DeleteMapping("/delete")
    public ResponseDTO<Void> delete (@RequestParam int id){
        reviewService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }
    @GetMapping("/get-all")
    public ResponseDTO<PageDTO<List<ReviewDTO>>> getReviewByRoomId (@RequestParam int page, @RequestParam int size){
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<ReviewDTO>>>builder().status(200).msg("ok").data(reviewService.getAllReview(searchDTO)).build();
    }
}
