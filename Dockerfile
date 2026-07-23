FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Install Node.js & npm for Next.js frontend build stage
RUN apk add --no-cache nodejs npm

# Copy root and frontend dependency definitions
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install frontend dependencies so 'next' CLI binary is available
RUN cd frontend && npm install && cd .. && npm install

# Copy full source
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY frontend ./frontend
COPY src ./src

# Make wrapper executable & build unified Next.js + Spring Boot app
RUN chmod +x ./mvnw && npm run build

# Production runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy packaged single server executable JAR
COPY --from=builder /app/target/taskforge.jar app.jar

# Expose application port
EXPOSE 8080

ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
