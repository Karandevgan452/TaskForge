package com.taskforge.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;

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
    public DataSource dataSource() {
        String rawUrl = databaseUrl != null ? databaseUrl.trim() : "";
        String username = dbUsername;
        String password = dbPassword;
        String cleanJdbcUrl = rawUrl;

        try {
            String uriString = rawUrl;
            if (uriString.startsWith("jdbc:")) {
                uriString = uriString.substring(5);
            }

            if (uriString.startsWith("postgresql://") || uriString.startsWith("postgres://")) {
                URI uri = URI.create(uriString);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    if (userInfo.length > 0 && !userInfo[0].isBlank()) {
                        username = userInfo[0];
                    }
                    if (userInfo.length > 1 && !userInfo[1].isBlank()) {
                        password = userInfo[1];
                    }
                }

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
            cleanJdbcUrl = rawUrl;
        }

        // Test PostgreSQL connection; if password auth or connection fails, fallback gracefully to embedded H2!
        if (cleanJdbcUrl.startsWith("jdbc:postgresql:")) {
            try {
                Class.forName("org.postgresql.Driver");
                DriverManager.setLoginTimeout(3);
                try (Connection conn = DriverManager.getConnection(cleanJdbcUrl, username, password)) {
                    HikariDataSource ds = new HikariDataSource();
                    ds.setJdbcUrl(cleanJdbcUrl);
                    ds.setUsername(username);
                    ds.setPassword(password);
                    ds.setDriverClassName("org.postgresql.Driver");
                    return ds;
                }
            } catch (Exception ex) {
                System.err.println("[TaskForge] WARN: PostgreSQL connection/auth failed (" + ex.getMessage() + ")");
                System.err.println("[TaskForge] INFO: Automatically falling back to embedded H2 database for local execution.");
                HikariDataSource ds = new HikariDataSource();
                ds.setJdbcUrl("jdbc:h2:mem:taskforge;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
                ds.setUsername("sa");
                ds.setPassword("");
                ds.setDriverClassName("org.h2.Driver");
                return ds;
            }
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(cleanJdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
}
