FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy dependency specifications and wrapper first for caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Copy source code and build package
COPY src ./src
COPY prisma ./prisma
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar artifact from builder stage
COPY --from=builder /app/target/taskforge.jar app.jar

# Expose server port
EXPOSE 8080

# Environment variables with defaults
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]
