import { AppDataSource } from '../database/data-source';
import { Sale } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';
import { Payment, PaymentStatus } from '../models/Payment';
import { InventoryService } from './InventoryService';
import { generateInvoiceNumber, calculateVAT } from '../utils/helpers';

export class SalesService {
  private saleRepository = AppDataSource.getRepository(Sale);
  private saleItemRepository = AppDataSource.getRepository(SaleItem);
  private paymentRepository = AppDataSource.getRepository(Payment);
  private inventoryService = new InventoryService();

  async createSale(tenantId: string, saleData: any) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate totals
      let subtotal = 0;
      let totalDiscount = 0;

      for (const item of saleData.items) {
        const lineTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
        subtotal += lineTotal;
        totalDiscount += item.discount || 0;
      }

      const vatAmount = calculateVAT(subtotal, 7.5);
      const totalAmount = subtotal + vatAmount;
      const finalAmount = totalAmount - (saleData.discountAmount || 0);

      // Create sale
      const sale = this.saleRepository.create({
        invoiceNumber: generateInvoiceNumber('INV'),
        subtotal,
        vatPercentage: 7.5,
        vatAmount,
        totalAmount,
        discountAmount: saleData.discountAmount || 0,
        finalAmount,
        customerId: saleData.customerId,
        tenantId,
        notes: saleData.notes
      });

      await queryRunner.manager.save(sale);

      // Create sale items and update inventory
      for (const item of saleData.items) {
        const saleItem = this.saleItemRepository.create({
          ...item,
          saleId: sale.id,
          totalPrice: (item.quantity * item.unitPrice) - (item.discount || 0)
        });

        await queryRunner.manager.save(saleItem);

        // Update inventory
        await this.inventoryService.updateStock(
          item.inventoryItemId,
          item.quantity,
          'sale' as any,
          sale.id
        );
      }

      // Record payment if provided
      if (saleData.paymentMethod) {
        const payment = this.paymentRepository.create({
          amount: finalAmount,
          method: saleData.paymentMethod,
          status: saleData.paymentMethod === 'online' ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
          saleId: sale.id
        });

        await queryRunner.manager.save(payment);

        if (saleData.paymentMethod !== 'online') {
          sale.status = 'completed';
          await queryRunner.manager.save(sale);
        }
      }

      await queryRunner.commitTransaction();

      return sale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSales(tenantId: string, filters?: any) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.inventoryItem', 'product')
      .leftJoinAndSelect('sale.payments', 'payments')
      .where('sale.tenantId = :tenantId', { tenantId });

    if (filters?.status) {
      query.andWhere('sale.status = :status', { status: filters.status });
    }

    if (filters?.customerId) {
      query.andWhere('sale.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('sale.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    return query.orderBy('sale.createdAt', 'DESC').getMany();
  }

  async getSaleById(saleId: string, tenantId: string) {
    return this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.inventoryItem', 'product')
      .leftJoinAndSelect('sale.payments', 'payments')
      .where('sale.id = :saleId', { saleId })
      .andWhere('sale.tenantId = :tenantId', { tenantId })
      .getOne();
  }

  async cancelSale(saleId: string) {
    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
      relations: ['items']
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status === 'cancelled') {
      throw new Error('Sale is already cancelled');
    }

    // Restore inventory
    for (const item of sale.items) {
      await this.inventoryService.updateStock(
        item.inventoryItemId,
        item.quantity,
        'return' as any
      );
    }

    sale.status = 'cancelled';
    return this.saleRepository.save(sale);
  }

  async getSalesReport(tenantId: string, startDate: Date, endDate: Date) {
    const sales = await this.getSales(tenantId, { startDate, endDate });

    const report = {
      totalSales: sales.length,
      totalRevenue: 0,
      totalVAT: 0,
      totalDiscount: 0,
      completedSales: 0,
      cancelledSales: 0,
      byPaymentMethod: {} as any,
      byProduct: {} as any
    };

    sales.forEach(sale => {
      report.totalRevenue += sale.finalAmount;
      report.totalVAT += sale.vatAmount;
      report.totalDiscount += sale.discountAmount;

      if (sale.status === 'completed') report.completedSales++;
      if (sale.status === 'cancelled') report.cancelledSales++;

      sale.items.forEach(item => {
        const key = item.inventoryItem.name;
        if (!report.byProduct[key]) {
          report.byProduct[key] = { quantity: 0, revenue: 0 };
        }
        report.byProduct[key].quantity += item.quantity;
        report.byProduct[key].revenue += item.totalPrice;
      });
    });

    return report;
  }
}
