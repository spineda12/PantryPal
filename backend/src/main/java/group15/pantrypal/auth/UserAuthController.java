package group15.pantrypal.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class UserAuthController {

    private static final Logger log = LoggerFactory.getLogger(UserAuthController.class);

    private final UserService userService;
    private final TokenService tokenService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public UserAuthController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }

    // Sign up
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> user) {
        String name = user.get("name");
        String username = user.get("username");
        String password = user.get("password");

        try {
            userService.createUser(name, username, password, "USER"); // Default role is USER
            log.info("New account created: {}", username);
            return ResponseEntity.ok("Account created successfully!");
        } catch (UserService.ValidationException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Registration failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during registration.");
        }
    }

    // Log in: check the password, then hand back a signed token.
    // Response: { "token": "...", "userId": 7, "username": "silvia" }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");
        Optional<UserAuth> userAuth = userService.findByUsername(username);

        if (userAuth.isPresent() && password != null
                && userService.passwordMatch(password, userAuth.get().getPassword())) {
            UserAuth found = userAuth.get();
            return ResponseEntity.ok(Map.of(
                    "token", tokenService.createToken(found),
                    "userId", found.getUserId(),
                    "username", found.getUsername()));
        }
        // Same message whether the username or the password was wrong, so nobody
        // can use this to find out which usernames exist
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
    }

    // Log out: tokens live on the device, so the app just deletes its copy.
    // (Kept so the app has an endpoint to call.)
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully.");
    }

    // Who am I? Returns safe profile fields only (never the password hash).
    @GetMapping("/me")
    public ResponseEntity<?> getAuthenticatedUser(@AuthenticationPrincipal Jwt jwt) {
        return userService.findById(TokenService.userIdFrom(jwt))
                .<ResponseEntity<?>>map(u -> {
                    Map<String, Object> body = new HashMap<>();
                    body.put("userId", u.getUserId());
                    body.put("username", u.getUsername());
                    body.put("name", u.getName());
                    body.put("email", u.getEmail());
                    return ResponseEntity.ok(body);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update my profile
    @PatchMapping("/users/profile")
    public ResponseEntity<String> updateProfile(@RequestParam String username, @RequestParam String email,
                                                @AuthenticationPrincipal Jwt jwt) {
        return userService.findById(TokenService.userIdFrom(jwt))
                .map(userAuth -> {
                    userAuth.setUsername(username);
                    userAuth.setEmail(email);
                    userService.saveUser(userAuth);
                    return ResponseEntity.ok("Profile updated successfully.");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete my account
    @DeleteMapping("/users/account")
    public ResponseEntity<String> deleteAccount(@AuthenticationPrincipal Jwt jwt) {
        userService.findById(TokenService.userIdFrom(jwt)).ifPresent(userService::deleteUser);
        return ResponseEntity.ok("Account deleted successfully.");
    }

    // ---------- Google/GitHub login (off for now, see AppConfig) ----------

    // After Google/GitHub login, send the app a token, just like a normal login
    @GetMapping("/oauth2-success")
    public ResponseEntity<String> oauth2Success(HttpServletResponse response) throws IOException {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof OAuth2User oauthUser) {
            String email = oauthUser.getAttribute("email");
            String name = oauthUser.getAttribute("name");

            UserAuth userAuth = userService.createOrUpdateOAuth2User(email, name);
            String token = tokenService.createToken(userAuth);
            response.sendRedirect(frontendUrl + "/oauthCallback"
                    + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                    + "&userId=" + userAuth.getUserId()
                    + "&username=" + URLEncoder.encode(userAuth.getUsername(), StandardCharsets.UTF_8));
            return null;
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated via OAuth2.");
    }

    @GetMapping("/oauth2-failure")
    public ResponseEntity<String> oauth2Failure() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OAuth2 login failed. Please try again.");
    }
}
