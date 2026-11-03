package dev.nelson.aven.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String aven_sender;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender){
        this.mailSender=mailSender;
    }

    public void sendMail(String recipient,String subject,String message){
        SimpleMailMessage email= new SimpleMailMessage();

        email.setFrom(aven_sender);
        email.setTo(recipient);
        email.setSubject(subject);
        email.setText(message);

        mailSender.send(email);

    }
}
