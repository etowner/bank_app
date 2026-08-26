package com.app.bank.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import java.math.BigDecimal;

import com.app.bank.dto.response.AccountResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;

import com.app.bank.exception.BadRequestException;
import com.app.bank.exception.ResourceNotFoundException;
import com.app.bank.model.Account;
import com.app.bank.model.User;
import com.app.bank.security.DatabaseUserDetailsService;
import com.app.bank.security.OwnershipService;
import com.app.bank.security.SecurityConfig;
import com.app.bank.security.UserPrincipal;
import com.app.bank.service.AccountService;
import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AccountController.class)
@DisplayName("AccountController Integration Tests")
@Import(SecurityConfig.class)
public class AccountControllerTests {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
private AuthenticationManager authenticationManager;
@MockitoBean
private DatabaseUserDetailsService userDetailsService;

@MockitoBean
private OwnershipService ownershipService;

    @MockitoBean
    private AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    private String testUsername = "testuser";
    private String accountNumber = "1234567890";
    private Account testAccount;
    private String currentPassword = "oldpassword";
    private User user = new User(testUsername, currentPassword);
    private UserPrincipal principal = new UserPrincipal(user);

    @BeforeEach
    void setUp() {
        testAccount = new Account(testUsername, accountNumber, "Checking");
        testAccount.setBalance(new BigDecimal("1000.00"));
        // user = new User(testUsername, currentPassword);
        // principal = new UserPrincipal(user);
    }

    // ======================== Get Account Tests ========================
    @Nested
    @DisplayName("GET /api/v1/account/{accountNumber}")
    class GetAccountTests {

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return account when user owns it")
        void shouldReturnAccountWhenOwned() throws Exception {
            AccountResponse response = new AccountResponse(testAccount);
            when(accountService.getAccountResponse(accountNumber, testUsername)).thenReturn(response);

            mvc.perform(get("/api/v1/account/{accountNumber}", accountNumber)
            .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accountNumber").value(accountNumber));

            verify(accountService, times(1)).getAccountResponse(accountNumber, testUsername);
        }

        @Test
        @WithMockUser(username = "otheruser")
        @DisplayName("Should return 403 when user does not own account")
        void shouldReturnForbiddenWhenNotOwner() throws Exception {
            when(accountService.getAccountResponse(eq(accountNumber), anyString()))
                    .thenThrow(new AccessDeniedException("You do not own this account."));

            mvc.perform(get("/api/v1/account/{accountNumber}", accountNumber)
            .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 404 when account not found")
        void shouldReturnNotFoundWhenAccountNotExists() throws Exception {
            when(accountService.getAccountResponse(accountNumber, testUsername))
                    .thenThrow(new ResourceNotFoundException("Account not found."));

            mvc.perform(get("/api/v1/account/{accountNumber}", accountNumber)
            .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    // ======================== Open Account Tests ========================
    @Nested
    @DisplayName("POST /api/v1/account/open/{type}")
    class OpenAccountTests {

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should open account successfully")
        void shouldOpenAccountSuccessfully() throws Exception {
            doNothing().when(accountService).newAccount(testUsername, "Checking");

            mvc.perform(post("/api/v1/account/open/{type}", "Checking")
            .with(csrf())
                    
            .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Account opened successfully."));

            verify(accountService, times(1)).newAccount(testUsername, "Checking");
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 400 when account creation fails")
        void shouldReturnBadRequestWhenCreationFails() throws Exception {
            doThrow(new BadRequestException("Account limit reached. A user can only have up to 3 accounts."))
                    .when(accountService).newAccount(testUsername, "Checking");

            mvc.perform(post("/api/v1/account/open/{type}", "Checking")
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 404 when user not found")
        void shouldReturnNotFoundWhenUserNotExists() throws Exception {
            doThrow(new ResourceNotFoundException("User not found."))
                    .when(accountService).newAccount(testUsername, "Checking");

            mvc.perform(post("/api/v1/account/open/{type}", "Checking")
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    // ======================== Deposit Tests ========================
    @Nested
    @DisplayName("POST /api/v1/account/{accountNumber}/deposit")
    class DepositTests {

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should deposit amount successfully")
        void shouldDepositAmountSuccessfully() throws Exception {
            BigDecimal depositAmount = new BigDecimal("100.00");
            AccountResponse response = new AccountResponse(testAccount);
            doNothing().when(accountService).depositAmount(testUsername, accountNumber, depositAmount);
            when(accountService.getAccountResponse(accountNumber, testUsername)).thenReturn(response);

            mvc.perform(post("/api/v1/account/{accountNumber}/deposit", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(depositAmount)))
                    .andExpect(status().isOk());

            verify(accountService, times(1)).depositAmount(testUsername, accountNumber, depositAmount);
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 400 when deposit amount is invalid")
        void shouldReturnBadRequestWhenAmountInvalid() throws Exception {
            BigDecimal invalidAmount = new BigDecimal("-50.00");
            doThrow(new BadRequestException("Deposit amount must be greater than zero."))
                    .when(accountService).depositAmount(testUsername, accountNumber, invalidAmount);

            mvc.perform(post("/api/v1/account/{accountNumber}/deposit", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidAmount)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(username = "otheruser")
        @DisplayName("Should return 403 when user does not own account")
        void shouldReturnForbiddenWhenNotOwner() throws Exception {
            BigDecimal depositAmount = new BigDecimal("100.00");
            
           UserPrincipal otherPrincipal = new UserPrincipal(new User("otheruser", "password"));
            doThrow(new AccessDeniedException("You do not own this account."))
                    .when(accountService).depositAmount("otheruser", accountNumber, depositAmount);

            mvc.perform(post("/api/v1/account/{accountNumber}/deposit", accountNumber)
            .with(csrf())
                    .with(user(otherPrincipal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(depositAmount)))
                    .andDo(print())
                    .andExpect(status().isForbidden());
        }
    }

    // ======================== Withdraw Tests ========================
    @Nested
    @DisplayName("POST /api/v1/account/{accountNumber}/withdraw")
    class WithdrawTests {

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should withdraw amount successfully")
        void shouldWithdrawAmountSuccessfully() throws Exception {
            BigDecimal withdrawAmount = new BigDecimal("100.00");
            AccountResponse response = new AccountResponse(testAccount);
            doNothing().when(accountService).withdrawAmount(testUsername, accountNumber, withdrawAmount);
            when(accountService.getAccountResponse(accountNumber, testUsername)).thenReturn(response);

            mvc.perform(post("/api/v1/account/{accountNumber}/withdraw", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(withdrawAmount)))
                    .andExpect(status().isOk());

            verify(accountService, times(1)).withdrawAmount(testUsername, accountNumber, withdrawAmount);
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 400 when insufficient funds")
        void shouldReturnBadRequestWhenInsufficientFunds() throws Exception {
            BigDecimal withdrawAmount = new BigDecimal("2000.00");
            doThrow(new BadRequestException("Insufficient funds."))
                    .when(accountService).withdrawAmount(testUsername, accountNumber, withdrawAmount);

            mvc.perform(post("/api/v1/account/{accountNumber}/withdraw", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(withdrawAmount)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 400 when withdrawal amount is invalid")
        void shouldReturnBadRequestWhenAmountInvalid() throws Exception {
            BigDecimal invalidAmount = new BigDecimal("-50.00");
            doThrow(new BadRequestException("Withdrawal amount must be greater than zero."))
                    .when(accountService).withdrawAmount(testUsername, accountNumber, invalidAmount);

            mvc.perform(post("/api/v1/account/{accountNumber}/withdraw", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidAmount)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ======================== Delete Account Tests ========================
    @Nested
    @DisplayName("DELETE /api/v1/account/{accountNumber}/close")
    class DeleteAccountTests {

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should close account successfully")
        void shouldCloseAccountSuccessfully() throws Exception {
            doNothing().when(accountService).deleteAccount(testUsername, accountNumber);

            mvc.perform(delete("/api/v1/account/{accountNumber}/close", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Account closed successfully."));

            verify(accountService, times(1)).deleteAccount(testUsername, accountNumber);
        }

        @Test
        @DisplayName("Should return 403 when user does not own account")
        void shouldReturnForbiddenWhenNotOwner() throws Exception {
                UserPrincipal otherPrincipal = new UserPrincipal(new User("otheruser", "password"));
            doThrow(new AccessDeniedException("You do not own this account."))
                    .when(accountService).deleteAccount("otheruser", accountNumber);

            mvc.perform(delete("/api/v1/account/{accountNumber}/close", accountNumber)
            .with(csrf())
                    .with(user(otherPrincipal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should return 404 when account not found")
        void shouldReturnNotFoundWhenAccountNotExists() throws Exception {
            doThrow(new ResourceNotFoundException("Account not found."))
                    .when(accountService).deleteAccount(testUsername, accountNumber);

            mvc.perform(delete("/api/v1/account/{accountNumber}/close", accountNumber)
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    // ======================== Delete All Accounts Tests ========================
    @Nested
    @DisplayName("DELETE /api/v1/account/close-all")
    class DeleteAllAccountsTests {

        @Test
        @WithMockUser(username = "testuser")
        @DisplayName("Should close all user accounts successfully")
        void shouldCloseAllAccountsSuccessfully() throws Exception {
            doNothing().when(accountService).deleteUserAccounts(testUsername);

            mvc.perform(delete("/api/v1/account/close-all")
            .with(csrf())
                    .with(user(principal))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Accounts closed successfully."));

            verify(accountService, times(1)).deleteUserAccounts(testUsername);
        }
    }
}
