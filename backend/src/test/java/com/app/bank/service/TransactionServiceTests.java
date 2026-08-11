package com.app.bank.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.app.bank.dto.response.TransactionResponse;
import com.app.bank.exception.ResourceNotFoundException;
import com.app.bank.model.Transaction;
import com.app.bank.model.TransactionType;
import com.app.bank.repo.TransactionRepository;
import com.app.bank.security.OwnershipService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTests {

    @InjectMocks
    private TransactionService transactionService;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private OwnershipService ownershipService;

    private String accountNumber = "1234567890";
    private TransactionType transactionType = TransactionType.DEPOSIT;
    private BigDecimal amount = new BigDecimal("100.00");

    @Test
    public void testNewTransaction() {
        transactionService.newTransaction(accountNumber, transactionType, amount, null);

        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("New transaction should throw runtime exception when save fails")
    public void newTransaction_shouldThrowRuntime_whenSaveFails() {
        when(transactionRepository.save(any())).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class,
                () -> transactionService.newTransaction(accountNumber, transactionType, amount, null));
    }

    @Nested
    @DisplayName("Get Account Transactions Tests")
    public class GetAccountTransactionsTests {
        private Transaction transaction1;
        private Transaction transaction2;
    

        @Test
        void getAccountTransactions_shouldReturnTransactions_WhenAccountIsOwned() {
            transaction1 = new Transaction(accountNumber, TransactionType.DEPOSIT, new BigDecimal("100.00"), null);
            transaction2 = new Transaction(accountNumber, TransactionType.WITHDRAWAL, new BigDecimal("50.00"), null);
            
            doNothing().when(ownershipService).verifyAccountOwnership(accountNumber, "testUser");
            when(transactionRepository.findByAccountNumber(accountNumber)).thenReturn(List.of(transaction1, transaction2));

            List<TransactionResponse> transactions = transactionService.getAccountTransactions(accountNumber, "testUser");

            assertEquals(2, transactions.size());
            verify(transactionRepository, times(1)).findByAccountNumber(accountNumber);
        }

        @Test
        @DisplayName("Get Account Transactions should not find transactions when account is not owned")
        void getAccountTransactions_doesNotFindTransactions_WhenAccountIsNotOwned() {
            doThrow(new AccessDeniedException("You do not own this account."))
                .when(ownershipService).verifyAccountOwnership(accountNumber, "testuser");

            assertThrows(AccessDeniedException.class, 
                () -> transactionService.getAccountTransactions(accountNumber, "testuser"));

            verify(transactionRepository, never()).findByAccountNumber(accountNumber);
        }

        @Test
        void getAccountTransactions_doesNotFindTransactions_WhenAccountIsNotFound() {
            doThrow(new ResourceNotFoundException("Account not found."))
                .when(ownershipService).verifyAccountOwnership(accountNumber, "testuser");

            assertThrows(ResourceNotFoundException.class,
                () -> transactionService.getAccountTransactions(accountNumber, "testuser"));

            verify(transactionRepository, never()).findByAccountNumber(accountNumber);
        }
    }

}
