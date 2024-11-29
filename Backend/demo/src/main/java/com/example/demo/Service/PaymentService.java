package com.example.demo.Service;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.PaymentsDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Payments;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.PaymentRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

public interface PaymentService {
    PageDTO<List<PaymentsDTO>> getAllPayment(SearchDTO searchDTO);
    PaymentsDTO getById(int id);
    void create(PaymentsDTO paymentsDTO);
    void update(PaymentsDTO paymentsDTO);
    void delete(int id);
}
@Service
class PaymentServiceImpl implements PaymentService {
    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private BookingRepo bookingRepo;

    private ModelMapper modelMapper = new ModelMapper();

    @Override
    public void update(PaymentsDTO paymentsDTO) {
        Payments payment = paymentRepo.findById(paymentsDTO.getId()).orElse(null);
        if (payment != null) {
            payment.setPaymentDate(paymentsDTO.getPaymentDate());
            payment.setAmount(paymentsDTO.getAmount());
            payment.setPaymentMethod(paymentsDTO.getPaymentMethod());
            payment.setBooking(paymentsDTO.getBooking());
            paymentRepo.save(payment);
        }
    }

    public PaymentsDTO convertToDTO(Payments payments){
        return new ModelMapper().map(payments, PaymentsDTO.class);
    }

    @Override
    public PageDTO<List<PaymentsDTO>> getAllPayment(SearchDTO searchDTO) {
        if (searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }

        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Payments> page = paymentRepo.findAll(pageRequest);

        PageDTO<List<PaymentsDTO>> pageDTO = new PageDTO<>();
        pageDTO.setTotalPages(page.getTotalPages());
        pageDTO.setTotalElements(page.getTotalElements());

        List<PaymentsDTO> paymentsDTOS = page.get().map(p -> convertToDTO(p)).collect(Collectors.toList());
        pageDTO.setData(paymentsDTOS);
        return pageDTO;
    }

    @Override
    public PaymentsDTO getById(int id) {
        return convertToDTO(paymentRepo.findById(id).orElse(null));
    }

    @Override
    @Transactional
    public void create(PaymentsDTO paymentsDTO) {
        Payments payment = new ModelMapper().map(paymentsDTO, Payments.class);
        if (payment.getBooking() != null) {
            Bookings booking = bookingRepo.findById(payment.getBooking().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
            booking.setStatus("Đã thanh toán");
            bookingRepo.save(booking); // Save the managed booking
        }

        paymentRepo.save(payment);  // Lưu lại payment


    }



    @Override
    public void delete(int id) {
    }
}
