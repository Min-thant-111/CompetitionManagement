package com.project.Backend.User.ResponseDTO;

import java.util.List;

public record UserProfileResponse(
        String id,
        String username,
        String email,
        String fullName,
        String phone,
        String department,
        String avatarUrl,
        String bio,
        List<String> roles) {
}
