package com.project.Backend.Auth;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.Backend.User.Role;
import com.project.Backend.User.User;
import com.project.Backend.User.ReqDTO.LoginRequest;
import com.project.Backend.User.ReqDTO.SignupRequest;
import com.project.Backend.User.ResponseDTO.JwtResponse;
import com.project.Backend.User.ResponseDTO.MessageResponse;
import com.project.Backend.User.UserRepository;
import com.project.Backend.Auth.security.jwt.JwtUtils;
import com.project.Backend.Auth.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        // Validate requested role if provided
        if (loginRequest.role() != null && !loginRequest.role().isEmpty()) {
            String requestedRole = "ROLE_" + loginRequest.role().toUpperCase();
            if (!roles.contains(requestedRole)) {
                return ResponseEntity
                        .status(403)
                        .body(new MessageResponse("Error: Access Denied. You are not registered as a " + loginRequest.role()));
            }
        }

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.username())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.email())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.username(),
                signUpRequest.email(),
                encoder.encode(signUpRequest.password()));

        Set<String> strRoles = signUpRequest.roles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = Role.ROLE_STUDENT;
            roles.add(userRole);
        } else {
            strRoles.forEach(roleStr -> {
                Role mapped = switch (roleStr) {
                    case "admin" -> Role.ROLE_ADMIN;
                    case "teacher" -> Role.ROLE_TEACHER;
                    case "student" -> Role.ROLE_STUDENT;
                    default -> Role.ROLE_STUDENT;
                };
                roles.add(mapped);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
