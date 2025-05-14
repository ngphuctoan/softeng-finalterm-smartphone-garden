import { Request, Response } from "express";
import moment from "moment";
import crypto from "crypto";
import qs from "qs";
import prisma from "@utils/db";
import { Item } from "@interfaces";
import { RecordsModel } from "@models";
import { add } from "date-fns";

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
    "99": "Unknown error",
};

type VnpParams = Record<string, any>;

function sortParams(params: Record<string, any>) {
    return Object.keys(params)
        .sort()
        .reduce((newParams, key) => {
            newParams[key] = encodeURIComponent(params[key]).replace(/%20/g, "+");
            return newParams;
        }, {} as Record<string, any>);
}

function createSecureHash(vnp_Params: Record<string, any>) {
    const signData = qs.stringify(sortParams(vnp_Params), { encode: false });
    return crypto
        .createHmac("sha512", process.env.vnp_HashSecret as string)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");
}

function formatVnpPayDate(dateStr: string) {
    return new Date(
        dateStr.replace(
            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            "$1-$2-$3T$4:$5:$6"
        )
    ).toLocaleString("vi-VN");
}

export async function createPayment(req: Request, res: Response) {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const now = moment();
    const createDate = now.format("YYYYMMDDHHmmss");
    const orderId = now.format("DDHHmmss");
    const address = (req.body.address || "").trim();
    const phoneNumber = (req.body.phoneNumber || "").trim();
    const recipientName = (req.body.recipientName || "").trim();
    const { totalAmount, bankCode, language, items } = req.body;

    const ipAddr =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    const vnp_Params: VnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: process.env.vnp_TmnCode,
        vnp_Locale: language || "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
        vnp_OrderType: "other",
        vnp_Amount: Number(totalAmount) * 100,
        vnp_ReturnUrl: `${req.protocol}://${req.get("host")}/payment/vnpay-return`,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };

    if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
    }

    const sortedParams = sortParams(vnp_Params);
    sortedParams.vnp_SecureHash = createSecureHash(vnp_Params);

    await RecordsModel.createRecordWithItems({
        orderId,
        userId: req.auth?.userId,
        vnpayParams: vnp_Params,
        totalAmount: Number(totalAmount),
        address,
        phoneNumber,
        recipientName,
        items: JSON.parse(items),
    });

    res.redirect(
        `${process.env.vnp_Url}?${qs.stringify(sortedParams, { encode: false })}`
    );
}

export async function vnpayReturn(req: Request, res: Response) {
    const vnp_Params = { ...req.query };
    const { vnp_TxnRef, vnp_ResponseCode } = vnp_Params;

    try {
        const record = await RecordsModel.findWithItems(vnp_TxnRef as string);

        if (record && record.status === "pending") {
            const isSuccess = vnp_ResponseCode === "00";

            await RecordsModel.updateStatus(
                vnp_TxnRef as string,
                isSuccess ? "success" : "failed"
            );

            if (isSuccess) {
                await RecordsModel.decrementStock(record.items);
                req.session.cart = {};
            }
        }
    } catch {} finally {
        res.redirect(`/payment/result?${qs.stringify(vnp_Params)}`);
    }
}

export async function paymentResult(req: Request, res: Response) {
    const vnp_Params: VnpParams = { ...req.query };
    const { vnp_SecureHash, vnp_ResponseCode, vnp_TxnRef, vnp_PayDate } =
        vnp_Params;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    let code =
        createSecureHash(vnp_Params) === vnp_SecureHash ? vnp_ResponseCode : "97";

    const record = await RecordsModel.findById(vnp_TxnRef);

    if (!record) {
        code = "01";
    }

    res.render("store/pages/payment", {
        code,
        message: RESPONSE_CODE_MESSAGES[code as string] || "Unknown code",
        payDate: vnp_PayDate ? formatVnpPayDate(vnp_PayDate) : undefined,
        vnp_Params,
        address: record?.address,
        phoneNumber: record?.phoneNumber,
        recipientName: record?.recipientName,
    });
}

export async function vnpayIpn(req: Request, res: Response) {
    const vnp_Params = { ...req.query };
    const { vnp_SecureHash, vnp_TxnRef, vnp_Amount } = vnp_Params;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    if (createSecureHash(vnp_Params as Record<string, any>) !== vnp_SecureHash) {
        res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
        return;
    }

    try {
        const record = await RecordsModel.findById(vnp_TxnRef as string);

        if (!record) {
            res.status(200).json({ RspCode: "01", Message: "Order not found" });
            return;
        }

        if (Number(record.totalAmount) !== Number(vnp_Amount) / 100) {
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

        res.status(200).json({ RspCode: "00", Message: "Success" });
    } catch (error) {
        console.error("Something went wrong in IPN:", error);
        res.status(200).json({ RspCode: "99", Message: "Server error" });
    }
}