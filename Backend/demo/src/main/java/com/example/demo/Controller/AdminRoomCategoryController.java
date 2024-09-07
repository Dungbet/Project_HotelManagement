package com.example.demo.Controller;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.RoomCategoriesDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.RoomCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/roomcategory")
public class AdminRoomCategoryController {
    @Autowired
    private RoomCategoryService roomCategoryService;


    @GetMapping("/")
    public ResponseDTO<PageDTO<List<RoomCategoriesDTO>>> getAllPaging(@RequestParam int page, @RequestParam int size){
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);

        return ResponseDTO.<PageDTO<List<RoomCategoriesDTO>>>builder().status(200).msg("ok").data(roomCategoryService.getAllCategoryPaging(searchDTO)).build();
    }

    @GetMapping("/get-all")
    public ResponseDTO<List<RoomCategoriesDTO>> getAll(){
        return ResponseDTO.<List<RoomCategoriesDTO>>builder().status(200).msg("ok").data(roomCategoryService.getAll()).build();
    }

        @PutMapping("/update")
    public ResponseDTO<RoomCategoriesDTO> update(@RequestBody  RoomCategoriesDTO roomCategoriesDTO){
        roomCategoryService.update(roomCategoriesDTO);
        return ResponseDTO.<RoomCategoriesDTO>builder().status(200).msg("ok").data(roomCategoryService.getById(roomCategoriesDTO.getId())).build();
    }

        @PostMapping("/create")
    public ResponseDTO<RoomCategoriesDTO> create(@RequestBody  RoomCategoriesDTO roomCategoriesDTO){
        roomCategoryService.create(roomCategoriesDTO);
        return ResponseDTO.<RoomCategoriesDTO>builder().status(200).msg("ok").build();
    }
        @DeleteMapping ("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        roomCategoryService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }

    @GetMapping("/search")
    public ResponseDTO<RoomCategoriesDTO> getById(@RequestParam int id){
        return ResponseDTO.<RoomCategoriesDTO>builder().status(200).msg("ok").data(roomCategoryService.getById(id)).build();
    }


}
