package dev.nelson.aven.finance.controller;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.repository.UserRepository;
import dev.nelson.aven.finance.dto.*;
import dev.nelson.aven.finance.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FinanceController {
    private final FinanceService finance;
    private final UserRepository users;

    public FinanceController(FinanceService finance, UserRepository users) {
        this.finance = finance;
        this.users = users;
    }

    @GetMapping("/accounts")
    public Object accounts(Authentication auth) { return finance.listAccounts(currentUser(auth)); }

    @PostMapping("/accounts")
    public ResponseEntity<?> createAccount(Authentication auth, @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(finance.createAccount(currentUser(auth), request));
    }

    @GetMapping("/transactions")
    public Object transactions(Authentication auth) { return finance.listTransactions(currentUser(auth)); }

    @PostMapping("/transactions")
    public ResponseEntity<?> createTransaction(Authentication auth, @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(finance.createTransaction(currentUser(auth), request));
    }

    @PostMapping("/wallet/deposit")
    public ResponseEntity<?> deposit(Authentication auth, @Valid @RequestBody DepositRequest request) {
        finance.deposit(currentUser(auth), request);
        return ResponseEntity.accepted().body(Map.of("message", "Deposit request submitted to ClickPesa."));
    }

    @PostMapping("/wallet/withdraw")
    public ResponseEntity<?> withdraw(Authentication auth, @Valid @RequestBody WithdrawalRequest request) {
        finance.withdraw(currentUser(auth), request);
        return ResponseEntity.accepted().body(Map.of("message", "Withdrawal request submitted to ClickPesa."));
    }

    @PutMapping("/wallet/currency")
    public AccountResponse walletCurrency(Authentication auth,
                                          @Valid @RequestBody WalletCurrencyRequest request) {
        return finance.changeWalletCurrency(currentUser(auth), request.currency());
    }

    @PostMapping("/transfers")
    public ResponseEntity<?> transfer(Authentication auth, @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(finance.transfer(currentUser(auth), request));
    }

    @GetMapping("/users/by-aven-id/{avenId}")
    public ResponseEntity<?> recipient(@PathVariable String avenId) {
        return users.findByAvenId(avenId.trim().toUpperCase())
                .map(user -> ResponseEntity.ok(Map.of("avenId", user.getAvenId(),
                        "firstName", user.getFirstName(), "lastName", user.getLastName())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private User currentUser(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }
}
