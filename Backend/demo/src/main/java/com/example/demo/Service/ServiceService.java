package com.example.demo.Service;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.DTO.ServicesDTO;
import com.example.demo.Entity.Services;
import com.example.demo.Repository.ServiceRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

public interface ServiceService {

    void create (ServicesDTO servicesDTO);
    void update (ServicesDTO servicesDTO);
    void delete (int id);
    PageDTO<List<ServicesDTO>> getAll(SearchDTO searchDTO);
    ServicesDTO getById(int id);
}
@Service
class ServiceServiceImpl implements ServiceService{

    @Autowired
    private ServiceRepo serviceRepo;


    public ServicesDTO convert(Services services) {
        return new ModelMapper().map(services, ServicesDTO.class);
    }
    @Override
    public void create(ServicesDTO servicesDTO) {
        Services service = new ModelMapper().map(servicesDTO, Services.class);
        serviceRepo.save(service);
    }

    @Override
    public void update(ServicesDTO servicesDTO) {
        Services service = serviceRepo.findById(servicesDTO.getId()).orElse(null);
        if(service != null){
            service.setName(servicesDTO.getName());
            service.setDescription(servicesDTO.getDescription());
            serviceRepo.save(service);
        }

    }

    @Override
    public void delete(int id) {
        serviceRepo.deleteById(id);
    }

    @Override
    public PageDTO<List<ServicesDTO>> getAll(SearchDTO searchDTO) {
       if(searchDTO.getCurrentPage() == null){
           searchDTO.setCurrentPage(0);

       }
       if (searchDTO.getSize() == null){
           searchDTO.setSize(10);
       }

        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Services> page = serviceRepo.findAll(pageRequest);

        return PageDTO.<List<ServicesDTO>>builder()
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(page.get().map(s -> convert(s)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public ServicesDTO getById(int id) {
        return convert(serviceRepo.findById(id).orElse(null));
    }
}
