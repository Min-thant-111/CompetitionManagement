package com.project.Backend.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.project.Backend.Auth.security.services.UserDetailsImpl;
import com.project.Backend.User.ReqDTO.UpdateProfileRequest;
import com.project.Backend.User.ResponseDTO.MessageResponse;
import com.project.Backend.User.ResponseDTO.UserProfileResponse;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }
        List<String> roles = user.getRoles().stream().map(Enum::name).collect(Collectors.toList());
        UserProfileResponse resp = new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getDepartment(),
                user.getAvatarUrl(),
                user.getBio(),
                roles);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@Valid @RequestBody UpdateProfileRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(principal.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }
        // Update allowed fields if provided (non-null)
        if (req.fullName() != null)
            user.setFullName(req.fullName());
        if (req.phone() != null)
            user.setPhone(req.phone());
        if (req.department() != null)
            user.setDepartment(req.department());
        if (req.avatarUrl() != null)
            user.setAvatarUrl(req.avatarUrl());
        if (req.bio() != null)
            user.setBio(req.bio());

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Empty file"));
        }
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl principal)) {
                return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
            }
            User user = userRepository.findById(principal.getId()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
            }
            DBObject metaData = new BasicDBObject();
            metaData.put("type", "avatar");
            metaData.put("contentType", file.getContentType());

            String filename = "avatar_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            ObjectId fileId = gridFsTemplate.store(file.getInputStream(), filename, file.getContentType(), metaData);

            String url = "/api/files/" + fileId.toString();
            user.setAvatarUrl(url);
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse(url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Upload failed"));
        }
    }
}
