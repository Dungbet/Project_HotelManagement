package com.example.demo.Controller;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.DTO.ServicesDTO;
import com.example.demo.Service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("service")
public class ServiceController {
    @Autowired
   private ServiceService serviceService;

    @GetMapping("/")
    public ResponseDTO<PageDTO<List<ServicesDTO>>> getAll(@ModelAttribute  SearchDTO searchDTO){
        return ResponseDTO.<PageDTO<List<ServicesDTO>>>builder().status(200).msg("ok").data(serviceService.getAll(searchDTO)).build();
    }

    @GetMapping("/search")
    public ResponseDTO<ServicesDTO> getById (@RequestParam int id){
        return ResponseDTO.<ServicesDTO>builder().status(200).msg("ok").data(serviceService.getById(id)).build();
    }

    @PostMapping("/create")
    public ResponseDTO<ServicesDTO> create (@RequestBody ServicesDTO servicesDTO){
        serviceService.create(servicesDTO);
        return ResponseDTO.<ServicesDTO>builder().status(200).msg("ok").build();
    }

    @PutMapping("/update")
    public ResponseDTO<ServicesDTO> update (@RequestBody ServicesDTO servicesDTO){
        serviceService.update(servicesDTO);
        return ResponseDTO.<ServicesDTO>builder().status(200).msg("ok").data(serviceService.getById(servicesDTO.getId())).build();
    }

    @DeleteMapping("/")
    public ResponseDTO<Void> delete (@RequestParam int id){
        serviceService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }


}
