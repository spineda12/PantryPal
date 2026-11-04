package group15.pantrypal.useritems;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "user_items")
public class UserItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_items_id")
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "item_id")
    private Long itemId;

    // Integer/Boolean (not int/boolean) so a PATCH can tell "not sent" (null)
    // apart from a real value like 0 or false.
    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit")
    private String unit;

    @Column(name = "expiration_date")
    private String expirationDate;

    // JSON name is "isFavorite"; "is_favorite" is also accepted for safety.
    @Column(name = "is_favorite")
    @JsonProperty("isFavorite")
    @JsonAlias("is_favorite")
    private Boolean isFavorite;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getExpirationDate() { return expirationDate; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

    @JsonProperty("isFavorite")
    public Boolean getIsFavorite() { return isFavorite; }

    @JsonProperty("isFavorite")
    @JsonAlias("is_favorite")
    public void setIsFavorite(Boolean isFavorite) { this.isFavorite = isFavorite; }
}
