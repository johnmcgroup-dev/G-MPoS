import { AppDataSource } from '../database/data-source';
import { InventoryItem } from '../models/InventoryItem';
import { InventoryTransaction, TransactionType } from '../models/InventoryTransaction';
import { Sale } from '../models/Sale';

export class InventoryService {
  private inventoryRepository = AppDataSource.getRepository(InventoryItem);
  private transactionRepository = AppDataSource.getRepository(InventoryTransaction);

  async getInventory(tenantId: string, filters?: any) {
    const query = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId });

    if (filters?.category) {
      query.andWhere('item.category = :category', { category: filters.category });
    }

    if (filters?.warehouseId) {
      query.andWhere('item.warehouseId = :warehouseId', { warehouseId: filters.warehouseId });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('item.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.lowStock) {
      query.andWhere('item.currentQuantity <= item.reorderLevel');
    }

    return query.getMany();
  }

  async getItemBySKU(tenantId: string, sku: string) {
    return this.inventoryRepository.findOne({
      where: { sku, tenantId }
    });
  }

  async getItemByBarcode(tenantId: string, barcode: string) {
    return this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere(':barcode = ANY(item.barcodes)', { barcode })
      .getOne();
  }

  async updateStock(itemId: string, quantity: number, type: TransactionType, reference?: string) {
    const item = await this.inventoryRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new Error('Item not found');
    }

    // Update quantity
    if (type === TransactionType.PURCHASE || type === TransactionType.RETURN) {
      item.currentQuantity += quantity;
    } else if (type === TransactionType.SALE) {
      if (item.currentQuantity < quantity) {
        throw new Error('Insufficient stock');
      }
      item.currentQuantity -= quantity;
    } else {
      item.currentQuantity += quantity;
    }

    await this.inventoryRepository.save(item);

    // Record transaction
    const transaction = this.transactionRepository.create({
      type,
      quantity,
      unitPrice: item.purchasePrice,
      reference,
      inventoryItemId: item.id,
      transactionDate: new Date()
    });

    await this.transactionRepository.save(transaction);

    return item;
  }

  async getItemsExpiringSoon(tenantId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere('item.expirationDate <= :futureDate', { futureDate })
      .andWhere('item.expirationDate > NOW()')
      .orderBy('item.expirationDate', 'ASC')
      .getMany();
  }

  async getItemsBelowReorderLevel(tenantId: string) {
    return this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere('item.currentQuantity <= item.reorderLevel')
      .andWhere('item.isActive = true')
      .getMany();
  }

  async createProduct(tenantId: string, data: any) {
    const item = this.inventoryRepository.create({
      ...data,
      tenantId,
      currentQuantity: 0
    });

    return this.inventoryRepository.save(item);
  }

  async updateProduct(itemId: string, data: any) {
    await this.inventoryRepository.update(itemId, data);
    return this.inventoryRepository.findOne({ where: { id: itemId } });
  }

  async getInventoryValue(tenantId: string): Promise<number> {
    const items = await this.inventoryRepository.find({ where: { tenantId } });
    return items.reduce((total, item) => total + (item.currentQuantity * item.purchasePrice), 0);
  }

  async getItemTransactionHistory(itemId: string, limit: number = 100) {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.inventoryItemId = :itemId', { itemId })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
