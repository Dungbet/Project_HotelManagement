package com.example.demo.Controller;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.PaymentsDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    PaymentService paymentService;

    @GetMapping("/")
    public ResponseDTO<PageDTO<List<PaymentsDTO>>> getAllPayment(@ModelAttribute SearchDTO searchDTO){
        return ResponseDTO.<PageDTO<List<PaymentsDTO>>>builder().status(200).msg("ok").data(paymentService.getAllPayment(searchDTO)).build();
    }

    @PostMapping("/create")
    public ResponseDTO<PaymentsDTO> create(@RequestBody PaymentsDTO paymentsDTO){
        paymentService.create(paymentsDTO);
        return ResponseDTO.<PaymentsDTO>builder().status(200).msg("ok").build();
    }

    @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        paymentService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }

}
