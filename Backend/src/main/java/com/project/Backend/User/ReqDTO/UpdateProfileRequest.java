package com.project.Backend.User.ReqDTO;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100) String fullName,
        @Size(max = 20) String phone,
        @Size(max = 100) String department,
        @Size(max = 255) String avatarUrl,
        @Size(max = 500) String bio) {
}
