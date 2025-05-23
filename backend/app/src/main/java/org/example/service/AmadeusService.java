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
    public AmadeusService(AmadeusConfig config, WebClient.Builder webClientBuilder) {
        this.config = config;
        this.webClient = webClientBuilder
                .baseUrl(config.getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .exchangeStrategies(org.springframework.web.reactive.function.client.ExchangeStrategies.builder()
                        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB
                        .build())
                .build();
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
                .map(json -> injectEstimatedFeesIfMissing(json))
        );
    }

    private String injectEstimatedFeesIfMissing(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
            if (root.has("data") && root.get("data").isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode offer : root.get("data")) {
                    com.fasterxml.jackson.databind.node.ObjectNode price = (com.fasterxml.jackson.databind.node.ObjectNode) offer.get("price");
                    if (price != null) {
                        com.fasterxml.jackson.databind.node.ArrayNode fees = (com.fasterxml.jackson.databind.node.ArrayNode) price.get("fees");
                        double base = price.has("base") ? price.get("base").asDouble() : 0.0;
                        double total = price.has("total") ? price.get("total").asDouble() : 0.0;
                        boolean allZero = true;
                        if (fees != null && fees.size() > 0) {
                            for (com.fasterxml.jackson.databind.JsonNode fee : fees) {
                                if (fee.has("amount") && fee.get("amount").asDouble() > 0.0) {
                                    allZero = false;
                                    break;
                                }
                            }
                        }
                        if (((fees == null || fees.isEmpty()) || allZero) && total > base) {
                            double estimated = total - base;
                            com.fasterxml.jackson.databind.node.ObjectNode feeObj = mapper.createObjectNode();
                            feeObj.put("amount", String.format("%.2f", estimated));
                            feeObj.put("type", "ESTIMATED_FEES");
                            com.fasterxml.jackson.databind.node.ArrayNode newFees = mapper.createArrayNode();
                            newFees.add(feeObj);
                            price.set("fees", newFees);
                        }
                    }
                }
            }
            return mapper.writeValueAsString(root);
        } catch (Exception e) {
            e.printStackTrace();
            return json;
        }
    }

    // Example: Search for airports (to be expanded)
    public Mono<String> searchAirports(String keyword) {
        return getAccessToken().flatMap(token ->
            webClient.get()
                .uri(UriComponentsBuilder.fromPath("/v1/reference-data/locations")
                    .queryParam("subType", "AIRPORT,CITY")
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

    public Mono<String> lookupAirline(String airlineCode) {
        return getAccessToken().flatMap(token ->
            webClient.get()
                .uri(UriComponentsBuilder.fromPath("/v1/reference-data/airlines")
                    .queryParam("airlineCodes", airlineCode)
                    .build().toUriString())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
        ).onErrorResume(e -> {
            e.printStackTrace();
            return Mono.just("{\"error\": \"Failed to fetch airline info: " + e.getMessage() + "\"}");
        });
    }

    public Mono<String> priceFlightOffer(String flightOfferJson) {
        return getAccessToken().flatMap(token ->
            webClient.post()
                .uri("/v1/shopping/flight-offers/pricing")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(flightOfferJson)
                .retrieve()
                .bodyToMono(String.class)
        ).onErrorResume(e -> {
            e.printStackTrace();
            return Mono.just("{\"error\": \"Failed to price flight offer: " + e.getMessage() + "\"}");
        });
    }
}
