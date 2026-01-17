import { AppDataSource } from '../database/data-source';
import { Purchase } from '../models/Purchase';
import { PurchaseItem } from '../models/PurchaseItem';
import { InventoryService } from './InventoryService';
import { generateInvoiceNumber, calculateVAT } from '../utils/helpers';

export class PurchaseService {
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private purchaseItemRepository = AppDataSource.getRepository(PurchaseItem);
  private inventoryService = new InventoryService();

  async createPurchase(tenantId: string, purchaseData: any) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;

      for (const item of purchaseData.items) {
        subtotal += (item.quantity * item.unitPrice) - (item.discount || 0);
      }

      const vatAmount = calculateVAT(subtotal);
      const totalAmount = subtotal + vatAmount;
      const finalAmount = totalAmount - (purchaseData.discountAmount || 0);

      const purchase = this.purchaseRepository.create({
        poNumber: generateInvoiceNumber('PO'),
        vendorId: purchaseData.vendorId,
        subtotal,
        vatPercentage: 7.5,
        vatAmount,
        totalAmount,
        discountAmount: purchaseData.discountAmount || 0,
        finalAmount,
        orderDate: new Date(),
        expectedDeliveryDate: purchaseData.expectedDeliveryDate,
        tenantId,
        notes: purchaseData.notes
      });

      await queryRunner.manager.save(purchase);

      for (const item of purchaseData.items) {
        const purchaseItem = this.purchaseItemRepository.create({
          ...item,
          purchaseId: purchase.id,
          totalPrice: (item.quantity * item.unitPrice) - (item.discount || 0),
          quantityReceived: 0
        });

        await queryRunner.manager.save(purchaseItem);
      }

      await queryRunner.commitTransaction();
      return purchase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async receivePurchase(purchaseId: string, receivedItems: any[]) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: ['items']
    });

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    for (const receivedItem of receivedItems) {
      const item = purchase.items.find(pi => pi.id === receivedItem.purchaseItemId);
      if (item) {
        item.quantityReceived = (item.quantityReceived || 0) + receivedItem.quantity;
        await this.purchaseItemRepository.save(item);

        // Update inventory
        await this.inventoryService.updateStock(
          item.inventoryItemId,
          receivedItem.quantity,
          'purchase' as any,
          purchase.id
        );
      }
    }

    const allReceived = purchase.items.every(item => item.quantityReceived === item.quantity);
    if (allReceived) {
      purchase.status = 'completed';
      purchase.receivedDate = new Date();
    } else {
      purchase.status = 'received';
      purchase.receivedDate = new Date();
    }

    return this.purchaseRepository.save(purchase);
  }

  async getPurchases(tenantId: string, filters?: any) {
    const query = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.items', 'items')
      .leftJoinAndSelect('items.inventoryItem', 'product')
      .where('purchase.tenantId = :tenantId', { tenantId });

    if (filters?.status) {
      query.andWhere('purchase.status = :status', { status: filters.status });
    }

    if (filters?.vendorId) {
      query.andWhere('purchase.vendorId = :vendorId', { vendorId: filters.vendorId });
    }

    return query.orderBy('purchase.createdAt', 'DESC').getMany();
  }

  async getPurchasesReport(tenantId: string, startDate: Date, endDate: Date) {
    const purchases = await this.getPurchases(tenantId);

    const filtered = purchases.filter(p =>
      new Date(p.createdAt) >= startDate && new Date(p.createdAt) <= endDate
    );

    const report = {
      totalPurchases: filtered.length,
      totalSpent: 0,
      totalVAT: 0,
      averageValue: 0,
      byVendor: {} as any,
      byProduct: {} as any
    };

    filtered.forEach(purchase => {
      report.totalSpent += purchase.finalAmount;
      report.totalVAT += purchase.vatAmount;

      const vendorKey = purchase.vendorId;
      if (!report.byVendor[vendorKey]) {
        report.byVendor[vendorKey] = { count: 0, total: 0 };
      }
      report.byVendor[vendorKey].count++;
      report.byVendor[vendorKey].total += purchase.finalAmount;

      purchase.items.forEach(item => {
        const key = item.inventoryItem.name;
        if (!report.byProduct[key]) {
          report.byProduct[key] = { quantity: 0, cost: 0 };
        }
        report.byProduct[key].quantity += item.quantity;
        report.byProduct[key].cost += item.totalPrice;
      });
    });

    report.averageValue = filtered.length > 0 ? report.totalSpent / filtered.length : 0;

    return report;
  }
}
