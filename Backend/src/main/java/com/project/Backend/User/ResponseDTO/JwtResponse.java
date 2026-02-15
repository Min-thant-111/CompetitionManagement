package com.project.Backend.User.ResponseDTO;

import java.util.List;

public record JwtResponse(
        String token,
        String type,
        String id,
        String username,
        String email,
        List<String> roles) {

    public JwtResponse(String token, String id, String username, String email, List<String> roles) {
        this(token, "Bearer", id, username, email, roles);
    }
}
