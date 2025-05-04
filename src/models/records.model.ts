import { Item } from "@interfaces";
import prisma from "@utils/db";

export async function getAllRecords(): Promise<any[]> {
    return await prisma.record.findMany({
        select: {
            id: true, // mã đơn
            createdAt: true, // ngày tạo
            totalAmount: true, // tổng tiền
            status: true, // trạng thái

            user: {
                select: {
                    name: true,
                    email: true,
                },
            },

            items: {
                select: {
                    amount: true, // số lượng vật phẩm mua
                    item: {
                        select: {
                            id: true, // mã sản phẩm
                            price: true, // giá
                            product: {
                                select: {
                                    name: true, // tên sản phẩm
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}

export async function createRecordWithItems(data: {
    orderId: string;
    userId: number;
    vnpayParams: Record<string, any>;
    totalAmount: number;
    items: (Item & { amount: number })[];
}) {
    return prisma.record.create({
        data: {
            id: data.orderId,
            userId: data.userId,
            vnpayParams: data.vnpayParams,
            totalAmount: data.totalAmount,
            items: {
                create: data.items.map((item) => ({
                    item: {
                        connect: { id: item.id },
                    },
                    amount: item.amount,
                })),
            },
        },
    });
}

export async function findWithItems(
    id: string
): Promise<Record<any, any> | null> {
    return await prisma.record.findUnique({
        where: { id },
        include: { items: true },
    });
}

export async function updateStatus(
    id: string,
    status: "pending" | "success" | "failed"
): Promise<Record<any, any> | null> {
    return await prisma.record.update({
        where: { id },
        data: { status },
    });
}

export async function decrementStock(
    items: { itemId: number; amount: number }[]
) {
    for (const { itemId, amount } of items) {
        await prisma.item.update({
            where: { id: itemId },
            data: { stock: { decrement: amount } },
        });
    }
}

export async function findById(id: string): Promise<Record<any, any> | null> {
    return prisma.record.findUnique({ where: { id } });
}
