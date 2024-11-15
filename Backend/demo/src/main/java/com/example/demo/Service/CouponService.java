package com.example.demo.Service;

import com.example.demo.DTO.CouponDTO;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.Coupon;
import com.example.demo.Repository.CouponRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public interface CouponService {
    CouponDTO getCouponById(int id);
    CouponDTO getCouponByCode(String code); // Phương thức trả về CouponDTO
    PageDTO<List<CouponDTO>> getCouponPaging(SearchDTO searchDTO);
    void create(CouponDTO couponDTO);
    void update(CouponDTO couponDTO);
    void delete(int id);
    List<CouponDTO> findCouponsByExpiryDate (Date currentDate);
    List<CouponDTO> findCouponsByExpiryDateCurrent ();

}

@Service
class CouponServiceImpl implements CouponService {
    @Autowired
    CouponRepo couponRepo;

    public CouponDTO convert(Coupon coupon) {
        if (coupon == null) {
            throw new IllegalArgumentException("Coupon cannot be null");
        }
        return new ModelMapper().map(coupon, CouponDTO.class);
    }

    @Override
    public CouponDTO getCouponById(int id) {
        return convert(couponRepo.findById(id).orElse(null));
    }

    @Override
    public CouponDTO getCouponByCode(String code) {
        Coupon coupon = couponRepo.findByCode(code);
        if (coupon == null) {
            return null; // Coupon không tồn tại
        }

        // Kiểm tra ngày hết hạn
        Date today = new Date();
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().after(today)) {
            return convert(coupon); // Coupon còn hiệu lực
        } else {
            return null; // Coupon đã hết hạn
        }
    }

    @Override
    public PageDTO<List<CouponDTO>> getCouponPaging(SearchDTO searchDTO) {
        if (searchDTO.getCurrentPage() == null) {
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null) {
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Coupon> page = couponRepo.findAll(pageRequest);

        PageDTO<List<CouponDTO>> pageDTO = new PageDTO<>();
        pageDTO.setTotalPages(page.getTotalPages());
        pageDTO.setTotalElements(page.getTotalElements());

        List<CouponDTO> couponDTOS = page.get().map(c -> convert(c)).collect(Collectors.toList());
        pageDTO.setData(couponDTOS);
        return pageDTO;
    }

    @Override
    public void create(CouponDTO couponDTO) {
        Coupon coupon = new ModelMapper().map(couponDTO, Coupon.class);
        couponRepo.save(coupon);
    }

    @Override
    public void update(CouponDTO couponDTO) {
        Coupon coupon = couponRepo.findById(couponDTO.getId()).orElse(null);
        if (coupon != null) {
            coupon.setCode(couponDTO.getCode());
            coupon.setDiscountPercentage(couponDTO.getDiscountPercentage());
            coupon.setExpiryDate(couponDTO.getExpiryDate());
            couponRepo.save(coupon);
        }
    }

    @Override
    public void delete(int id) {
        couponRepo.deleteById(id);
    }

    @Override
    public List<CouponDTO> findCouponsByExpiryDate(Date currentDate) {
        return couponRepo.findCouponsByExpiryDate(currentDate).stream().map( r -> convert(r)).collect(Collectors.toList());
    }

    @Override
    public List<CouponDTO> findCouponsByExpiryDateCurrent() {
        return couponRepo.findCouponsByExpiryDateCurrent().stream().map( r -> convert(r)).collect(Collectors.toList());
    }
}
