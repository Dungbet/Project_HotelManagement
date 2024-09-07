package com.example.demo.Service;

import com.example.demo.DTO.PageDTO;
import com.example.demo.DTO.SearchDTO;
import com.example.demo.DTO.ServicesDTO;
import com.example.demo.DTO.UsersDTO;
import com.example.demo.Entity.Roles;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public interface UserService {
    //    void create (UsersDTO usersDTO, MultipartFile file);
    UsersDTO  create (UsersDTO usersDTO);
    void update (UsersDTO usersDTO);
    void delete (int id);
    void updateRoleById(Integer roleId, Integer userId);
    void UpdateEnable(boolean userEnable, Integer userId);
    PageDTO<List<UsersDTO>> getAll(SearchDTO searchDTO);
    UsersDTO getById(int id);
    UsersDTO findByUsername(String username);

    void updatePassword(String email, String password);

    boolean existsByEmail(String email);
    UsersDTO findByEmail(String email);
    boolean existsUsername(String username);
    void changePassword(String username, String oldPassword, String newPassword);


}
@Service
class UserServiceImpl implements UserService, UserDetailsService {
    @Autowired
    private UserRepo userRepo;


    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void changePassword(String username, String oldPassword, String newPassword) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }

    public UsersDTO convert(Users users){
        if (users == null) {
            throw new IllegalArgumentException("Người dùng không tồn tại!");
        }
        return new ModelMapper().map(users, UsersDTO.class);
    }


    @Override
    public UsersDTO create(UsersDTO usersDTO) {
        Users users = new ModelMapper().map(usersDTO, Users.class);
        users.setPassword(new BCryptPasswordEncoder().encode(users.getPassword()));
        Users savedUser = userRepo.save(users);
        return convert(savedUser);
    }

    @Override
    public void update(UsersDTO usersDTO) {
        Users users = userRepo.findById(usersDTO.getId()).orElse(null);

        if (users == null) {
            throw new IllegalArgumentException("User with ID " + usersDTO.getId() + " does not exist");
        }

        users.setAddress(usersDTO.getAddress());
        users.setGender(usersDTO.isGender());
        users.setName(usersDTO.getName());
//        users.setPassword(new BCryptPasswordEncoder().encode(usersDTO.getPassword()));
        users.setPhoneNumber(usersDTO.getPhoneNumber());
        users.setAvatar(usersDTO.getAvatar());
        users.setAvatarPublicId(usersDTO.getAvatarPublicId());

        userRepo.save(users);
    }


    @Override
    public void delete(int id) {
        userRepo.deleteById(id);
    }

    @Override
    @Transactional
    public void updateRoleById(Integer roleId, Integer userId) {
        userRepo.updateRoleById(roleId, userId);
    }

    @Override
    @Transactional
    public void UpdateEnable(boolean userEnable, Integer userId) {
        userRepo.UpdateEnable(userEnable, userId);
    }

    @Override
    public PageDTO<List<UsersDTO>> getAll(SearchDTO searchDTO) {
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Users> page = userRepo.findAll(pageRequest);

        return PageDTO.<List<UsersDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(u -> convert(u)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public UsersDTO getById(int id) {
        return convert(userRepo.findById(id).orElse(null));
    }

    @Override
    public UsersDTO findByUsername(String username) {
        return convert(userRepo.findByUsername(username)) ;
    }

    @Override
    public void updatePassword(String email, String password) {
        UsersDTO usersDTO = findByEmail(email);
        if(usersDTO == null){
            throw new IllegalArgumentException("Email không tồn tại");
        } else {
            Users users = new ModelMapper().map(usersDTO, Users.class);
            users.setPassword(new BCryptPasswordEncoder().encode(password));
            userRepo.save(users);
        }
    }


    @Override
    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    @Override
    public UsersDTO findByEmail(String email) {
        return convert(userRepo.findByEmail(email));
    }

    @Override
    public boolean existsUsername(String username) {
        return userRepo.existsByUsername(username);
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users userEntity = userRepo.findByUsername(username);
        if(userEntity == null){
            throw new UsernameNotFoundException("No exist");
        }
        if (!userEntity.isEnable()) {
            throw new UsernameNotFoundException("User account is disabled");
        }
        // convert userentity -> userdetail (của userdetail của entity)
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        authorities.add(new SimpleGrantedAuthority(userEntity.getRole().getName()));

        return new User(username, userEntity.getPassword(), authorities);
    }


}