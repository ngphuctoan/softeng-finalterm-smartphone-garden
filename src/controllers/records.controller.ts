import { Request, Response } from "express";
import { RecordsModel } from "@models";
import { Parser } from "json2csv";

export const exportCSV = async (req: Request, res: Response) => {
    try {
        const records = await RecordsModel.getAllRecords();

        const recordsForCSV = records.map(record => {
            const itemsString = record.items.map((item: { item: { product: { name: string; }; }; amount: number; }) => 
                `${item.item.product.name} (${item.amount})`
            ).join(", ");

            return {
                id: record.id,
                createdAt: record.createdAt.toISOString(),
                totalAmount: record.totalAmount.toString(),
                status: record.status,
                userName: record.user.name,
                userEmail: record.user.email,
                items: itemsString,
                phoneNumber: record.phoneNumber,
                address: record.address,
                recipientName: record.recipientName,
            };
        });

        const fields = [
            { label: "Order ID", value: "id" },
            { label: "Customer Name", value: "userName" },
            { label: "Customer Email", value: "userEmail" },
            { label: "Items", value: "items" },
            { label: "Phone Number", value: "phoneNumber" },
            { label: "Address", value: "address" },
            { label: "Total Amount", value: "totalAmount" },
            { label: "Created At", value: "createdAt" },
            { label: "Status", value: "status" },
            { label: "Recipient Name", value: "recipientName" },
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(recordsForCSV);
        
        res.header("Content-Type", "text/csv");
        res.attachment("orders.csv");
        res.send(csv);
    } catch (error) {
        console.error("Error exporting CSV:", error);
        res.status(500).send("Internal Server Error");
    }
};