package group15.pantrypal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// The shared list of foods (name, category, picture). One record like "chicken"
// is used by everyone's pantry, so users can add foods and read them, but not
// change or delete them: that would change or break other people's pantries.
// (There are no PUT, PATCH or DELETE routes; Spring answers those with 405.)
@RestController
@RequestMapping("/items")
public class ItemController {
    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // Add a new food
    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        if (isBlank(item.getItemName()) || isBlank(item.getItemCategory())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        // Always create a new record. Without this, sending an existing id
        // would overwrite that food for everyone.
        item.setId(null);
        Item savedItem = itemRepository.save(item);
        return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
    }

    // Get all foods
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        List<Item> items = itemRepository.findAll();
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    // Get one food by id
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
                .map(item -> new ResponseEntity<>(item, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
