package com.example.demo.Controller;

import com.example.demo.DTO.HotelsDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.Entity.Hotels;
import com.example.demo.Service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/hotel")
public class HotelController {

	@Autowired
	HotelService hotelService;

	@GetMapping("/search")
	public ResponseDTO<HotelsDTO> getHotelById(@RequestParam int id){
		return ResponseDTO.<HotelsDTO>builder().status(200).data(hotelService.getHotelByid(id)).msg("ok").build();
	}
	@GetMapping("/")
	public ResponseDTO<List<HotelsDTO>> getAll(){
		return ResponseDTO.<List<HotelsDTO>>builder().status(200).data(hotelService.findAll()).msg("ok").build();
	}

	@PostMapping("/create")
	public ResponseDTO<Void> create (@RequestBody HotelsDTO hotelsDTO) throws IllegalStateException, IOException{
		hotelService.create(hotelsDTO);
		return ResponseDTO.<Void>builder().status(200).msg("ok").build();
	}

	@PutMapping("/update")
	public ResponseDTO<HotelsDTO> update(@RequestBody HotelsDTO hotelsDTO){
		hotelService.edit(hotelsDTO);
		return ResponseDTO.<HotelsDTO>builder().status(200).data(hotelService.getHotelByid(hotelsDTO.getId())).msg("ok").build();
	}

	@DeleteMapping("/")
	public ResponseDTO<Void> delete (@RequestParam int id){
		hotelService.delete(id);
		return ResponseDTO.<Void>builder().status(200).msg("ok").build();
	}

}
