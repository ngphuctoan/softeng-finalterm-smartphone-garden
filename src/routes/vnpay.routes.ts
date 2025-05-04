import { Router } from "express";
import { VnpayController } from "@controllers";

const vnpayRoutes = Router();

vnpayRoutes.post("/payment/create", VnpayController.createPayment);

vnpayRoutes.get("/payment/vnpay-return", VnpayController.vnpayReturn);

vnpayRoutes.get("/payment/result", VnpayController.paymentResult);

vnpayRoutes.get("/payment/vnpay-ipn", VnpayController.vnpayIpn);

export default vnpayRoutes;