FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the entire project
COPY . .

# Build with Maven
RUN mvn clean install -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]