package org.example.controller;

import org.example.service.AmadeusService;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

import static org.junit.Assert.*;

public class FlightControllerTest {
    private FlightController controller;
    private AmadeusService amadeusService;

    @Before
    public void setUp() {
        amadeusService = Mockito.mock(AmadeusService.class);
        controller = new FlightController(amadeusService);
    }

    @Test
    public void testSearchFlights() {
        Mockito.when(amadeusService.searchFlights("MEX", "JFK", "2025-06-01", 1, "USD", true))
                .thenReturn(Mono.just("flight-result"));
        ResponseEntity<String> response = controller.searchFlights("MEX", "JFK", "2025-06-01", 1, "USD", true).block();
        assertNotNull(response);
        assertEquals("flight-result", response.getBody());
    }

    @Test
    public void testSearchAirports() {
        Mockito.when(amadeusService.searchAirports("Mexico")).thenReturn(Mono.just("airport-result"));
        ResponseEntity<String> response = controller.searchAirports("Mexico").block();
        assertNotNull(response);
        assertEquals("airport-result", response.getBody());
    }
}
