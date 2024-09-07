package com.example.demo.Service;

import com.example.demo.DTO.ContactsDTO;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.Contacts;
import com.example.demo.Repository.ContactRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

public interface ContactService {
    PageDTO<List<ContactsDTO>> getAllContact(SearchDTO searchDTO);

    void create (ContactsDTO contactsDTO);
    void delete(int id);
}
@Service
class ContactServiceImpl implements ContactService{

    @Autowired
    private ContactRepo contactRepo;

    public ContactsDTO convertToDTO(Contacts contacts){
        return new ModelMapper().map(contacts, ContactsDTO.class);
    }


    @Override
    public PageDTO<List<ContactsDTO>> getAllContact(SearchDTO searchDTO) {
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }

        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(),searchDTO.getSize());
        Page<Contacts> page = contactRepo.findAll(pageRequest);

        PageDTO<List<ContactsDTO>> pageDTO = new PageDTO<>();
        pageDTO.setTotalPages(page.getTotalPages());
        pageDTO.setTotalElements(page.getTotalElements());

        List<ContactsDTO> contactsDTOS = page.get().map(c -> convertToDTO(c)).collect(Collectors.toList());
        pageDTO.setData(contactsDTOS);
        return pageDTO;


    }

    @Override
    public void create(ContactsDTO contactsDTO) {
        Contacts contacts = new ModelMapper().map(contactsDTO, Contacts.class);
        contactRepo.save(contacts);
    }

    @Override
    public void delete(int id) {
        contactRepo.deleteById(id);
    }
}
