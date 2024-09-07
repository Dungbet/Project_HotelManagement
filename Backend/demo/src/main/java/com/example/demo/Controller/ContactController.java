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
@RequestMapping("/contact")
public class ContactController {
    @Autowired
    ContactService contactService;



    @PostMapping("/create")
    public ResponseDTO<Void> create(@RequestBody @Valid ContactsDTO contactsDTO){
        contactService.create(contactsDTO);
        return  ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }


}
