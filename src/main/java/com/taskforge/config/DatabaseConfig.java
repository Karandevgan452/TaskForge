package com.taskforge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:${JDBC_DATABASE_URL:${DATABASE_URL:jdbc:postgresql://localhost:5432/taskforge}}}")
    private String databaseUrl;

    @Value("${DB_USERNAME:postgres}")
    private String dbUsername;

    @Value("${DB_PASSWORD:password}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();

        String rawUrl = databaseUrl != null ? databaseUrl.trim() : "";
        String username = dbUsername;
        String password = dbPassword;
        String cleanJdbcUrl = rawUrl;

        try {
            // Strip jdbc: prefix for URI parsing if present
            String uriString = rawUrl;
            if (uriString.startsWith("jdbc:")) {
                uriString = uriString.substring(5);
            }

            if (uriString.startsWith("postgresql://") || uriString.startsWith("postgres://")) {
                URI uri = URI.create(uriString);
                
                // If user info (username:password) is embedded in the URI
                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    if (userInfo.length > 0 && !userInfo[0].isBlank()) {
                        username = userInfo[0];
                    }
                    if (userInfo.length > 1 && !userInfo[1].isBlank()) {
                        password = userInfo[1];
                    }
                }

                // Construct clean JDBC URL without embedded credentials in host part
                String host = uri.getHost();
                int port = uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder sb = new StringBuilder("jdbc:postgresql://");
                sb.append(host);
                if (port != -1) {
                    sb.append(":").append(port);
                }
                if (path != null) {
                    sb.append(path);
                }
                if (query != null && !query.isBlank()) {
                    sb.append("?").append(query);
                }

                cleanJdbcUrl = sb.toString();
            }
        } catch (Exception ex) {
            // Fallback to raw URL if parsing fails
            cleanJdbcUrl = rawUrl;
        }

        properties.setUrl(cleanJdbcUrl);
        properties.setUsername(username);
        properties.setPassword(password);
        properties.setDriverClassName("org.postgresql.Driver");

        return properties;
    }
}
