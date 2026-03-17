package com.bean.hotel_management.booking.model;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH("Cash", "Tiền mặt"),
    CREDIT_CARD("Credit Card", "Thẻ tín dụng"),
    DEBIT_CARD("Debit Card", "Thẻ ghi nợ"),
    BANK_TRANSFER("Bank Transfer", "Chuyển khoản"),
    E_WALLET("E-Wallet", "Ví điện tử"),
    PAYPAL("PayPal", "PayPal");

    private final String displayName;
    private final String vietnameseName;

    PaymentMethod(String displayName, String vietnameseName) {
        this.displayName = displayName;
        this.vietnameseName = vietnameseName;
    }
}