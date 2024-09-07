package com.example.demo.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.ResponseDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.DTO.UsersDTO;
import com.example.demo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/user")
public class AdminUserController {
    private static final String CLOUDINARY_FOLDER = "User";

    @Autowired
    private UserService userService;

    @Autowired
    Cloudinary cloudinary;

    @GetMapping("/")
    public ResponseDTO<PageDTO<List<UsersDTO>>> getAll(@RequestParam int page, @RequestParam int size){
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCurrentPage(page);
        searchDTO.setSize(size);
        return  ResponseDTO.<PageDTO<List<UsersDTO>>>builder().status(200).msg("ok").data(userService.getAll(searchDTO)).build();
    }

    @GetMapping("/search")
    public ResponseDTO<UsersDTO> getById(@RequestParam int id){
        return ResponseDTO.<UsersDTO>builder().status(200).msg("ok").data(userService.getById(id)).build();
    }
    @PostMapping("/create")
    public ResponseDTO<UsersDTO> create(@ModelAttribute UsersDTO usersDTO) throws IllegalStateException, IOException {
        if (usersDTO.getFile() != null && !usersDTO.getFile().isEmpty()) {
            // Lưu vào cloudinary
            Map r = this.cloudinary.uploader().upload(usersDTO.getFile().getBytes(),
                    ObjectUtils.asMap("resource_type", "auto", "folder", CLOUDINARY_FOLDER));
            String img = (String) r.get("secure_url");
            String publicId = (String) r.get("public_id");
            usersDTO.setAvatar(img);
            usersDTO.setAvatarPublicId(publicId); // Lưu public_id của ảnh vào database
        }
        // Nếu không có file, chỉ cần tạo user với các thông tin khác
        UsersDTO createdUser = userService.create(usersDTO);
        return ResponseDTO.<UsersDTO>builder()
                .status(200)
                .msg("ok")
                .data(createdUser)
                .build();
    }

    @PutMapping("/update")
    public ResponseDTO<UsersDTO> update(@ModelAttribute UsersDTO usersDTO) throws IllegalStateException, IOException {
        UsersDTO existingUser = userService.getById(usersDTO.getId());
        if (existingUser == null) {
            return ResponseDTO.<UsersDTO>builder().status(404).msg("User not found").build();
        }

        if (usersDTO.getFile() != null && !usersDTO.getFile().isEmpty()) {
            // Xóa ảnh cũ
            String oldPublicId = existingUser.getAvatarPublicId();
            if (oldPublicId != null) {
                cloudinary.uploader().destroy(oldPublicId, ObjectUtils.emptyMap());
            }

            // Upload ảnh mới
            Map<String, Object> r = this.cloudinary.uploader().upload(usersDTO.getFile().getBytes(),
                    ObjectUtils.asMap("resource_type", "auto", "folder", CLOUDINARY_FOLDER));
            String img = (String) r.get("secure_url");
            String newPublicId = (String) r.get("public_id");
            usersDTO.setAvatar(img);
            usersDTO.setAvatarPublicId(newPublicId); // Lưu public_id của ảnh mới
        }

        // Nếu không có file, chỉ cần cập nhật user với các thông tin khác
        userService.update(usersDTO);
        return ResponseDTO.<UsersDTO>builder().status(200).msg("ok").data(userService.getById(usersDTO.getId())).build();
    }



    @PutMapping("/update-role")
    public ResponseDTO<UsersDTO> updateRoleById(@RequestParam ("roleId") Integer roleId, @RequestParam("userId") Integer userId){
        userService.updateRoleById(roleId, userId);
        return ResponseDTO.<UsersDTO>builder().status(200).msg("ok").data(userService.getById(userId)).build();
    }
    @PutMapping("/update-enable")
    public ResponseDTO<UsersDTO> UpdateEnable(@RequestParam ("userEnable") boolean userEnable, @RequestParam("userId") Integer userId){
        userService.UpdateEnable(userEnable, userId);
        return ResponseDTO.<UsersDTO>builder().status(200).msg("ok").data(userService.getById(userId)).build();
    }
    @DeleteMapping("/")
    public ResponseDTO<Void> delete(@RequestParam int id){
        userService.delete(id);
        return ResponseDTO.<Void>builder().status(200).msg("ok").build();
    }
}