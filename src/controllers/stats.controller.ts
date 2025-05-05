import prisma from "@utils/db";
import { Request, Response } from "express";
import { format, startOfWeek, startOfMonth, startOfDay } from "date-fns";
import { productSelect } from "@utils/selects";
import { ProductModel } from "@models";

export async function getSalesOverTime(req: Request, res: Response) {
    const groupBy = req.query.groupBy || "month";
    const records = await prisma.record.findMany({
        where: { status: "success" },
        select: { createdAt: true, totalAmount: true },
    });

    const sales: Record<string, bigint> = {};

    for (const record of records) {
        let key: string;
        const date = record.createdAt;

        if (groupBy === "week") {
            key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
        } else if (groupBy === "day") {
            key = format(startOfDay(date), "yyyy-MM-dd");
        } else {
            key = format(startOfMonth(date), "yyyy-MM");
        }

        if (!sales[key]) sales[key] = 0n;
        sales[key] += record.totalAmount;
    }

    const labels = Object.keys(sales).sort();
    const data = labels.map(label => Number(sales[label]));

    res.json({ labels, data });
}

export async function getTotalSales(req: Request, res: Response) {
    const totalSales = await prisma.record.aggregate({
        _sum: { totalAmount: true },
    });

    res.json({ totalSales: totalSales._sum.totalAmount?.toString() });
}

export async function getTotalUsers(req: Request, res: Response) {
    const totalUsers = await prisma.user.count();
    res.json({ totalUsers });
}

export async function getTotalProducts(req: Request, res: Response) {
    const totalProducts = await prisma.product.count();
    res.json({ totalProducts });
}

export async function getTopProducts(req: Request, res: Response) {
    const topProducts = await ProductModel.getMostSales(4);

    res.json(topProducts);
}

export async function getRecordStatusCounts(req: Request, res: Response) {
    const result = await prisma.record.groupBy({
        by: ["status"],
        _count: { status: true },
    });

    const labels = result.map(r => r.status);
    const data = result.map(r => r._count.status);

    res.json({ labels, data });
}