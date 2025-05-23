# Backend Dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the Zscaler cert into the image
COPY app/zscaler.crt /usr/local/share/ca-certificates/zscaler.crt

# Add the cert to the Java truststore
RUN keytool -importcert -noprompt -trustcacerts -alias zscaler \
  -file /usr/local/share/ca-certificates/zscaler.crt \
  -keystore /opt/java/openjdk/lib/security/cacerts \
  -storepass changeit

COPY . .
RUN ./gradlew build --no-daemon
EXPOSE 8080
CMD ["./gradlew", "bootRun"]
