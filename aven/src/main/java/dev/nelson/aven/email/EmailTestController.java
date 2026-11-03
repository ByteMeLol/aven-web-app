package dev.nelson.aven.email;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/test")
    public String testEmail(@RequestParam String recipient) {

        emailService.sendMail(
                recipient,
                "Aven Email Test",
                "Hello! Your Aven email service is working successfully."
        );

        return "Test email sent successfully!";
    }
}