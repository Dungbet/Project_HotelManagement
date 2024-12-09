package com.example.demo.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.DTO.*;
import com.example.demo.Entity.*;
import com.example.demo.Repository.BookingRepo;
import com.example.demo.Repository.RoomRepo;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public interface RoomService {
    RoomsDTO getByid (int id);
    PageDTO<List<RoomsDTO>> getAllRooms (SearchDTO searchDTO);
    List<RoomsDTO> getAll();
    List<RoomsDTO> getRoomsByRandom();
    PageDTO<List<RoomsDTO>> findAvailableRooms(SearchDTO searchDTO, Date checkinDate, Date  checkoutDate,int totalGuest);
    PageDTO<List<RoomsDTO>> findBookedRooms(SearchDTO searchDTO);
    PageDTO<List<RoomsDTO>> findEmptyRooms(SearchDTO searchDTO);
    List<RoomsDTO> findAvailableRoomsAdmin(Date checkinDate, Date  checkoutDate);
    PageDTO<List<RoomsDTO>> sortByPrice (SearchDTO searchDTO);
    PageDTO<List<RoomsDTO>> sortByCapacity(SearchDTO searchDTO);
    PageDTO<List<RoomsDTO>> selectBySale(SearchDTO searchDTO);
    void updateRoomDiscount (int id, double discount);
    void updateAllRoomsDiscount ( double discount);
    boolean isRoomAvailable( int roomId, Date checkinDate, Date checkoutDate);
    void  create (RoomsDTO roomsDTO) throws IOException;
    void update (RoomsDTO roomsDTO) throws IOException;
    void delete (int id);
    List<RoomsDTO> findAvailableRooms(int numberOfGuests);
    List<MostBookedRoomsDTO> findMostBookedRooms( Date startDate, Date endDate);
    List<MostBookedRoomsDTO> findMinBookedRooms();
}
@Service
class RoomServiceImpl implements RoomService {
    private static final String CLOUDINARY_FOLDER = "Rooms";
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private RoomRepo roomRepo;
    @Autowired
    private BookingRepo bookingRepo;
//    @Autowired
//    private ModelMapper modelMapper;

//    @Bean
//    public ModelMapper modelMapper() {
//        ModelMapper modelMapper = new ModelMapper();
//
//        // Tùy chỉnh ánh xạ Rooms -> RoomsDTO
//        modelMapper.typeMap(Rooms.class, RoomsDTO.class).addMappings(mapper -> {
//            mapper.skip(RoomsDTO::setRoomImages); // Bỏ qua ánh xạ roomImages tự động
//        });
//
//        return modelMapper;
//    }
public RoomsDTO convertToDTO(Rooms room){
    if (room == null) {
        throw new IllegalArgumentException("Người dùng không tồn tại!");
    }
    return new ModelMapper().map(room, RoomsDTO.class);
}



//    private RoomsDTO convertToDTO(Rooms room) {
//        // Create a custom ModelMapper configuration to break circular references
//        ModelMapper modelMapper = new ModelMapper();
//
//        // Skip mapping for circular reference collections
//        TypeMap<Rooms, RoomsDTO> typeMap = modelMapper.createTypeMap(Rooms.class, RoomsDTO.class);
//        typeMap.addMappings(mapper -> {
//            mapper.skip(RoomsDTO::setBookings);
//            mapper.skip(RoomsDTO::setRoomImages);
//        });
//
//        RoomsDTO dto = modelMapper.map(room, RoomsDTO.class);
//
//        // Manually map room images
//        if (room.getRoomImages() != null) {
//            dto.setRoomImages(room.getRoomImages().stream()
//                    .map(RoomImage::getImageUrl)
//                    .collect(Collectors.toList()));
//        }
//
//        return dto;
//    }

    public BookingDTO convertBookingToDTO(Bookings bookings){
        return new ModelMapper().map(bookings, BookingDTO.class);
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
    public PageDTO<List<RoomsDTO>> findBookedRooms(SearchDTO searchDTO) {
        if (searchDTO.getCurrentPage() == null) {
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null) {
            searchDTO.setSize(6);
        }

        Date now = new Date();
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Rooms> page = roomRepo.findBookedRooms(pageRequest, now, now);

        return PageDTO.<List<RoomsDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(room -> {
                    RoomsDTO roomsDTO = convertToDTO(room); // Chuyển đổi phòng thành RoomsDTO
                    // Chuyển đổi từng Booking thành BookingDTO và gán vào roomsDTO
                    roomsDTO.setBookings(room.getBookings().stream()
                            .map(booking -> convertBookingToDTO(booking)) // Convert từ Bookings thành BookingDTO
                            .collect(Collectors.toList()));
                    return roomsDTO;
                }).collect(Collectors.toList()))
                .build();
    }
    @Override
    public PageDTO<List<RoomsDTO>> findEmptyRooms(SearchDTO searchDTO) {
        if (searchDTO.getCurrentPage() == null) {
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null) {
            searchDTO.setSize(6);
        }

        Date now = new Date();
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Rooms> page = roomRepo.findEmptyRooms(pageRequest, now, now);

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
    public void  create(RoomsDTO roomsDTO) throws IOException {
        Rooms room = new ModelMapper().map(roomsDTO, Rooms.class);

        // Lưu thumbnail
        if (roomsDTO.getFile() != null ) {
            Map r = this.cloudinary.uploader().upload(roomsDTO.getFile().getBytes(),
                    ObjectUtils.asMap("resource_type", "auto", "folder", CLOUDINARY_FOLDER));
            String img = (String)r.get("secure_url");
            String publicId = (String)r.get("public_id");
            roomsDTO.setRoomImg(img);
            roomsDTO.setRoomImgPublicId(publicId);

            // Cập nhật thông tin vào entity
            room.setRoomImg(img);
            room.setRoomImgPublicId(publicId);
        }


        // Lưu ảnh bổ sung
        List<RoomImage> images = new ArrayList<>();
        if (roomsDTO.getAdditionalFiles() != null) {
            for (MultipartFile file : roomsDTO.getAdditionalFiles()) {
                Map r = cloudinary.uploader().upload(file.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto", "folder", CLOUDINARY_FOLDER));
                RoomImage roomImage = new RoomImage();
                roomImage.setImageUrl((String) r.get("secure_url"));
                roomImage.setPublicId((String) r.get("public_id"));
                roomImage.setRoom(room);
                images.add(roomImage);
            }
        }
        room.setRoomImages(images);

         roomRepo.save(room);

    }




    @Override
    public void update(RoomsDTO roomsDTO) throws IOException {
        Rooms room = roomRepo.findById(roomsDTO.getId()).orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Cập nhật thông tin cơ bản
        room.setName(roomsDTO.getName());
        room.setRoomNumber(roomsDTO.getRoomNumber());
        room.setPrice(roomsDTO.getPrice());
        room.setDescription(roomsDTO.getDescription());
        room.setBed(roomsDTO.getBed());
        room.setSize(roomsDTO.getSize());
        room.setCapacity(roomsDTO.getCapacity());
        room.setView(roomsDTO.getView());
        room.setDiscount(roomsDTO.getDiscount());
        room.setDiscountedPrice(roomsDTO.getDiscountedPrice());
        room.setHotels(roomsDTO.getHotels());
        room.setCategory(roomsDTO.getCategory());

        // 1. Cập nhật thumbnail
        if (roomsDTO.getFile() != null && !roomsDTO.getFile().isEmpty()) {
            // Xóa thumbnail cũ
            if (room.getRoomImgPublicId() != null) {
                cloudinary.uploader().destroy(room.getRoomImgPublicId(), ObjectUtils.emptyMap());
            }
            // Upload ảnh mới
            Map r = this.cloudinary.uploader().upload(roomsDTO.getFile().getBytes(),
                    ObjectUtils.asMap("resource_type", "auto", "folder", CLOUDINARY_FOLDER));
            String img = (String)r.get("secure_url");
            String newPublicId = (String)r.get("public_id");
            roomsDTO.setRoomImg(img);
            roomsDTO.setRoomImgPublicId(newPublicId);
        }

        // 2. Cập nhật danh sách ảnh bổ sung
        if (roomsDTO.getAdditionalFiles() != null && !roomsDTO.getAdditionalFiles().isEmpty()) {
            // Xóa tất cả ảnh bổ sung cũ
            if (room.getRoomImages() != null) {
                for (RoomImage oldImage : room.getRoomImages()) {
                    if (oldImage.getPublicId() != null) {
                        cloudinary.uploader().destroy(oldImage.getPublicId(), ObjectUtils.emptyMap());
                    }
                }
            }
            // Clear danh sách ảnh bổ sung cũ
            room.getRoomImages().clear();

            // Thêm ảnh bổ sung mới
            List<RoomImage> newImages = new ArrayList<>();
            for (MultipartFile file : roomsDTO.getAdditionalFiles()) {
                Map r = cloudinary.uploader().upload(file.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto", "folder", CLOUDINARY_FOLDER));
                RoomImage newImage = new RoomImage();
                newImage.setImageUrl((String) r.get("secure_url"));
                newImage.setPublicId((String) r.get("public_id"));
                newImage.setRoom(room);
                newImages.add(newImage);
            }
            room.getRoomImages().addAll(newImages);
        }

        // Lưu thay đổi vào database
        roomRepo.save(room);
    }




    @Override
    public void delete(int id) {
        roomRepo.deleteById(id);

    }

    @Override
    public List<RoomsDTO> findAvailableRooms(int numberOfGuests) {
        return roomRepo.findAvailableRooms(numberOfGuests).stream().map(r -> convertToDTO(r)).collect(Collectors.toList());
    }

    @Override
    public List<MostBookedRoomsDTO> findMostBookedRooms(Date startDate, Date endDate) {

        Pageable pageable = PageRequest.of(0, 10); // Lấy 10 kết quả đầu tiên
       return bookingRepo.findMostBookedRooms(startDate, endDate, pageable).stream().collect(Collectors.toList());
    }

    @Override
    public List<MostBookedRoomsDTO> findMinBookedRooms() {
        Pageable pageable = PageRequest.of(0, 10);
        return bookingRepo.findMinBookedRooms(pageable).stream().collect(Collectors.toList());
    }
}