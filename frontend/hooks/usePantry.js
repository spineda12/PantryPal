import { API_URL } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const usePantry = () => {
  // API_URL comes from constants/api.js

  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      return userId;
    } catch (error) {
      console.error("Error getting userId:", error);
      return null;
    }
  };

  const fetchItems = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error("No user ID found");
      }

      const userItemsResponse = await fetch(
        `${API_URL}/userItems/user/${userId}`
      );
      const userItems = await userItemsResponse.json();

      return userItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  const toggleFavorite = async (itemId, newStatus) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("No user ID found");

      const userItemsResponse = await fetch(
        `${API_URL}/userItems/user/${userId}`
      );
      const userItems = await userItemsResponse.json();
      const existingUserItem = userItems.find((ui) => ui.itemId === itemId);

      let response;
      if (existingUserItem) {
        response = await fetch(`${API_URL}/userItems/${existingUserItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: newStatus }),
        });
      } else {
        response = await fetch(`${API_URL}/userItems`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            itemId: itemId,
            isFavorite: newStatus,
          }),
        });
      }

      if (!response.ok) throw new Error("Failed to toggle favorite");
      return await response.json();
    } catch (error) {
      console.error("Error in toggleFavorite:", error);
      throw error;
    }
  };

  const addItem = async (itemData) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("No user ID found");
  
      const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: itemData.itemName,
          itemCategory: itemData.itemCategory,
          itemUrl: itemData.itemUrl
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const newItem = await response.json();
      
      // Create user-item association
      const userItemResponse = await fetch(`${API_URL}/userItems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          itemId: newItem.id,
          quantity: itemData.quantity ?? 1,
          isFavorite: false,
        }),
      });
  
      if (!userItemResponse.ok) {
        throw new Error("Failed to create user-item association");
      }
  
      return newItem;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  return { fetchItems, addItem, toggleFavorite, getUserId };
};
