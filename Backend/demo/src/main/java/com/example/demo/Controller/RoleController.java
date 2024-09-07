package com.example.demo.Controller;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.RolesDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping("/")
    public ResponseDTO<List<RolesDTO>> getAll(){
        return ResponseDTO.<List<RolesDTO>>builder().status(200).msg("ok").data(roleService.search()).build();
    }

    @PostMapping("/create")
    public ResponseDTO<Void> create(@RequestBody RolesDTO rolesDTO){
        roleService.create(rolesDTO);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }

    @PutMapping("/update")
    public ResponseDTO<Void> update(@RequestBody RolesDTO rolesDTO){
        roleService.update(rolesDTO);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }

    @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        roleService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }
}
