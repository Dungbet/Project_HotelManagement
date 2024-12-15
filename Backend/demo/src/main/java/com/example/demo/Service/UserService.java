package com.example.demo.Service;

import com.example.demo.DTO.*;
import com.example.demo.Entity.Coupon;
import com.example.demo.Entity.Roles;
import com.example.demo.Entity.Users;
import com.example.demo.Repository.RoleRepo;
import com.example.demo.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.query.Param;
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
    long countTotalCustomers();
    double growthUser();

    long countNewCustomersToday();

    PageDTO<List<UsersDTO>> findEmployeesByManagerIdPaging ( SearchDTO searchDTO,int managerId);
//    long countNewCustomersYesterday();
List<Object[]> countUserByDay();

    UsersDTO createEmployee (int managerId, UsersDTO employeeDTO);
    List<UsersDTO> findEmployeesByManagerId (int managerId);
    PageDTO<List<UsersDTO>> searchUser(SearchDTO searchDTO);
    PageDTO<List<UsersDTO>> searchEmployee(SearchDTO searchDTO);
    PageDTO<List<UsersDTO>> searchManager(SearchDTO searchDTO);





}
@Service
class UserServiceImpl implements UserService, UserDetailsService {
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;


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

    @Override
    public long countTotalCustomers() {
        return userRepo.countTotalUser();
    }

    @Override
    public double growthUser() {
        long newUser = userRepo.countNewCustomersToday();
        long yesterdayUser = userRepo.countNewCustomersYesterday();
        return ((newUser - yesterdayUser)/yesterdayUser)*100;
    }

    @Override
    public long countNewCustomersToday() {
        return userRepo.countNewCustomersToday();
    }

    @Override
    public PageDTO<List<UsersDTO>> findEmployeesByManagerIdPaging(SearchDTO searchDTO, int managerId) {
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Users> page = userRepo.findEmployeesByManagerIdPaging(pageRequest, managerId);

        return PageDTO.<List<UsersDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(u -> convert(u)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public  List<Object[]> countUserByDay() {
        return userRepo.countUserByDay();
    }

    @Override
    public UsersDTO createEmployee(int managerId, UsersDTO employeeDTO) {
        Users newEmployee = new ModelMapper().map(employeeDTO, Users.class);
        Users manager = userRepo.findById(managerId).orElse(null);
        if(manager == null ){
            throw new IllegalArgumentException("Manager không tồn tại");
        }
        newEmployee.setPassword(passwordEncoder.encode(newEmployee.getPassword()));
        // Tạo mới employee
        newEmployee.setManager(manager); // Gán manager cho employee
        // Tạo và gán vai trò cho người dùng
        Roles adminRole = roleRepo.findByName("ROLE_EMPLOYEE");
        if (adminRole == null) {
            // Tạo vai trò mới nếu chưa tồn tại
            adminRole = new Roles();
            adminRole.setName("ROLE_EMPLOYEE");
            roleRepo.save(adminRole);
        }
        newEmployee.setRole(adminRole);
        Users createManager = userRepo.save(newEmployee);
        return convert(createManager);

    }

    @Override
    public List<UsersDTO> findEmployeesByManagerId(int managerId) {
        return userRepo.findEmployeesByManagerId(managerId).stream().map(u -> convert(u)).collect(Collectors.toList());
    }

    @Override
    public PageDTO<List<UsersDTO>> searchUser(SearchDTO searchDTO) {
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Users> page = userRepo.searchUser(pageRequest);

        return PageDTO.<List<UsersDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(u -> convert(u)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public PageDTO<List<UsersDTO>> searchEmployee(SearchDTO searchDTO) {
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Users> page = userRepo.searchEmployee(pageRequest);

        return PageDTO.<List<UsersDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(u -> convert(u)).collect(Collectors.toList()))
                .build();
    }

    @Override
    public PageDTO<List<UsersDTO>> searchManager(SearchDTO searchDTO) {
        if(searchDTO.getCurrentPage() == null){
            searchDTO.setCurrentPage(0);
        }
        if (searchDTO.getSize() == null){
            searchDTO.setSize(10);
        }
        PageRequest pageRequest = PageRequest.of(searchDTO.getCurrentPage(), searchDTO.getSize());
        Page<Users> page = userRepo.searchManager(pageRequest);

        return PageDTO.<List<UsersDTO>>builder()
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(page.get().map(u -> convert(u)).collect(Collectors.toList()))
                .build();
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
        users.setPassword(passwordEncoder.encode(users.getPassword()));
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