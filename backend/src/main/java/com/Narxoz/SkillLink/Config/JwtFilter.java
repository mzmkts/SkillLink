package com.Narxoz.SkillLink.Config;

import com.Narxoz.SkillLink.Service.ServiceImpl.UserServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserServiceImpl userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("AUTH HEADER: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);

            System.out.println("EMAIL FROM TOKEN: " + email);

            if (email != null
                    && jwtService.isValid(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                var userDetails = userService.loadUserByUsername(email);

                if (userDetails != null) {

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);

                    System.out.println("AUTH SET SUCCESS");
                }
            }
        }

        System.out.println("FINAL AUTH: " +
                SecurityContextHolder.getContext().getAuthentication());

        filterChain.doFilter(request, response);
    }
}