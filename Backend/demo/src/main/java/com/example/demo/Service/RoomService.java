package com.example.demo.Service;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.RoomsDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.Entity.Bookings;
import com.example.demo.Entity.Hotels;
import com.example.demo.Entity.RoomCategories;
import com.example.demo.Entity.Rooms;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.RoomRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public interface RoomService {
    RoomsDTO getByid (int id);
    PageDTO<List<RoomsDTO>> getAllRooms (SearchDTO searchDTO);
    List<RoomsDTO> getAll();
    List<RoomsDTO> getRoomsByRandom();
    PageDTO<List<RoomsDTO>> findAvailableRooms(SearchDTO searchDTO, Date checkinDate, Date  checkoutDate,int totalGuest);
    List<RoomsDTO> findAvailableRoomsAdmin(Date checkinDate, Date  checkoutDate);
    PageDTO<List<RoomsDTO>> sortByPrice (SearchDTO searchDTO);
    PageDTO<List<RoomsDTO>> sortByCapacity(SearchDTO searchDTO);
    PageDTO<List<RoomsDTO>> selectBySale(SearchDTO searchDTO);
    void updateRoomDiscount (int id, double discount);
    void updateAllRoomsDiscount ( double discount);
    boolean isRoomAvailable( int roomId, Date checkinDate, Date checkoutDate);
    void create (RoomsDTO roomsDTO);
    void update (RoomsDTO roomsDTO);
    void delete (int id);
    List<RoomsDTO> findAvailableRooms(int numberOfGuests);
}
@Service
class RoomServiceImpl implements RoomService {
    @Autowired
    private RoomRepo roomRepo;
    @Autowired
    private BookingRepo bookingRepo;

    public RoomsDTO convertToDTO(Rooms room) {
        if (room == null) {
            throw new IllegalArgumentException("Room entity cannot be null");
        }
        return new ModelMapper().map(room, RoomsDTO.class);
    }


    @Override
    public RoomsDTO getByid(int id) {
        Rooms room = roomRepo.findById(id).orElse(null);
        if (room == null) {
            // Xử lý khi không tìm thấy phòng, có thể ném ra exception hoặc trả về giá trị mặc định
            throw new RuntimeException("Room not found with id " + id);
        }
        return convertToDTO(room);
    }


    @Override
    public PageDTO<List<RoomsDTO>> getAllRooms(SearchDTO searchDTO) {
        if (searchDTO.getCurrentPage() == null) {
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null) {
            searchDTO.setSize(6);
        }

        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Rooms> page = roomRepo.findAll(pageRequest);

        return PageDTO.<List<RoomsDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(this::convertToDTO).collect(Collectors.toList()))
                .build();
    }


    @Override
    public List<RoomsDTO> getAll() {
        return roomRepo.findAll().stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public List<RoomsDTO> getRoomsByRandom() {
        List<Rooms> randomRooms = roomRepo.getRoomsByRandom();
        List<RoomsDTO> randomRoomsDTO = randomRooms.stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
        return randomRoomsDTO;
    }

    @Override
    public PageDTO<List<RoomsDTO>> findAvailableRooms(SearchDTO searchDTO, Date  checkinDate, Date  checkoutDate, int totalGuest) {
        if (searchDTO.getCurrentPage() == null) {
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null) {
            searchDTO.setSize(6);
        }

        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Rooms> page = roomRepo.findAvailableRooms(pageRequest, checkinDate, checkoutDate, totalGuest);

        return PageDTO.<List<RoomsDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(r -> convertToDTO(r)).collect(Collectors.toList()))
                .build();
    }
    @Override
    public List<RoomsDTO> findAvailableRoomsAdmin( Date  checkinDate, Date  checkoutDate) {
        return roomRepo.findAvailableRoomsAdmin(checkinDate,checkoutDate).stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public PageDTO<List<RoomsDTO>> sortByPrice(SearchDTO searchDTO) {
        Sort sortBy = Sort.by("price").descending();
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if(searchDTO.getSize() == null){
            searchDTO.setSize(6);
        }

        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize(),sortBy);
        Page<Rooms> page = roomRepo.findAll(pageRequest);
        return PageDTO.<List<RoomsDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map( r -> convertToDTO(r)).collect(Collectors.toList()))
                .build();

    }

    @Override
    public PageDTO<List<RoomsDTO>> sortByCapacity(SearchDTO searchDTO) {
        Sort sort = Sort.by("capacity").ascending();
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if(searchDTO.getSize() == null){
            searchDTO.setSize(6);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(),searchDTO.getSize(),sort);
        Page<Rooms> page = roomRepo.findAll(pageRequest);

        return PageDTO.<List<RoomsDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(r -> convertToDTO(r)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public PageDTO<List<RoomsDTO>> selectBySale(SearchDTO searchDTO) {
        Sort sort = Sort.by("discount").descending();
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if(searchDTO.getSize() == null){
            searchDTO.setSize(6);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(),searchDTO.getSize(),sort);
        Page<Rooms> page = roomRepo.findAll(pageRequest);

        return PageDTO.<List<RoomsDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(r -> convertToDTO(r)).collect(Collectors.toList()))
                .build();
    }



    @Override
    public void updateRoomDiscount(int id, double discount) {
        roomRepo.updateRoomDiscount(id, discount);
    }

    @Override
    public void updateAllRoomsDiscount(double discount) {
        roomRepo.updateAllRoomsDiscount(discount);
    }

    @Override
    public boolean isRoomAvailable(int roomId, Date checkinDate, Date checkoutDate) {
        List<Bookings> checkBooked = bookingRepo.checkBooked(roomId, checkinDate, checkoutDate);
        return checkBooked.isEmpty();
    }

    @Override
    public void create(RoomsDTO roomsDTO) {
        Rooms room = new ModelMapper().map(roomsDTO, Rooms.class);
        roomRepo.save(room);

    }

    @Override
    public void update(RoomsDTO roomsDTO) {
        Rooms room = roomRepo.findById(roomsDTO.getId()).orElse(null);
        if(room != null){
            ModelMapper modelMapper = new ModelMapper();
            room.setBed(roomsDTO.getBed());
            room.setSize(roomsDTO.getSize());
            room.setRoomImg(roomsDTO.getRoomImg());
            room.setRoomNumber(roomsDTO.getRoomNumber());
            room.setCapacity(roomsDTO.getCapacity());
            room.setCategory(roomsDTO.getCategory());
            room.setDescription(roomsDTO.getDescription());
            room.setHotels(roomsDTO.getHotels());
            room.setName(roomsDTO.getName());
            room.setPrice(roomsDTO.getPrice());
            room.setView(roomsDTO.getView());
            room.setDiscount(room.getDiscount());
            room.setDiscountedPrice(room.getDiscountedPrice());
            room.setRoomImgPublicId(roomsDTO.getRoomImgPublicId());

            roomRepo.save(room);
        }
    }


    @Override
    public void delete(int id) {
        roomRepo.deleteById(id);

    }

    @Override
    public List<RoomsDTO> findAvailableRooms(int numberOfGuests) {
        return roomRepo.findAvailableRooms(numberOfGuests).stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }
}