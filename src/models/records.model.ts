import prisma from "@utils/db";

export async function getAllRecords(): Promise<any[]> {
    return await prisma.record.findMany({
        select: {
          id: true,                 // mã đơn
          createdAt: true,          // ngày tạo
          totalAmount: true,        // tổng tiền
          status: true,             // trạng thái
          
          user: {
            select: {
              name: true,
              email: true,
            }
          },
          
          items: {
            select: {
              amount: true,         // số lượng vật phẩm mua
              item: {
                select: {
                  id: true,         // mã sản phẩm
                  price: true,      // giá
                  product: {
                    select: {
                      name: true    // tên sản phẩm
                    }
                  }
                }
              }
            }
          }
        }
      });
    
}; 
