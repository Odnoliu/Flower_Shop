<?php

namespace App\Controllers;

class PaymentController
{
    private function jsonResponse($data, $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * POST /payment/qr
     * Body: 
     * {
     *   "bank_bin": "970422",
     *   "account_number": "123456789",
     *   "account_name": "NGUYEN VAN A",
     *   "amount": 100000,
     *   "description": "Thanh toan don hang #123"
     * }
     */
    public function createQR()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $this->jsonResponse(['error' => 'Invalid JSON'], 400);
        }

        $required = ['bank_bin', 'account_number', 'amount'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->jsonResponse(['error' => "$field is required"], 400);
            }
        }

        $bankBin = $input['bank_bin'];
        $accountNumber = $input['account_number'];
        $amount = (int)$input['amount'];
        $description = $input['description'] ?? 'Thanh toan';
        $accountName = $input['account_name'] ?? '';

        $addInfo = urlencode($description);

        $qrUrl = "https://img.vietqr.io/image/{$bankBin}-{$accountNumber}-qr_only.png?amount={$amount}&addInfo={$addInfo}";

        $qrImage = @file_get_contents($qrUrl);
        if (!$qrImage) {
            $this->jsonResponse(['error' => 'Failed to generate QR code'], 500);
        }
        $qrBase64 = 'data:image/png;base64,' . base64_encode($qrImage);
        $this->jsonResponse([
            'success' => true,
            'qr_link' => $qrUrl,
            'amount' => $amount,
            'description' => $description,
            'bank_bin' => $bankBin,
            'account_number' => $accountNumber,
            'account_name' => $accountName,
            'qr_code' => $qrBase64            
        ], 201);
    }
}