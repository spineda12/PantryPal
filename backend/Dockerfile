# Use an official JDK runtime as a parent image
FROM eclipse-temurin:21-jdk

# Set the working directory inside the container
WORKDIR /app

# Copy the Gradle wrapper and build configuration files first
COPY build.gradle settings.gradle gradlew /app/
COPY gradle /app/gradle/

# Copy the rest of the source code
COPY src /app/src

# Run the Gradle build inside the container to create the JAR file
RUN chmod +x gradlew && ./gradlew clean build -x test

# Copy the generated JAR file from build/libs to the working directory
RUN mv /app/build/libs/pantrypal-0.0.1-SNAPSHOT.jar /app/app.jar

# Expose port 8080
EXPOSE 8080

# Run the JAR file
# Shell form so $PORT is expanded (many hosts set PORT for you)
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]