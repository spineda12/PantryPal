# PantryPal

A pantry tracker app: add the food you have, mark favorites, see what's running low, and get recipe ideas based on what's in stock.

Originally built by Group 15 for CST 438 (Software Engineering) at CSU Monterey Bay. This is a continued personal version.

- `backend/` is a Spring Boot (Java 21) REST API with a MariaDB/MySQL database.
- `frontend/` is an Expo (React Native) app that runs on web, iOS and Android.
- Recipes come from [TheMealDB](https://www.themealdb.com/), a free API with no key needed.

## Running it locally

You need Java 21 (JDK), Node.js 18 or newer, and MariaDB or MySQL installed.

### 1. Create the database

Open your MariaDB/MySQL client and run:

```sql
CREATE DATABASE pantrypal;
```

You don't need to create any tables. The backend creates them automatically the first time it starts.

### 2. Start the backend

The backend reads its database settings from environment variables. Defaults are `localhost:3306/pantrypal`, user `root`, empty password, so if that matches your setup you can skip setting them.

macOS / Linux:

```bash
cd backend
export DB_PASSWORD=your-db-password
./gradlew bootRun
```

Windows (PowerShell):

```powershell
cd backend
$env:DB_PASSWORD="your-db-password"
.\gradlew.bat bootRun
```

It's running when you see `Started PantrypalApplication`. Check by opening http://localhost:8080/hello in a browser.

See `backend/.env.example` for every setting.

### 3. Start the app

```bash
cd frontend
npm install
cp .env.example .env
npx expo start
```

Press `w` to open it in your browser. That's the easiest way to test.

To use a real phone with Expo Go, your phone can't reach `localhost` on your computer. Change `EXPO_PUBLIC_API_URL` in `frontend/.env` to your computer's local IP, like `http://192.168.1.25:8080`, make sure both are on the same Wi-Fi, and restart Expo. For the Android emulator, use `http://10.0.2.2:8080`.

## API overview

| Endpoint | What it does |
| --- | --- |
| `POST /api/auth/register` | Create an account (`name`, `username`, `password`) |
| `POST /api/auth/login` | Log in; returns the user's id as plain text |
| `GET/POST /items`, `GET/PUT/PATCH/DELETE /items/{id}` | Food items (name, category, image URL) |
| `GET /userItems/user/{userId}` | Everything in one user's pantry |
| `POST /userItems`, `PATCH/PUT/DELETE /userItems/{id}` | A user's copy of an item: `quantity`, `unit`, `expirationDate`, `isFavorite` |
| `/pantries`, `/users` | Built but not used by the app yet |

## Changes from the class version

- Moved all passwords and secrets out of the code and into environment variables.
- Fixed restock +/− not saving (the backend's PATCH ignored `quantity`).
- Fixed favorites: the app sent `is_favorite` but the backend expected `isFavorite`, which caused every toggle to unfavorite.
- The Home screen now shows which items are favorited.
- The Favorites screen sent the wrong id when un-favoriting.
- The add-item form now has a quantity field (default 1), so new items show up in Recipes.
- Login now stores the user id correctly and shows error messages; Sign Up shows errors like "User already exists."
- Replaced the hardcoded Heroku URL with one setting (`EXPO_PUBLIC_API_URL`).
- Switched from Java 23 to Java 21 (the long-term support version).
- Removed Heroku files, leftover Supabase code, and the old Google login that used the class OAuth app.

## Turning Google login back on (optional)

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project, set up the OAuth consent screen, and create an OAuth client ID of type "Web application".
2. Add `http://localhost:8080/login/oauth2/code/google` as an authorized redirect URI.
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as environment variables for the backend.
4. Uncomment the Google lines in `backend/src/main/resources/application.properties` and the `.oauth2Login(...)` block in `backend/src/main/java/group15/pantrypal/config/AppConfig.java`.
5. Set `GOOGLE_LOGIN_ENABLED = true` in `frontend/constants/api.js`.

This currently works on the web version only.

## Ideas for what's next

- **Security:** every endpoint is public, so anyone can read or change anyone's pantry by changing the id in the URL. A good next step is real authentication (sessions or JWT) and checking that a user only touches their own items.
- Delete items from the pantry (the API supports it; the app has no button yet).
- Use `unit` and `expirationDate` in the app, and warn about food that's about to expire.
- Deploy: the backend has a Dockerfile, so it can run on hosts like Render, Railway or Fly.io, with a hosted MySQL/MariaDB database.
