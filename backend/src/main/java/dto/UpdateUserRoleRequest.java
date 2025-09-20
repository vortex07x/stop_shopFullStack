package com.example.demo.dto;

public class UpdateUserRoleRequest {
    private String role;

    public UpdateUserRoleRequest() {}

    public UpdateUserRoleRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}