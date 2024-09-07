package com.example.demo.Controller;

import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.RoomCategoriesDTO;
import com.example.demo.Service.RoomCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roomcategory")
public class RoomCategoryController {
    @Autowired
    private RoomCategoryService roomCategoryService;

    @GetMapping("/")
    public ResponseDTO<List<RoomCategoriesDTO>> getAll(){
        return ResponseDTO.<List<RoomCategoriesDTO>>builder().status(200).msg("ok").data(roomCategoryService.getAll()).build();
    }

    @GetMapping("/search")
    public ResponseDTO<RoomCategoriesDTO> getById(@RequestParam int id){
        return ResponseDTO.<RoomCategoriesDTO>builder().status(200).msg("ok").data(roomCategoryService.getById(id)).build();
    }
    @PostMapping("/create")
    public ResponseDTO<RoomCategoriesDTO> create(@RequestBody  RoomCategoriesDTO roomCategoriesDTO){
        roomCategoryService.create(roomCategoriesDTO);
        return ResponseDTO.<RoomCategoriesDTO>builder().status(200).msg("ok").build();
    }

    @PutMapping("/update")
    public ResponseDTO<RoomCategoriesDTO> update(@RequestBody  RoomCategoriesDTO roomCategoriesDTO){
        roomCategoryService.update(roomCategoriesDTO);
        return ResponseDTO.<RoomCategoriesDTO>builder().status(200).msg("ok").data(roomCategoryService.getById(roomCategoriesDTO.getId())).build();
    }

    @DeleteMapping ("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        roomCategoryService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }
}
