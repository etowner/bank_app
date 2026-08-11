package com.app.bank.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.app.bank.dto.request.ChangeUsernameRequest;
import com.app.bank.dto.request.RegisterRequest;
import com.app.bank.dto.response.UserResponse;
import com.app.bank.exception.BadRequestException;
import com.app.bank.exception.ResourceNotFoundException;
import com.app.bank.model.User;
import com.app.bank.repo.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private String USERNAME = "testUser";
    private String RAW_PASSWORD = "testPass";
    private String ENCODED_PASSWORD = "encoded_testPass";


    @BeforeEach
    public void setUp() {
       registerRequest = new RegisterRequest(USERNAME, RAW_PASSWORD);
    }

    @Nested
    @DisplayName("Registration Tests")
    public class RegistrationTests {
        @Test
        void register_shouldReturnEncodedPassword_whenValidUser() { 
            when(passwordEncoder.encode(RAW_PASSWORD)).thenReturn(ENCODED_PASSWORD); 
            when(userRepository.findByUsername(registerRequest.getUsername())).thenReturn(Optional.empty());
         
            userService.register(registerRequest);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository, times(1)).insert(userCaptor.capture());
            User savedUser = userCaptor.getValue();

            assertNotNull(savedUser);
            assertEquals(USERNAME, savedUser.getUsername());
            assertEquals(ENCODED_PASSWORD, savedUser.getPassword());
        }

        @Test
        void register_shouldThrowBadRequest_whenUserAlreadyExists() {
            User existingUser = new User(USERNAME, passwordEncoder.encode(RAW_PASSWORD));
            
            when(userRepository.findByUsername(existingUser.getUsername())).thenReturn(Optional.of(existingUser));
            BadRequestException exception = assertThrows(BadRequestException.class, () -> userService.register(registerRequest));
            
            assertEquals("A user with this username already exists.", exception.getMessage());
            verify(userRepository, never()).insert(existingUser);
        }
    }

    // Get User Test
    @Nested
    @DisplayName("Get User Tests")
    public class GetUserTests {
        
        @Test
        void getUser_returnsUserResponse_whenUserExists() {
            User existingUser = new User(USERNAME, passwordEncoder.encode(RAW_PASSWORD));
            
            when(userRepository.findWithAccountsByUsername(existingUser.getUsername())).thenReturn(Optional.of(existingUser));
            UserResponse userResponse = userService.getUser(existingUser.getUsername());
            
            assertNotNull(userResponse);
            assertEquals(existingUser.getUsername(), userResponse.getUsername());
        }

        @Test
        void getUser_throwsResourceNotFoundException_whenUserDoesNotExist() {
            when(userRepository.findWithAccountsByUsername(USERNAME)).thenReturn(Optional.empty());
            assertThrows(ResourceNotFoundException.class, () -> userService.getUser(USERNAME));
        }
    }
    

    // Change Username Test
    @Nested
    @DisplayName("Change Username Tests")
    public class ChangeUsernameTests {
       
        @Test
        void changeUsername_shouldUpdateUsername_whenValid() {
            String newUsername = "newUsername";
            ChangeUsernameRequest request = new ChangeUsernameRequest(RAW_PASSWORD, newUsername);
            
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(new User(USERNAME, ENCODED_PASSWORD)));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
            when(userRepository.findByUsername(newUsername)).thenReturn(Optional.empty());
            
            userService.changeUsername(USERNAME, request);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            
            assertEquals(newUsername, savedUser.getUsername());  
        }

        @Test
        void changeUsername_shouldThrowBadRequest_whenNewUsernameExists() {
            String newUsername = USERNAME; 
            ChangeUsernameRequest request = new ChangeUsernameRequest(RAW_PASSWORD, newUsername);
            
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(new User(USERNAME, ENCODED_PASSWORD)));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
            when(userRepository.findByUsername(newUsername)).thenReturn(Optional.of(new User(newUsername, ENCODED_PASSWORD)));
            
            
            BadRequestException exception = assertThrows(BadRequestException.class, 
                () -> userService.changeUsername(USERNAME, request)
            );
            
            assertEquals("Username already exists.", exception.getMessage());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        void changeUsername_shouldThrowBadCredentials_whenPasswordIsIncorrect() {
            when(userRepository.findByUsername(USERNAME))
                .thenReturn(Optional.of(new User(USERNAME, ENCODED_PASSWORD)));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(false);

            assertThrows(BadCredentialsException.class,
                () -> userService.changeUsername(USERNAME, new ChangeUsernameRequest(RAW_PASSWORD, "newUsername")));

            verify(userRepository, never()).save(any(User.class));
        }
    }

    // Change Password Test
    @Nested
    @DisplayName("Change Password Tests")
    class ChangePasswordTests {
        
        @Test
        void changePassword_shouldUpdatePassword_whenValid() {
            String newPassword = "newPassword";
            String encodedNewPassword = "encoded_newPassword";

            when(userRepository.findByUsername(USERNAME))
                .thenReturn(Optional.of(new User(USERNAME, ENCODED_PASSWORD)));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
            when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);

            userService.changePassword(USERNAME, RAW_PASSWORD, newPassword);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            assertEquals(encodedNewPassword, userCaptor.getValue().getPassword());
        }

        @Test
        void changePassword_shouldThrowBadCredentials_whenPasswordIsIncorrect() {
            when(userRepository.findByUsername(USERNAME))
                .thenReturn(Optional.of(new User(USERNAME, ENCODED_PASSWORD)));
            when(passwordEncoder.matches(RAW_PASSWORD, ENCODED_PASSWORD)).thenReturn(false);

            assertThrows(BadCredentialsException.class,
                () -> userService.changePassword(USERNAME, RAW_PASSWORD, "newPassword"));

            verify(userRepository, never()).save(any(User.class));
        }

    }

    @Nested
    @DisplayName("Delete User Tests")
    class DeleteUserTests {

        @Test
        void deleteUser_shouldDeleteUser_whenUserExists() {
            User existingUser = new User(USERNAME, ENCODED_PASSWORD);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(existingUser));

            userService.deleteUser(USERNAME);

            verify(userRepository).delete(existingUser);
        }

        @Test
        void deleteUser_shouldThrowResourceNotFound_whenUserDoesNotExist() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                () -> userService.deleteUser(USERNAME));

            verify(userRepository, never()).delete(any(User.class));
        }
    }
}
