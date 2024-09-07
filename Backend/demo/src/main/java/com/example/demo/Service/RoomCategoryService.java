package com.example.demo.Service;

import com.example.demo.DTO.CouponDTO;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.RoomCategoriesDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.RoomCategories;
import com.example.demo.Repository.RoomCategoryRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

public interface RoomCategoryService {
    RoomCategoriesDTO getById(int id);

    List<RoomCategoriesDTO> getAll();
    void create(RoomCategoriesDTO roomCategoriesDTO);
    void update(RoomCategoriesDTO roomCategoriesDTO);
    void delete(int id);

    PageDTO<List<RoomCategoriesDTO>> getAllCategoryPaging(SearchDTO searchDTO);
}
@Service
class RoomCategoryServiceImpl implements RoomCategoryService {

    @Autowired
    private RoomCategoryRepo roomCategoryRepo;


    public RoomCategoriesDTO convertToDTO (RoomCategories roomCategories){
        return new ModelMapper().map(roomCategories, RoomCategoriesDTO.class);
    }

    @Override
    public RoomCategoriesDTO getById(int id) {
        return convertToDTO(roomCategoryRepo.findById(id).orElse(null));
    }

    @Override
    public List<RoomCategoriesDTO> getAll() {
        return roomCategoryRepo.findAll().stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public void create(RoomCategoriesDTO roomCategoriesDTO) {
        RoomCategories category = new ModelMapper().map(roomCategoriesDTO, RoomCategories.class);
        roomCategoryRepo.save(category);

    }

    @Override
    public void update(RoomCategoriesDTO roomCategoriesDTO) {
        RoomCategories category = roomCategoryRepo.findById(roomCategoriesDTO.getId()).orElse(null);
        if (category != null){
            category.setName(roomCategoriesDTO.getName());
            category.setDescription(roomCategoriesDTO.getDescription());
            roomCategoryRepo.save(category);
        }

    }

    @Override
    public void delete(int id) {
    roomCategoryRepo.deleteById(id);

    }

    @Override
    public PageDTO<List<RoomCategoriesDTO>> getAllCategoryPaging(SearchDTO searchDTO) {
        if(searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        if (searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<RoomCategories> page =roomCategoryRepo.findAll(pageRequest);
        PageDTO<List<RoomCategoriesDTO>> pageDTO = new PageDTO<>();
        pageDTO.setTotalPages(page.getTotalPages());
        pageDTO.setTotalElements(page.getTotalElements());

        List<RoomCategoriesDTO> roomCategoriesDTOS = page.get().map(c -> convertToDTO(c)).collect(Collectors.toList());
        pageDTO.setData(roomCategoriesDTOS);
        return pageDTO;

    }
}
