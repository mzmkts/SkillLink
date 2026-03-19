package com.Narxoz.SkillLink;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().directory("backend").load();
        System.setProperty("PG_USERNAME", dotenv.get("PG_USERNAME"));
        System.setProperty("PG_PASSWORD", dotenv.get("PG_PASSWORD"));
        System.setProperty("PG_URL", dotenv.get("PG_URL"));
        SpringApplication.run(Application.class, args);
    }

}
