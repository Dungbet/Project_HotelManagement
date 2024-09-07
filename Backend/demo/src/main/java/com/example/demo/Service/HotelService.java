package com.example.demo.Service;
import com.example.demo.DTO.HotelsDTO;
import com.example.demo.Entity.Hotels;
import com.example.demo.Repository.HotelRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

public interface HotelService {
 void create (HotelsDTO hotelsDTO);
 void edit(HotelsDTO hotelsDTO);
 void delete (int id);
 HotelsDTO getHotelByid(int id);
 List<HotelsDTO> findAll();
	
}

@Service
class HotelServiceImpl implements HotelService {
	@Autowired
	HotelRepo hotelRepo;


	public HotelsDTO convertToDTO(Hotels hotels){
		return new ModelMapper().map(hotels, HotelsDTO.class);
	}
	@Override
	public void create(HotelsDTO hotelsDTO) {
		Hotels hotel = new ModelMapper().map(hotelsDTO, Hotels.class);
		hotelRepo.save(hotel);
		
	}

	@Override
	public void edit(HotelsDTO hotelsDTO) {
		Hotels hotel = hotelRepo.findById(hotelsDTO.getId()).orElse(null);
		if(hotel != null) {
			hotel.setName(hotelsDTO.getName());
			hotel.setEmail(hotelsDTO.getEmail());
			hotel.setAddress(hotelsDTO.getAddress());
			hotel.setPhoneNumber(hotelsDTO.getPhoneNumber());
		}
		
		hotelRepo.save(hotel);
	}

	@Override
	public void delete(int id) {
		hotelRepo.deleteById(id);
		
	}

	@Override
	public HotelsDTO getHotelByid(int id) {

		Hotels hotels = hotelRepo.findById(id).orElse(null);
		return convertToDTO(hotels);
	}

	@Override
	public List<HotelsDTO> findAll() {
		return hotelRepo.findAll().stream().map(c -> convertToDTO(c)).collect(Collectors.toList());
	}


}
