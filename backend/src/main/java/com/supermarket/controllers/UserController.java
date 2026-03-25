package com.supermarket.backend.controller;

import com.supermarket.backend.model.User;
import com.supermarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(401).body(Map.of("error", "Account disabled"));
        }

        return ResponseEntity.ok(user);
    }

    // GET all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // CREATE user
    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setActive(true);
        return userRepository.save(user);
    }

    // UPDATE user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updated) {

        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = optionalUser.get();

        user.setFullName(updated.getFullName());
        user.setUsername(updated.getUsername());
        user.setRole(updated.getRole());
        user.setActive(updated.isActive());

        if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
            user.setPassword(updated.getPassword());
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}