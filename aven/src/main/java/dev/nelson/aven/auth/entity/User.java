
package dev.nelson.aven.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "aven-users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String avenId;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable=false)
    private boolean emailVerified = false;

    @Column(name = "profile_picture_key")
    private String profilePictureKey;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected User() {}

    public User(String avenId,  String email, String passwordHash, String firstName, String lastName) {
        this.avenId=avenId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    
    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getAvenId() { return  avenId;
    }

    public boolean isEmailVerified(){
        return emailVerified;
    }
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getProfilePictureKey() {
        return profilePictureKey;
    }

    public void setProfilePictureKey(String profilePictureKey) {
        this.profilePictureKey = profilePictureKey;
    }
}
