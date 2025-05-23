package org.example.service;

import org.example.config.AmadeusConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class AmadeusService {
    private final AmadeusConfig config;
    private final WebClient webClient;

    // Main constructor for production
    @Autowired
    public AmadeusService(AmadeusConfig config) {
        this(config, WebClient.builder()
                .baseUrl(config.getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build());
    }

    // Secondary constructor for tests (inject mock WebClient)
    public AmadeusService(AmadeusConfig config, WebClient webClient) {
        this.config = config;
        this.webClient = webClient;
    }

    private Mono<String> getAccessToken() {
        return webClient.post()
                .uri("/v1/security/oauth2/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                        .with("client_id", config.getClientId())
                        .with("client_secret", config.getClientSecret()))
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (String) map.get("access_token"));
    }

    // Example: Search for flights (to be expanded)
    public Mono<String> searchFlights(String origin, String destination, String date, int adults, String currency, boolean nonStop) {
        return getAccessToken().flatMap(token ->
            webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/v2/shopping/flight-offers")
                    .queryParam("originLocationCode", origin)
                    .queryParam("destinationLocationCode", destination)
                    .queryParam("departureDate", date)
                    .queryParam("adults", adults)
                    .queryParam("currencyCode", currency)
                    .queryParam("nonStop", nonStop)
                    .build())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
        );
    }

    // Example: Search for airports (to be expanded)
    public Mono<String> searchAirports(String keyword) {
        return getAccessToken().flatMap(token ->
            webClient.get()
                .uri(UriComponentsBuilder.fromPath("/v1/reference-data/locations")
                    .queryParam("subType", "AIRPORT")
                    .queryParam("keyword", keyword)
                    .build().toUriString())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
        ).onErrorResume(e -> {
            e.printStackTrace();
            return Mono.just("{\"error\": \"Failed to fetch airports: " + e.getMessage() + "\"}");
        });
    }
}
