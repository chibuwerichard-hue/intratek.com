package com.supermarket.backend.controllers;

import com.supermarket.backend.model.User;
import com.supermarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://192.168.13.70:5173"
})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid username or password");
                return ResponseEntity.status(401).body(error);
            }

            User user = userOpt.get();

            if (!user.getPassword().equals(password)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid username or password");
                return ResponseEntity.status(401).body(error);
            }

            if (!user.isActive()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Your account has been disabled");
                return ResponseEntity.status(401).body(error);
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
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
        try {
            User user = userRepository.findById(id).orElseThrow();
            user.setFullName(updated.getFullName());
            user.setUsername(updated.getUsername());
            user.setRole(updated.getRole());
            user.setActive(updated.isActive());

            if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
                user.setPassword(updated.getPassword());
            }

            return ResponseEntity.ok(userRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}