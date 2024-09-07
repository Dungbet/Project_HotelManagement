package com.example.demo.Service;

import com.example.demo.DTO.RolesDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.Roles;
import com.example.demo.Repository.RoleRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

public interface RoleService {

    void create (RolesDTO rolesDTO);
    void update (RolesDTO rolesDTO);
    void delete (int id);
    List<RolesDTO> search();
}
@Service
class RoleServiceIml implements RoleService{
    @Autowired
    private RoleRepo roleRepo;

    public RolesDTO convert (Roles roles){
        return new ModelMapper().map(roles, RolesDTO.class);
    }

    @Override
    public void create(RolesDTO rolesDTO) {
        Roles roles = new ModelMapper().map(rolesDTO, Roles.class);
        roleRepo.save(roles);
    }

    @Override
    public void update(RolesDTO rolesDTO) {
        Roles roles = roleRepo.findById(rolesDTO.getId()).orElse(null);
        if(roles != null){
            roles.setName(rolesDTO.getName());
            roleRepo.save(roles);
        }

    }

    @Override
    public void delete(int id) {
        roleRepo.deleteById(id);
    }


    @Override
    public List<RolesDTO> search() {
       return roleRepo.findAll().stream().map(r -> convert(r)).collect(Collectors.toList());
    }
}
