import express, { Request, Response } from "express";
import moment from "moment";
import crypto from "crypto";
import qs from "qs";
import prisma from "@utils/db";
import { Item } from "@interfaces";

const RESPONSE_CODE_MESSAGES: Record<string, string> = {
    "00": "Transaction successful",
    "01": "Transaction failed",
    "02": "Order already confirmed",
    "04": "Invalid amount",
    "05": "Invalid account",
    "06": "Bank error",
    "07": "Transaction canceled",
    "09": "Card expired",
    "10": "Exceeds withdrawal limit",
    "11": "Transaction not allowed",
    "12": "Card/account not registered",
    "13": "Wrong authentication info",
    "24": "Transaction canceled by user",
    "97": "Checksum failed",
    "99": "Unknown error"
};

const vnpayRoutes = express.Router();

function sortParams(params: Record<string, string>) {
    return Object.keys(params)
        .sort()
        .reduce((newParams: Record<string, string>, key: string) => {
            newParams[key] = encodeURIComponent(params[key]).replace(/%20/g, "+");
            return newParams;
        }, {});
};

vnpayRoutes.post("/payment/create", async (req: Request, res: Response) => {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const orderId = moment(date).format("DDHHmmss");
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    const totalAmount = Number(req.body.totalAmount);
    const bankCode = req.body.bankCode;
    const locale = req.body.language || "vn";

    const params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: process.env.vnp_TmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
        vnp_OrderType: "other",
        vnp_Amount: totalAmount * 100,
        vnp_ReturnUrl: process.env.vnp_ReturnUrl,
        vnp_IpAddr: ip,
        vnp_CreateDate: createDate,
    } as any;

    if (bankCode) {
        params.vnp_BankCode = bankCode;
    }

    const sortedParams = sortParams(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.vnp_HashSecret as string);
    sortedParams.vnp_SecureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    await prisma.record.create({
        data: {
            id: orderId,
            userId: req.auth?.userId,
            vnpayParams: params,
            totalAmount,
            items: {
                create: JSON.parse(req.body.items)
                    .map((item: Item & { [amount: string]: number }) => ({
                        item: {
                            connect: { id: item.id }
                        },
                        amount: item.amount
                    }))
            }
        }
    });

    const paymentUrl = `${process.env.vnp_Url}?${qs.stringify(sortedParams, { encode: false })}`;
    res.redirect(paymentUrl);
});

vnpayRoutes.get("/payment/result", async (req: Request, res: Response) => {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sorted = sortParams(vnp_Params as Record<string, string>);
    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.vnp_HashSecret as string);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    let code = secureHash === signed ? vnp_Params.vnp_ResponseCode : "97";
    
    const record = await prisma.record.findUnique({
        where: { id: vnp_Params.vnp_TxnRef as string }
    });

    if (!record) {
        code = "01";
    }

    if (code === "00") {
        req.session.cart = {};
    }
    
    res.render("store/pages/payment", {
        code,
        message: RESPONSE_CODE_MESSAGES[code as string] || "Unknown code",
        payDate: vnp_Params.vnp_PayDate
            ? new Date((vnp_Params.vnp_PayDate as string).replace(
                /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                "$1-$2-$3T$4:$5:$6"
            )).toLocaleString("vi-VN")
            : undefined,
        vnp_Params
    });
});

vnpayRoutes.get("/payment/vnpay-ipn", async (req: Request, res: Response) => {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"];
    const orderId = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];
  
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
  
    const sortedParams = sortParams(vnp_Params as Record<string, string>);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.vnp_HashSecret as string);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  
    if (secureHash !== signed) {
        res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
        return;
    }

    try {
        const record = await prisma.record.findUnique({
            where: { id: orderId as string }
        });
    
        if (!record) {
            res.status(200).json({ RspCode: "01", Message: "Order not found" });
            return;
        }

        if (Number(record.totalAmount) !== Number(vnp_Params.vnp_Amount) / 100) {
            res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
            return;
        }
    
        if (record.status !== "pending") {
            res.status(200).json({
                RspCode: "02",
                Message: "This order has been updated to the payment status",
            });
            return;
        }

        await prisma.record.update({
            where: { id: record.id },
            data: { status: rspCode === "00" ? "success" : "failed" }
        });

        res.status(200).json({ RspCode: "00", Message: "Success" });
    } catch (error) {
        console.error("Something went wrong in IPN:", error);
        res.status(200).json({ RspCode: "99", Message: "Server error" });
    }
});

export default vnpayRoutes;