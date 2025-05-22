package org.example.service;

import org.example.config.AmadeusConfig;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.function.Function;

import static org.junit.Assert.*;

public class AmadeusServiceTest {
    private AmadeusConfig config;
    private WebClient webClient;
    private AmadeusService amadeusService;

    @Before
    public void setUp() {
        config = Mockito.mock(AmadeusConfig.class);
        Mockito.when(config.getBaseUrl()).thenReturn("https://test.api.amadeus.com");
        Mockito.when(config.getClientId()).thenReturn("fake-client-id");
        Mockito.when(config.getClientSecret()).thenReturn("fake-client-secret");
        webClient = Mockito.mock(WebClient.class);
        amadeusService = new AmadeusService(config, webClient);
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    public void testSearchAirports_Mocked() {
        // Mock OAuth2 token call
        WebClient.RequestBodyUriSpec tokenUriSpec = Mockito.mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestHeadersSpec<?> tokenHeadersSpec = Mockito.mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec tokenResponseSpec = Mockito.mock(WebClient.ResponseSpec.class);
        Mockito.when(webClient.post()).thenReturn(tokenUriSpec);
        Mockito.when(tokenUriSpec.uri(Mockito.anyString())).thenReturn(tokenUriSpec);
        Mockito.when(tokenUriSpec.contentType(Mockito.any())).thenReturn(tokenUriSpec);
        Mockito.when(tokenUriSpec.body(Mockito.any())).thenAnswer(invocation -> tokenHeadersSpec);
        Mockito.when(tokenHeadersSpec.retrieve()).thenReturn(tokenResponseSpec);
        Mockito.when(tokenResponseSpec.bodyToMono((Class<Map>) (Class<?>) Map.class)).thenReturn(Mono.just(Map.of("access_token", "mock-token")));

        // Mock airport search call
        WebClient.RequestHeadersUriSpec<?> airportUriSpec = Mockito.mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.ResponseSpec airportResponseSpec = Mockito.mock(WebClient.ResponseSpec.class);
        Mockito.when(webClient.get()).thenAnswer(invocation -> airportUriSpec);
        Mockito.when(airportUriSpec.uri(Mockito.anyString())).thenAnswer(invocation -> airportUriSpec);
        Mockito.when(airportUriSpec.header(Mockito.eq(HttpHeaders.AUTHORIZATION), Mockito.anyString())).thenAnswer(invocation -> airportUriSpec);
        Mockito.when(airportUriSpec.retrieve()).thenReturn(airportResponseSpec);
        Mockito.when(airportResponseSpec.bodyToMono(String.class)).thenReturn(Mono.just("airport-result"));

        Mono<String> result = amadeusService.searchAirports("Mexico");
        assertEquals("airport-result", result.block());
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    public void testSearchFlights_Mocked() {
        // Mock OAuth2 token call
        WebClient.RequestBodyUriSpec tokenUriSpec = Mockito.mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestHeadersSpec<?> tokenHeadersSpec = Mockito.mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec tokenResponseSpec = Mockito.mock(WebClient.ResponseSpec.class);
        Mockito.when(webClient.post()).thenReturn(tokenUriSpec);
        Mockito.when(tokenUriSpec.uri(Mockito.anyString())).thenReturn(tokenUriSpec);
        Mockito.when(tokenUriSpec.contentType(Mockito.any())).thenReturn(tokenUriSpec);
        Mockito.when(tokenUriSpec.body(Mockito.any())).thenAnswer(invocation -> tokenHeadersSpec);
        Mockito.when(tokenHeadersSpec.retrieve()).thenReturn(tokenResponseSpec);
        Mockito.when(tokenResponseSpec.bodyToMono((Class<Map>) (Class<?>) Map.class)).thenReturn(Mono.just(Map.of("access_token", "mock-token")));

        // Mock flight search call
        WebClient.RequestHeadersUriSpec<?> flightUriSpec = Mockito.mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.ResponseSpec flightResponseSpec = Mockito.mock(WebClient.ResponseSpec.class);
        Mockito.when(webClient.get()).thenAnswer(invocation -> flightUriSpec);
        Mockito.when(flightUriSpec.uri(Mockito.any(Function.class))).thenAnswer(invocation -> flightUriSpec);
        Mockito.when(flightUriSpec.header(Mockito.eq(HttpHeaders.AUTHORIZATION), Mockito.anyString())).thenAnswer(invocation -> flightUriSpec);
        Mockito.when(flightUriSpec.retrieve()).thenReturn(flightResponseSpec);
        Mockito.when(flightResponseSpec.bodyToMono(String.class)).thenReturn(Mono.just("flight-result"));

        Mono<String> result = amadeusService.searchFlights("MEX", "JFK", "2025-06-01", 1, "USD", true);
        assertEquals("flight-result", result.block());
    }
}
