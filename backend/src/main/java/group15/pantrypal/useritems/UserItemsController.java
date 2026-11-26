package group15.pantrypal.useritems;

import group15.pantrypal.auth.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Every route only sees the logged-in user's own items. The user comes from the
// login token, never from the request, so nobody can read or change someone else's pantry.
@RestController
@RequestMapping("/userItems")
public class UserItemsController {
    private final UserItemsRepository userItemsRepository;

    public UserItemsController(UserItemsRepository userItemsRepository) {
        this.userItemsRepository = userItemsRepository;
    }

    // Add an item to my pantry
    @PostMapping
    public ResponseEntity<UserItems> createUserItem(@RequestBody UserItems userItem,
                                                    @AuthenticationPrincipal Jwt jwt) {
        userItem.setUserId(TokenService.userIdFrom(jwt)); // always the logged-in user
        // Sensible defaults if the app didn't send them
        if (userItem.getQuantity() == null) userItem.setQuantity(1);
        if (userItem.getIsFavorite() == null) userItem.setIsFavorite(false);
        UserItems savedUserItem = userItemsRepository.save(userItem);
        return new ResponseEntity<>(savedUserItem, HttpStatus.CREATED);
    }

    // Everything in my pantry
    @GetMapping
    public ResponseEntity<List<UserItems>> getMyUserItems(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userItemsRepository.findByUserId(TokenService.userIdFrom(jwt)));
    }

    // Kept for the app's existing calls; only works for your own user id
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserItems>> getUserItemsByUserId(@PathVariable Long userId,
                                                                @AuthenticationPrincipal Jwt jwt) {
        if (!userId.equals(TokenService.userIdFrom(jwt))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(userItemsRepository.findByUserId(userId));
    }

    // One of my items
    @GetMapping("/{id}")
    public ResponseEntity<UserItems> getUserItemById(@PathVariable Long id,
                                                     @AuthenticationPrincipal Jwt jwt) {
        return userItemsRepository.findByIdAndUserId(id, TokenService.userIdFrom(jwt))
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Replace one of my items
    @PutMapping("/{id}")
    public ResponseEntity<UserItems> updateUserItem(@PathVariable Long id, @RequestBody UserItems userItemDetails,
                                                    @AuthenticationPrincipal Jwt jwt) {
        return userItemsRepository.findByIdAndUserId(id, TokenService.userIdFrom(jwt))
                .map(userItem -> {
                    userItem.setItemId(userItemDetails.getItemId());
                    userItem.setQuantity(userItemDetails.getQuantity());
                    userItem.setUnit(userItemDetails.getUnit());
                    userItem.setExpirationDate(userItemDetails.getExpirationDate());
                    userItem.setIsFavorite(userItemDetails.getIsFavorite());
                    return ResponseEntity.ok(userItemsRepository.save(userItem));
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Change only the fields that were sent (quantity, favorite, ...)
    @PatchMapping("/{id}")
    public ResponseEntity<UserItems> updateUserItemPartial(@PathVariable Long id, @RequestBody UserItems userItemDetails,
                                                           @AuthenticationPrincipal Jwt jwt) {
        return userItemsRepository.findByIdAndUserId(id, TokenService.userIdFrom(jwt))
                .map(userItem -> {
                    if (userItemDetails.getItemId() != null) {
                        userItem.setItemId(userItemDetails.getItemId());
                    }
                    if (userItemDetails.getExpirationDate() != null) {
                        userItem.setExpirationDate(userItemDetails.getExpirationDate());
                    }
                    if (userItemDetails.getUnit() != null) {
                        userItem.setUnit(userItemDetails.getUnit());
                    }
                    if (userItemDetails.getQuantity() != null) {
                        userItem.setQuantity(Math.max(0, userItemDetails.getQuantity()));
                    }
                    if (userItemDetails.getIsFavorite() != null) {
                        userItem.setIsFavorite(userItemDetails.getIsFavorite());
                    }
                    return ResponseEntity.ok(userItemsRepository.save(userItem));
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Remove one of my items
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteUserItem(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return userItemsRepository.findByIdAndUserId(id, TokenService.userIdFrom(jwt))
                .map(userItem -> {
                    userItemsRepository.delete(userItem);
                    return new ResponseEntity<>(HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
