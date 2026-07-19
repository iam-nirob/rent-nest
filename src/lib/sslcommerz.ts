import axios from "axios";
import config from "../config";

const BASE_URL = config.sslcommerz_is_live
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

interface IInitiateSessionPayload {
  total_amount: number;
  currency?: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_add1?: string;
  cus_phone?: string;
  product_name?: string;
}

// Creates a hosted checkout session and returns the redirect GatewayPageURL
const initiateSession = async (payload: IInitiateSessionPayload) => {
  const data = {
    store_id: config.sslcommerz_store_id,
    store_passwd: config.sslcommerz_store_password,
    total_amount: payload.total_amount,
    currency: payload.currency || "BDT",
    tran_id: payload.tran_id,
    success_url: payload.success_url,
    fail_url: payload.fail_url,
    cancel_url: payload.cancel_url,
    ipn_url: payload.ipn_url,
    shipping_method: "NO",
    product_name: payload.product_name || "Rental Payment",
    product_category: "Rental",
    product_profile: "general",
    cus_name: payload.cus_name,
    cus_email: payload.cus_email,
    cus_add1: payload.cus_add1 || "N/A",
    cus_city: "N/A",
    cus_postcode: "0000",
    cus_country: "Bangladesh",
    cus_phone: payload.cus_phone || "N/A",
  };

  const response = await axios.post(
    `${BASE_URL}/gwprocess/v4/api.php`,
    new URLSearchParams(data as any).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  return response.data as { status: string; GatewayPageURL?: string; failedreason?: string };
};

// Validates a transaction with SSLCommerz's validation API (used to confirm payment)
const validateTransaction = async (valId: string) => {
  const response = await axios.get(
    `${BASE_URL}/validator/api/validationserverAPI.php`,
    {
      params: {
        val_id: valId,
        store_id: config.sslcommerz_store_id,
        store_passwd: config.sslcommerz_store_password,
        format: "json",
      },
    },
  );
  return response.data as {
    status: string;
    tran_id: string;
    amount: string;
    currency: string;
    bank_tran_id?: string;
    card_type?: string;
  };
};

export const sslcommerz = {
  initiateSession,
  validateTransaction,
};
