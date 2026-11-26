package group15.pantrypal.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

// Creates the signed login token (JWT) the app sends with every request.
// The token's "subject" is the user's id, so the backend always knows who is asking.
@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final long expirationDays;

    public TokenService(JwtEncoder jwtEncoder,
                        @Value("${app.jwt-expiration-days}") long expirationDays) {
        this.jwtEncoder = jwtEncoder;
        this.expirationDays = expirationDays;
    }

    public String createToken(UserAuth user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(user.getUserId()))
                .claim("username", user.getUsername())
                .issuedAt(now)
                .expiresAt(now.plus(expirationDays, ChronoUnit.DAYS))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    // The logged-in user's id, read from a checked token
    public static Long userIdFrom(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
