package com.example.demo.Controller;

import com.example.demo.DTO.ContactsDTO;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/contact")
public class AdminContactController {
    @Autowired
    ContactService contactService;

    @GetMapping("/")
    public ResponseDTO<PageDTO<List<ContactsDTO>>> getAllContact(@ModelAttribute SearchDTO searchDTO){
        return ResponseDTO.<PageDTO<List<ContactsDTO>>>builder().status(200).msg("ok").data(contactService.getAllContact(searchDTO)).build();
    }

    @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        contactService.delete(id);
        return  ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }
}
