package dev.nelson.aven.finance.provider;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.finance.dto.DepositRequest;
import dev.nelson.aven.finance.dto.WithdrawalRequest;

public interface PaymentProvider {
    void initiateDeposit(User user, DepositRequest request);
    void initiateWithdrawal(User user, WithdrawalRequest request);
}
