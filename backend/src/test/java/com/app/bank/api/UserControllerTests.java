package com.app.bank.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import com.app.bank.dto.request.LoginRequest;
import com.app.bank.dto.request.RegisterRequest;
import com.app.bank.dto.response.UserResponse;
import com.app.bank.exception.BadRequestException;
import com.app.bank.exception.ResourceNotFoundException;
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
@DisplayName("UserController Integration Tests")
@Import(SecurityConfig.class)
public class UserControllerTests {

        @Autowired
        private MockMvc mvc;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private ManagementService managementService;

        @MockitoBean
        private AuthenticationManager authenticationManager;

        @MockitoBean
        private UserPrincipal userPrincipal;

        @MockitoBean
        private DatabaseUserDetailsService userDetailsService;

        @Autowired
    private ObjectMapper objectMapper;

        private String testUsername = "testuser";
        private String testPassword = "password123";

        // ======================== Register Tests ========================
        @Nested
        @DisplayName("POST /api/v1/user/register")
        class RegisterTests {

                @Test
                @DisplayName("Should register user successfully")
                void shouldRegisterUserSuccessfully() throws Exception {
                        RegisterRequest request = new RegisterRequest(testUsername, testPassword);
                        doNothing().when(userService).register(any(RegisterRequest.class));

                        Authentication auth = new UsernamePasswordAuthenticationToken(testUsername, testPassword);
                        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                        .thenReturn(auth);

                        mvc.perform(post("/api/v1/user/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("Account created successfully."));

                        verify(userService, times(1)).register(any(RegisterRequest.class));
                        verify(authenticationManager, times(1))
                                        .authenticate(any(UsernamePasswordAuthenticationToken.class));
                }

                @Test
                @DisplayName("Should return 400 when username already exists")
                void shouldReturnBadRequestWhenUsernameExists() throws Exception {
                        RegisterRequest request = new RegisterRequest(testUsername, testPassword);
                        doThrow(new BadRequestException("Username already exists."))
                                        .when(userService).register(any(RegisterRequest.class));

                        mvc.perform(post("/api/v1/user/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isBadRequest());
                }

                @Test
                @DisplayName("Should return 400 when validation fails")
                void shouldReturnBadRequestWhenValidationFails() throws Exception {
                        RegisterRequest request = new RegisterRequest("", testPassword);

                        mvc.perform(post("/api/v1/user/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isBadRequest());
                }
        }

        // ======================== Login Tests ========================
        @Nested
        @DisplayName("POST /api/v1/user/login")
        class LoginTests {

                @Test
                @DisplayName("Should login user successfully")
                void shouldLoginUserSuccessfully() throws Exception {
                        LoginRequest request = new LoginRequest(testUsername, testPassword);
                        Authentication auth = new UsernamePasswordAuthenticationToken(testUsername, testPassword);

                        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                        .thenReturn(auth);

                        mvc.perform(post("/api/v1/user/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("Logged in"));

                        verify(authenticationManager, times(1))
                                        .authenticate(any(UsernamePasswordAuthenticationToken.class));
                }

                @Test
                @DisplayName("Should return 401 when credentials are invalid")
                void shouldReturnUnauthorizedWhenCredentialsInvalid() throws Exception {
                        LoginRequest request = new LoginRequest(testUsername, "wrongpassword");

                        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                        .thenThrow(new BadCredentialsException("Invalid credentials"));

                        mvc.perform(post("/api/v1/user/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isUnauthorized());
                }

                @Test
                @DisplayName("Should return 400 when validation fails")
                void shouldReturnBadRequestWhenValidationFails() throws Exception {
                        LoginRequest request = new LoginRequest("", testPassword);

                        mvc.perform(post("/api/v1/user/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isBadRequest());
                }
        }

        // ======================== Get Current User Tests ========================
        @Nested
        @DisplayName("GET /api/v1/user")
        class GetCurrentUserTests {

                @Test
                @DisplayName("Should return current user successfully")
                void shouldReturnCurrentUserSuccessfully() throws Exception {
                        User user = new User("testuser", "password123");
                        UserPrincipal principal = new UserPrincipal(user);
                        when(userService.getUser(principal.getUsername())).thenReturn(new UserResponse(user));
                        mvc.perform(get("/api/v1/user")
                                        .with(user(principal))
                                        .contentType(MediaType.APPLICATION_JSON))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.username").value("testuser"));

                        verify(userService).getUser(testUsername);
                }

                @Test
                @DisplayName("Should return 404 when user not found")
                void shouldReturnNotFound_WhenUserNotExists() throws Exception {
                        User user = new User(testUsername, testPassword);
                        UserPrincipal principal = new UserPrincipal(user);
                        when(userService.getUser(testUsername))
                                        .thenThrow(new ResourceNotFoundException("User not found."));

                        mvc.perform(get("/api/v1/user")
                                        .with(user(principal))
                                        .contentType(MediaType.APPLICATION_JSON))
                                        .andDo(print())
                                        .andExpect(status().isNotFound());
                }
        }

        // ======================== Delete User Tests ========================
        @Nested
        @DisplayName("DELETE /api/v1/user")
        class DeleteUserTests {

                @Test
                @DisplayName("Should delete user successfully")
                void shouldDeleteUserSuccessfully() throws Exception {
                        doNothing().when(managementService).deleteUser(testUsername);

                        mvc.perform(delete("/api/v1/user")
                                        .with(csrf())
                                        .with(user(new UserPrincipal(new User(testUsername, testPassword))))
                                        .contentType(MediaType.APPLICATION_JSON))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("Account deleted successfully"));

                        verify(managementService, times(1)).deleteUser(testUsername);
                }

                @Test
                @DisplayName("Should return 404 when user not found")
                void shouldReturnNotFoundWhenUserNotExists() throws Exception {
                        doThrow(new ResourceNotFoundException("User not found."))
                                        .when(managementService).deleteUser(testUsername);

                        mvc.perform(delete("/api/v1/user")
                                        .with(csrf())
                                        .with(user(new UserPrincipal(new User(testUsername, testPassword))))
                                        .contentType(MediaType.APPLICATION_JSON))
                                        .andExpect(status().isNotFound());
                }
        }
}
