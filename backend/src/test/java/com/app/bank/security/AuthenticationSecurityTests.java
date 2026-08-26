package com.app.bank.security;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.app.bank.api.AccountController;
import com.app.bank.api.UserController;
import com.app.bank.dto.response.UserResponse;
import com.app.bank.model.User;
import com.app.bank.service.AccountService;
import com.app.bank.service.ManagementService;
import com.app.bank.service.UserService;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({ UserController.class, AccountController.class })
@Import(SecurityConfig.class)
public class AuthenticationSecurityTests {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AccountService accountService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private ManagementService managementService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @MockitoBean
    private UserPrincipal userPrincipal;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void loginEndpoint_allowsUnauthenticatedRequests() throws Exception {
        User loginPayload = new User("", "");
        mvc.perform(post("/api/v1/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void registerEndpoint_allowsUnauthenticatedRequests() throws Exception {
        User registerPayload = new User("", "");
        mvc.perform(post("/api/v1/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void protectedEndpoint_rejectsUnauthenticatedRequests() throws Exception {
        mvc.perform(get("/api/v1/user").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
    
    @Test
    public void protectedEndpoint_allowsAuthenticatedRequests() throws Exception {
        User user = new User("testUser", "testPass");
        UserPrincipal principal = new UserPrincipal(user);
        // when(userDetailsService.loadUserByUsername("testUser")).thenReturn(new UserPrincipal(user));
        when(userService.getUser(principal.getUsername())).thenReturn(new UserResponse(user));
        mvc.perform(get("/api/v1/user")
            .with(user(principal))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());
        }
}