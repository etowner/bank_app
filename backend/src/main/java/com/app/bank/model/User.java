package com.app.bank.model;

import java.util.ArrayList;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

@Document(collection = "users")
public class User {

    @Id
    private ObjectId id;
    
    @Indexed(unique = true)
    private String username;
    private String password;

    @DocumentReference
    private List<Account> accounts;

    public User(){}
    
    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.accounts = new ArrayList<>();
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

     public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Account> getAccountList() {
        return accounts;
    }

    public int getNumOfAccounts() {
        return accounts.size();
    }

   
}
