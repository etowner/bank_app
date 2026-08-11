package com.app.bank.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

import com.app.bank.dto.request.TransferRequest;
import com.app.bank.model.Account;
import com.app.bank.model.User;
import com.app.bank.repo.AccountRepository;
import com.app.bank.repo.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
public class TransferTransactionTest {

    @Autowired
    private ManagementService managementService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean TransactionService transactionService;

    private Account account1;
    private Account account2;

    @BeforeEach
    void setUp() {
        User user = new User("testuser", passwordEncoder.encode("password"));
        userRepository.insert(user);

        account1 = new Account("testuser", "4000", "CHECKING");
        account1.setBalance(new BigDecimal("1000.0"));
        accountRepository.insert(account1);

        account2 = new Account("testuser", "5000", "SAVINGS");
        account2.setBalance(new BigDecimal("500.0"));
        accountRepository.insert(account2);
    }

    @AfterEach
    void tearDown() {
        managementService.deleteUser("testuser");
    }

    @Test
    void transfer_shouldRollback_whenExceptionThrown() {
        doThrow(new RuntimeException("simulated"))
            .when(transactionService).transfer(any(), any(), any());

        assertThrows(RuntimeException.class, () -> {
            accountService.transfer("testuser", 
            new TransferRequest("4000", "5000", 
            new BigDecimal("500.0")));
        });

        Account updatedAccount1 = accountRepository.findByAccountNumber("4000").orElseThrow();
        Account updatedAccount2 = accountRepository.findByAccountNumber("5000").orElseThrow();

        assertThat(updatedAccount1.getBalance()).isEqualTo(BigDecimal.valueOf(1000.0));
        assertThat(updatedAccount2.getBalance()).isEqualTo(BigDecimal.valueOf(500.0));
    }
}
