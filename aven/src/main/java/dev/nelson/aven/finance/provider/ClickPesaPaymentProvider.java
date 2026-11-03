package dev.nelson.aven.finance.provider;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.finance.dto.DepositRequest;
import dev.nelson.aven.finance.dto.WithdrawalRequest;
import org.springframework.stereotype.Component;

@Component
public class ClickPesaPaymentProvider implements PaymentProvider {
    @Override
    public void initiateDeposit(User user, DepositRequest request) {
        throw new PaymentProviderNotConfiguredException(
                "ClickPesa deposits are not configured yet. Add the ClickPesa API credentials and webhook settings.");
    }

    @Override
    public void initiateWithdrawal(User user, WithdrawalRequest request) {
        throw new PaymentProviderNotConfiguredException(
                "ClickPesa withdrawals are not configured yet. Add the ClickPesa API credentials and webhook settings.");
    }
}
