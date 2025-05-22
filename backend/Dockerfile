# Backend Dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . .
RUN ./gradlew build --no-daemon
EXPOSE 8080
CMD ["./gradlew", "bootRun"]
