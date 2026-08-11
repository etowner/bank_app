package com.app.bank.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.app.bank.exception.BadRequestException;
import com.app.bank.exception.ResourceNotFoundException;
import com.app.bank.model.Account;
import com.app.bank.model.User;
import com.app.bank.repo.AccountRepository;
import com.mongodb.DuplicateKeyException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AccountService Unit Tests")
public class AccountServiceTests {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionService transactionService;

    @Mock
    private UserService userService;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private AccountService accountService;

    private Account validAccount;
    private String testUsername = "testuser";
    private String accountNumber = "1234567890";

    @BeforeEach
    void setUp() {
        validAccount = new Account(testUsername, accountNumber, "Checking");
        validAccount.setBalance(new BigDecimal("1000.00"));
    }

    // ======================== New Account Tests ========================
    @Nested
    @DisplayName("newAccount Tests")
    class NewAccountTests {

        @Test 
        @DisplayName("Should create new account successfully")
        void newAccount_createsAccountSuccessfully_whenValidUser() {
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of());

            assertDoesNotThrow(() -> accountService.newAccount(testUsername, "Checking"));
            verify(accountRepository, times(1)).insert(any(Account.class));
            verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(User.class));
        }

        @Test
        @DisplayName("Should throw BadRequestException when username is null")
        void newAccount_shouldThrowBadRequest_WhenUsernameNull() {
            Account invalidAccount = new Account(null, "1234567890", "Checking");
            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.newAccount(null, "Checking"));
            assertEquals("Account username and type are required.", ex.getMessage());
            verify(accountRepository, never()).insert(invalidAccount);
        }

        @Test
        @DisplayName("Should throw BadRequestException when username is blank")
        void newAccount_shouldThrowBadRequest_WhenUsernameBlank() {
            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.newAccount("   ", "Checking"));
            assertEquals("Account username and type are required.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException when type is null")
        void newAccount_shouldThrowBadRequest_WhenTypeNull() {
            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.newAccount(testUsername, null));
            assertEquals("Account username and type are required.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException when type is blank")
        void newAccount_shouldThrowBadRequest_WhenTypeBlank() {
            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.newAccount(testUsername, ""));
            assertEquals("Account username and type are required.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user does not exist")
        void newAccount_shouldThrowResourceNotFound_WhenUserNotExists() {
            when(userService.checkforUserName(testUsername)).thenReturn(false);

            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                    () -> accountService.newAccount(testUsername, "Checking"));
            assertEquals("User not found.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException when user has 3 accounts")
        void shouldThrowBadRequestWhenMaxAccountsReached() {
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            List<Account> threeAccounts = List.of(
                    new Account(testUsername, "1111111111", "Checking"),
                    new Account(testUsername, "2222222222", "Savings"),
                    new Account(testUsername, "3333333333", "Money Market"));
            when(accountRepository.findByUsername(testUsername)).thenReturn(threeAccounts);

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.newAccount(testUsername, "Checking"));
            assertEquals("Account limit reached. A user can only have up to 3 accounts.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException on DuplicateKeyException")
        void shouldThrowBadRequestOnDuplicateKeyException() {
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of());
            when(accountRepository.insert(any(Account.class))).thenThrow(DuplicateKeyException.class);

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.newAccount(testUsername, "Checking"));
            assertEquals("Account creation failed, please try again.", ex.getMessage());
        }
    }

    // ======================== Get Account Tests ========================
    @Nested
    @DisplayName("Get Account Tests")
    class GetAccountTests {

        @Test
        @DisplayName("Should return account response when account exists and user owns it")
        void shouldReturnAccountResponseWhenOwned() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            var response = accountService.getAccountResponse(accountNumber, testUsername);
            assertNotNull(response);
            verify(accountRepository, times(1)).findByAccountNumber(accountNumber);
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when user does not own account")
        void shouldThrowAccessDeniedWhenNotOwner() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                    () -> accountService.getAccountResponse(accountNumber, "otheruser"));
            assertEquals("You do not own this account.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when account does not exist")
        void shouldThrowNotFoundWhenAccountNotExists() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                    () -> accountService.getAccountResponse(accountNumber, testUsername));
            assertEquals("Account not found.", ex.getMessage());
        }
    }

    // ======================== Verify Ownership Tests ========================
    @Nested
    @DisplayName("Verify Ownership Tests")
    class VerifyOwnershipTests {

        @Test
        @DisplayName("Should pass verification when user owns account")
        void shouldVerifyOwnershipSuccessfully() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            assertDoesNotThrow(() -> accountService.verifyOwnership(accountNumber, testUsername));
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when user does not own account")
        void shouldThrowAccessDeniedWhenUserDoesNotOwn() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                    () -> accountService.verifyOwnership(accountNumber, "otheruser"));
            assertEquals("You do not own this account.", ex.getMessage());
        }
    }

    // ======================== Deposit Tests ========================
    @Nested
    @DisplayName("Deposit Tests")
    class DepositTests {

        @Test
        @DisplayName("Should deposit amount successfully")
        void shouldDepositAmountSuccessfully() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BigDecimal depositAmount = new BigDecimal("100.00");
            assertDoesNotThrow(() -> accountService.depositAmount(testUsername, accountNumber, depositAmount));

            verify(accountRepository, times(1)).save(any(Account.class));
            verify(transactionService, times(1)).deposit(accountNumber, depositAmount);
            assertEquals(new BigDecimal("1100.00"), validAccount.getBalance());
        }

        @Test
        @DisplayName("Should throw BadRequestException when deposit amount is zero")
        void shouldThrowBadRequestWhenAmountIsZero() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.depositAmount(testUsername, accountNumber, BigDecimal.ZERO));
            assertEquals("Deposit amount must be greater than zero.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException when deposit amount is negative")
        void shouldThrowBadRequestWhenAmountIsNegative() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.depositAmount(testUsername, accountNumber, new BigDecimal("-50.00")));
            assertEquals("Deposit amount must be greater than zero.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when user does not own account")
        void shouldThrowAccessDeniedForDeposit() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                    () -> accountService.depositAmount("otheruser", accountNumber, new BigDecimal("100.00")));
            assertEquals("You do not own this account.", ex.getMessage());
        }
    }

    // ======================== Withdraw Tests ========================
    @Nested
    @DisplayName("Withdraw Tests")
    class WithdrawTests {

        @Test
        @DisplayName("Should withdraw amount successfully")
        void shouldWithdrawAmountSuccessfully() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BigDecimal withdrawAmount = new BigDecimal("100.00");
            assertDoesNotThrow(() -> accountService.withdrawAmount(testUsername, accountNumber, withdrawAmount));

            verify(accountRepository, times(1)).save(any(Account.class));
            verify(transactionService, times(1)).withdraw(accountNumber, withdrawAmount);
            assertEquals(new BigDecimal("900.00"), validAccount.getBalance());
        }

        @Test
        @DisplayName("Should throw BadRequestException when withdrawal amount is zero")
        void shouldThrowBadRequestWhenAmountIsZero() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.withdrawAmount(testUsername, accountNumber, BigDecimal.ZERO));
            assertEquals("Withdrawal amount must be greater than zero.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException when withdrawal amount is negative")
        void shouldThrowBadRequestWhenAmountIsNegative() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.withdrawAmount(testUsername, accountNumber, new BigDecimal("-50.00")));
            assertEquals("Withdrawal amount must be greater than zero.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw BadRequestException when insufficient funds")
        void shouldThrowBadRequestWhenInsufficientFunds() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> accountService.withdrawAmount(testUsername, accountNumber, new BigDecimal("2000.00")));
            assertEquals("Insufficient funds.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when user does not own account")
        void shouldThrowAccessDeniedForWithdraw() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                    () -> accountService.withdrawAmount("otheruser", accountNumber, new BigDecimal("100.00")));
            assertEquals("You do not own this account.", ex.getMessage());
        }
    }

    // ======================== Delete Account Tests ========================
    @Nested
    @DisplayName("Delete Account Tests")
    class DeleteAccountTests {

        @Test
        @DisplayName("Should delete account successfully")
        void shouldDeleteAccountSuccessfully() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            assertDoesNotThrow(() -> accountService.deleteAccount(testUsername, accountNumber));

            verify(accountRepository, times(1)).delete(validAccount);
            verify(transactionService, times(1)).deleteAccountTransactions(accountNumber);
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when user does not own account")
        void shouldThrowAccessDeniedForDelete() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(validAccount));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                    () -> accountService.deleteAccount("otheruser", accountNumber));
            assertEquals("You do not own this account.", ex.getMessage());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when account does not exist")
        void shouldThrowNotFoundWhenDeletingNonexistentAccount() {
            when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                    () -> accountService.deleteAccount(testUsername, accountNumber));
            assertEquals("Account not found.", ex.getMessage());
        }
    }

    // ======================== Update Account Usernames Tests ========================
    @Nested
    @DisplayName("Update Account Usernames Tests")
    class UpdateAccountUsernamesTests {

        @Test
        @DisplayName("Should update all account usernames successfully")
        void shouldUpdateAccountUsernamesSuccessfully() {
            Account account1 = new Account(testUsername, "1111111111", "Checking");
            Account account2 = new Account(testUsername, "2222222222", "Savings");
            List<Account> userAccounts = List.of(account1, account2);

            when(accountRepository.findByUsername(testUsername)).thenReturn(userAccounts);

            String newUsername = "newusername";
            accountService.updateAccountUsernames(testUsername, newUsername);

            verify(accountRepository, times(2)).save(any(Account.class));
        }

        @Test
        @DisplayName("Should handle empty account list when updating usernames")
        void shouldHandleEmptyAccountList() {
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of());

            assertDoesNotThrow(() -> accountService.updateAccountUsernames(testUsername, "newusername"));
            verify(accountRepository, never()).save(any(Account.class));
        }
    }

    // ======================== Get User Accounts Tests ========================
    @Nested
    @DisplayName("Get User Accounts Tests")
    class GetUserAccountsTests {

        @Test
        @DisplayName("Should return user accounts successfully")
        void shouldReturnUserAccountsSuccessfully() {
            Account account1 = new Account(testUsername, "1111111111", "Checking");
            Account account2 = new Account(testUsername, "2222222222", "Savings");
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of(account1, account2));

            var accounts = accountService.getUserAccounts(testUsername);

            assertNotNull(accounts);
            assertEquals(2, accounts.size());
        }

        @Test
        @DisplayName("Should return empty list when user has no accounts")
        void shouldReturnEmptyListWhenNoAccounts() {
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of());

            var accounts = accountService.getUserAccounts(testUsername);

            assertNotNull(accounts);
            assertEquals(0, accounts.size());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user does not exist")
        void shouldThrowNotFoundWhenUserNotExists() {
            when(userService.checkforUserName(testUsername)).thenReturn(false);

            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                    () -> accountService.getUserAccounts(testUsername));
            assertEquals("User not found.", ex.getMessage());
        }
    }

    // ======================== Delete User Accounts Tests ========================
    @Nested
    @DisplayName("Delete User Accounts Tests")
    class DeleteUserAccountsTests {

        @Test
        @DisplayName("Should delete all user accounts successfully")
        void shouldDeleteAllUserAccountsSuccessfully() {
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            Account account1 = new Account(testUsername, "1111111111", "Checking");
            Account account2 = new Account(testUsername, "2222222222", "Savings");
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of(account1, account2));

            accountService.deleteUserAccounts(testUsername);

            verify(transactionService, times(2)).deleteAccountTransactions(anyString());
            verify(accountRepository, times(1)).deleteAllByUsername(testUsername);
        }

        @Test
        @DisplayName("Should handle empty account list when deleting all accounts")
        void shouldHandleEmptyAccountListWhenDeleting() {
            when(userService.checkforUserName(testUsername)).thenReturn(true);
            when(accountRepository.findByUsername(testUsername)).thenReturn(List.of());

            accountService.deleteUserAccounts(testUsername);

            verify(transactionService, never()).deleteAccountTransactions(anyString());
            verify(accountRepository, times(1)).deleteAllByUsername(testUsername);
        }
    }
}
