package org.example.controller;

import org.example.service.AmadeusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class FlightController {
    private final AmadeusService amadeusService;

    @Autowired
    public FlightController(AmadeusService amadeusService) {
        this.amadeusService = amadeusService;
    }

    @GetMapping("/flights")
    public Mono<ResponseEntity<String>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date,
            @RequestParam int adults,
            @RequestParam String currency,
            @RequestParam(required = false, defaultValue = "false") boolean nonStop,
            @RequestParam(required = false) String cabin
    ) {
        if (date == null || date.trim().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body("Missing required parameter: date"));
        }
        return amadeusService.searchFlights(origin, destination, date, adults, currency, nonStop, cabin)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/airports")
    public Mono<ResponseEntity<String>> searchAirports(@RequestParam String keyword) {
        return amadeusService.searchAirports(keyword)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/airline")
    public Mono<ResponseEntity<String>> lookupAirline(@RequestParam String code) {
        return amadeusService.lookupAirline(code)
                .map(ResponseEntity::ok);
    }
}
