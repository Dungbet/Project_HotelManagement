package com.example.demo.Repository;


import com.example.demo.Entity.Contacts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ContactRepo extends JpaRepository<Contacts, Integer> {


}
