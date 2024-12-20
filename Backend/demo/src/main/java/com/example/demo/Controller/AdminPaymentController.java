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
@RequestMapping("/admin/payment")
public class AdminPaymentController {

    @Autowired
    PaymentService paymentService;




    @PostMapping("/create")
    public ResponseDTO<PaymentsDTO> create(@RequestBody PaymentsDTO paymentsDTO){
        paymentService.create(paymentsDTO);
        return ResponseDTO.<PaymentsDTO>builder().status(200).msg("ok").build();
    }
    @GetMapping("/search")
    public ResponseDTO<PaymentsDTO> search(@RequestParam int id){
        return ResponseDTO.<PaymentsDTO>builder().status(200).msg("ok").data( paymentService.getById(id)).build();
    }
    @GetMapping("/")
    public ResponseDTO<PageDTO<List<PaymentsDTO>>> getAllPayment(@RequestParam int page, @RequestParam int size){
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<PaymentsDTO>>>builder().status(200).msg("ok").data(paymentService.getAllPayment(searchDTO)).build();
    }
    @GetMapping("/get-all-payment-employee")
    public ResponseDTO<PageDTO<List<PaymentsDTO>>> getPaymentsByEmployeeId(@RequestParam int page, @RequestParam int size, @RequestParam("employeeId") int employeeId){
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return ResponseDTO.<PageDTO<List<PaymentsDTO>>>builder().status(200).msg("ok").data(paymentService.getPaymentsByEmployeeId(searchDTO, employeeId)).build();
    }

    @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        paymentService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }

    //    @GetMapping("/{id}")
//    public ResponseDTO<PaymentsDTO> getPaymentById(@PathVariable int id) {
//        PaymentsDTO paymentDTO = paymentService.getById(id);
//        return ResponseDTO.<PaymentsDTO>builder()
//                .status(200)
//                .msg("Payment fetched successfully")
//                .data(paymentDTO)
//                .build();
//    }
//
//    @PutMapping("/{id}")
//    public ResponseDTO<PaymentsDTO> updatePayment(@PathVariable int id, @RequestBody PaymentsDTO paymentsDTO) {
//        paymentsDTO.setId(id);
//        paymentService.update(paymentsDTO);
//        return ResponseDTO.<PaymentsDTO>builder()
//                .status(200)
//                .msg("Payment updated successfully")
//                .build();
//    }
}
