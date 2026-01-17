import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from './Tenant';
import { Warehouse } from './Warehouse';
import { InventoryTransaction } from './InventoryTransaction';
import { SaleItem } from './SaleItem';
import { PurchaseItem } from './PurchaseItem';

export enum BarcodeType {
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  CODE128 = 'CODE128',
  QR = 'QR'
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', array: true, default: () => "ARRAY[]::varchar[]" })
  barcodes: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '7.5' })
  vat: number;

  @Column({ type: 'int' })
  currentQuantity: number;

  @Column({ type: 'int' })
  reorderLevel: number;

  @Column({ type: 'int', default: 10 })
  reorderQuantity: number;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  warehouseId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, tenant => tenant.inventoryItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => Warehouse, warehouse => warehouse.inventoryItems, { nullable: true })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @OneToMany(() => InventoryTransaction, transaction => transaction.inventoryItem, { cascade: true })
  transactions: InventoryTransaction[];

  @OneToMany(() => SaleItem, item => item.inventoryItem)
  saleItems: SaleItem[];

  @OneToMany(() => PurchaseItem, item => item.inventoryItem)
  purchaseItems: PurchaseItem[];
}
