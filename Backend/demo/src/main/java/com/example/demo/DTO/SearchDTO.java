package com.example.demo.DTO;

import lombok.Data;

// Giong model attribute
@Data
public class SearchDTO {
    private String keyword;
    private Integer currentPage;
    private Integer size;
    private String sortedField;
}
