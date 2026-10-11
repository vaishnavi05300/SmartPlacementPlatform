
package com.smartplacement.Demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class JwtTestController {

    @GetMapping("/protected")
    public Map<String, Object> protectedEndpoint(
            @AuthenticationPrincipal Jwt jwt) {

        return Map.of(
                "message", "JWT authentication successful!",
                "email", jwt.getSubject(),
                "role", jwt.getClaimAsString("role")
        );
    }
}
