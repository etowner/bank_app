package com.app.bank.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.bank.model.Person;
import com.app.bank.service.AccountService;
import com.app.bank.service.PersonService;

@CrossOrigin("*")
@RequestMapping("api/v1/user")
@RestController

public class PersonController {

    private static final java.util.logging.Logger LOGGER = java.util.logging.Logger.getLogger(PersonController.class.getName());

    @Autowired
    private PersonService personService;

    @Autowired
    private AccountService accountService;

    @GetMapping
    public ResponseEntity<List<Person>> getAllUsers() {
        List<Person> users = personService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping(path = "/{userID}")
    public ResponseEntity<Person> getUser(@PathVariable String userID) {
        Person user = personService.getUser(userID);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<String> createAccount(@RequestBody Person user) {
        try {
            if (personService.checkforUser(user)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Account already exists.");
            } else {
                personService.newUser(user);
                return ResponseEntity.ok("Account created successfully.");
            }
        } catch (Exception e) {
            LOGGER.log(java.util.logging.Level.SEVERE, "Error occurred while creating account", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating the account.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> logIn(@RequestBody Person user) {
        if (personService.checkforUser(user) && personService.checkforUserPassword(user)) {
            return ResponseEntity.ok("Logged in");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Either incorrect UserID or incorrect password");
        }
    }

    @DeleteMapping(path = "/{userID}")
    public ResponseEntity<String> delete(@PathVariable String userID) {
        try {
            personService.deleteUser(userID);
            return ResponseEntity.ok("Account deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred");
        }
    }

    @DeleteMapping
    public ResponseEntity<String> erase() {
        personService.deleteAllUsers();
        accountService.deleteAll();
        return ResponseEntity.ok("All accounts deleted successfully");
    }
}
