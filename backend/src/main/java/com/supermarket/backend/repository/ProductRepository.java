package com.supermarket.backend.repository;

import com.supermarket.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Spring automatically gives you save(), findAll(), deleteById() for free!
}