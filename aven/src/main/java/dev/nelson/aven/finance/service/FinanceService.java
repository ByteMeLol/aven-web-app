package dev.nelson.aven.finance.service;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.repository.UserRepository;
import dev.nelson.aven.finance.dto.*;
import dev.nelson.aven.finance.entity.Account;
import dev.nelson.aven.finance.entity.FinanceTransaction;
import dev.nelson.aven.finance.repository.AccountRepository;
import dev.nelson.aven.finance.repository.FinanceTransactionRepository;
import dev.nelson.aven.finance.provider.PaymentProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FinanceService {
    private final AccountRepository accounts;
    private final FinanceTransactionRepository transactions;
    private final UserRepository users;
    private final PaymentProvider paymentProvider;

    public FinanceService(AccountRepository accounts, FinanceTransactionRepository transactions,
                          UserRepository users, PaymentProvider paymentProvider) {
        this.accounts = accounts;
        this.transactions = transactions;
        this.users = users;
        this.paymentProvider = paymentProvider;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> listAccounts(User user) {
        return accounts.findByUserOrderByDefaultAccountDescNameAsc(user).stream()
                .map(AccountResponse::from).toList();
    }

    @Transactional
    public AccountResponse createAccount(User user, AccountRequest request) {
        String name = request.name().trim();
        if (accounts.existsByUserAndNameIgnoreCase(user, name)) {
            throw new IllegalArgumentException("An account with this name already exists.");
        }
        BigDecimal opening = request.openingBalance() == null ? BigDecimal.ZERO : request.openingBalance();
        Account account = new Account(user, name, request.type().trim(), request.currency(), false);
        account.changeBalance(opening);
        return AccountResponse.from(accounts.save(account));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> listTransactions(User user) {
        return transactions.findByUserOrderByOccurredAtDesc(user).stream()
                .map(TransactionResponse::from).toList();
    }

    @Transactional
    public TransactionResponse createTransaction(User user, TransactionRequest request) {
        if (request.idempotencyKey() != null) {
            var existing = transactions.findByIdempotencyKeyAndUser(request.idempotencyKey(), user);
            if (existing.isPresent()) return TransactionResponse.from(existing.get());
        }
        Account account = lockedAccount(request.accountId(), user);
        validateCurrency(account, request.currency());
        BigDecimal delta = request.type().equals("INCOME") ? request.amount() : request.amount().negate();
        if (delta.signum() < 0 && account.getBalance().compareTo(request.amount()) < 0) {
            throw new IllegalArgumentException("Insufficient account balance.");
        }
        account.changeBalance(delta);
        FinanceTransaction transaction = new FinanceTransaction(user, account, request.type(), request.amount(),
                request.currency(), request.description().trim(), request.category(), "MANUAL",
                request.idempotencyKey());
        return TransactionResponse.from(transactions.save(transaction));
    }

    @Transactional
    public void deposit(User user, DepositRequest request) {
        paymentProvider.initiateDeposit(user, request);
    }

    @Transactional
    public void withdraw(User user, WithdrawalRequest request) {
        paymentProvider.initiateWithdrawal(user, request);
    }

    @Transactional
    public AccountResponse changeWalletCurrency(User user, String currency) {
        Account account = accounts.findByUserAndDefaultAccountTrue(user)
                .orElseThrow(() -> new IllegalArgumentException("Default Aven Wallet not found."));
        if (account.getBalance().signum() != 0 && !account.getCurrency().equals(currency)) {
            throw new IllegalArgumentException("Wallet currency cannot change while its balance is not zero.");
        }
        account.changeCurrency(currency);
        return AccountResponse.from(account);
    }

    @Transactional
    public TransactionResponse transfer(User sender, TransferRequest request) {
        if (request.idempotencyKey() != null) {
            var existing = transactions.findByIdempotencyKeyAndUser(request.idempotencyKey(), sender);
            if (existing.isPresent()) return TransactionResponse.from(existing.get());
        }
        if (sender.getAvenId().equalsIgnoreCase(request.recipientAvenId().trim())) {
            throw new IllegalArgumentException("You cannot send money to yourself.");
        }
        User recipient = users.findByAvenId(request.recipientAvenId().trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found."));
        Account source = lockedAccount(request.accountId(), sender);
        validateCurrency(source, request.currency());
        if (source.getBalance().compareTo(request.amount()) < 0) {
            throw new IllegalArgumentException("Insufficient account balance.");
        }
        Account destination = accounts.findByUserAndDefaultAccountTrue(recipient)
                .orElseThrow(() -> new IllegalArgumentException("Recipient wallet not found."));
        validateCurrency(destination, request.currency());
        source.changeBalance(request.amount().negate());
        destination.changeBalance(request.amount());
        String note = request.note() == null || request.note().isBlank() ? "Aven transfer" : request.note().trim();
        FinanceTransaction outgoing = new FinanceTransaction(sender, source, "TRANSFER_OUT", request.amount(),
                request.currency(), note, "Transfer", "AVEN_INTERNAL", request.idempotencyKey());
        transactions.save(outgoing);
        FinanceTransaction incoming = new FinanceTransaction(recipient, destination, "TRANSFER_IN", request.amount(),
                request.currency(), note, "Transfer", "AVEN_INTERNAL", null);
        transactions.save(incoming);
        return TransactionResponse.from(outgoing);
    }

    private Account lockedAccount(Long id, User user) {
        return accounts.findForUpdate(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
    }

    private void validateCurrency(Account account, String currency) {
        if (!account.getCurrency().equals(currency)) {
            throw new IllegalArgumentException("Account currency does not match the transaction currency.");
        }
    }
}
