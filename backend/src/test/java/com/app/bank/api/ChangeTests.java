package com.app.bank.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import com.app.bank.dto.request.ChangePasswordRequest;
import com.app.bank.dto.request.ChangeUsernameRequest;
import com.app.bank.exception.BadRequestException;
import com.app.bank.model.User;
import com.app.bank.security.DatabaseUserDetailsService;
import com.app.bank.security.SecurityConfig;
import com.app.bank.security.UserPrincipal;
import com.app.bank.service.ManagementService;
import com.app.bank.service.UserService;
import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
public class ChangeTests {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private ManagementService managementService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    private ObjectMapper objectMapper = new ObjectMapper();

    private String testUsername = "testuser";
    private String currentPassword = "oldpassword";
    private User user = new User(testUsername, currentPassword);
    private UserPrincipal principal = new UserPrincipal(user);

    // ======================== Change Password Tests ========================
    @Nested
    @DisplayName("PUT /api/v1/user/change-password")
    class ChangePasswordTests {
        String newPassword = "newpassword";

        @Test
        @DisplayName("Should change password successfully")
        void shouldChangePasswordSuccessfully() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(currentPassword, newPassword);

            doNothing().when(userService).changePassword(principal.getUsername(), request.getCurrentPassword(),
                    request.getNewPassword());

            mvc.perform(put("/api/v1/user/change-password")
                    .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().string("Password updated successfully"));

            verify(userService, times(1)).changePassword(testUsername, currentPassword, newPassword);
        }

        @Test
        @DisplayName("Should return 400 when current password is incorrect")
        void shouldReturnBadRequestWhenCurrentPasswordIncorrect() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest("wrongpassword", newPassword);

            doThrow(new BadRequestException("Current password is incorrect."))
                    .when(userService).changePassword(testUsername, "wrongpassword", newPassword);

            mvc.perform(put("/api/v1/user/change-password")
                    .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        // @WithMockUser(username = "testuser")
        @DisplayName("Should return 400 when validation fails")
        void shouldReturnBadRequestWhenValidationFails() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest("", "newpassword");

            mvc.perform(put("/api/v1/user/change-password")
                    .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ======================== Change Username Tests ========================
    @Nested
    @DisplayName("PUT /api/v1/user/change-username")
    class ChangeUsernameTests {

        @Test
        @DisplayName("Should change username successfully")
        void shouldChangeUsernameSuccessfully() throws Exception {
            String newUsername = "newusername";

            ChangeUsernameRequest request = new ChangeUsernameRequest(newUsername, currentPassword);

            doNothing().when(managementService).changeUsername(eq(testUsername), any(ChangeUsernameRequest.class));
            Authentication auth = new UsernamePasswordAuthenticationToken(newUsername, currentPassword);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(auth);

            mvc.perform(put("/api/v1/user/change-username")
                    .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(content()
                            .string("Username updated successfully. Please log in again with your new username."));

            verify(managementService, times(1)).changeUsername(eq(testUsername), any(ChangeUsernameRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when username already exists")
        void shouldReturnBadRequestWhenUsernameExists() throws Exception {
            String newUsername = "existinguser";
            ChangeUsernameRequest request = new ChangeUsernameRequest(newUsername, currentPassword);

            doThrow(new BadRequestException("Username already exists."))
                    .when(managementService).changeUsername(eq(testUsername), any(ChangeUsernameRequest.class));

            mvc.perform(put("/api/v1/user/change-username")
                    .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 401 when password is incorrect")
        void shouldReturnUnauthorizedWhenPasswordIncorrect() throws Exception {
            String wrongPassword = "wrongpassword";
            ChangeUsernameRequest request = new ChangeUsernameRequest(testUsername, wrongPassword);

            doNothing().when(managementService).changeUsername(eq(testUsername), any(ChangeUsernameRequest.class));
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Invalid credentials"));

            mvc.perform(put("/api/v1/user/change-username")
                    .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }
}
