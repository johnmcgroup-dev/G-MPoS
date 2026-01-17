import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Warehouse } from './Warehouse';
import { InventoryItem } from './InventoryItem';
import { Sale } from './Sale';
import { Purchase } from './Purchase';
import { Customer } from './Customer';
import { Vendor } from './Vendor';
import { Expense } from './Expense';
import { Invoice } from './Invoice';
import { Subscription } from './Subscription';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  subdomain: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  contactEmail: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  taxId: string;

  @Column({ type: 'varchar', nullable: true })
  businessLicense: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  monthlyRevenue: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.tenant, { cascade: true })
  users: User[];

  @OneToMany(() => Warehouse, warehouse => warehouse.tenant, { cascade: true })
  warehouses: Warehouse[];

  @OneToMany(() => InventoryItem, item => item.tenant, { cascade: true })
  inventoryItems: InventoryItem[];

  @OneToMany(() => Sale, sale => sale.tenant, { cascade: true })
  sales: Sale[];

  @OneToMany(() => Purchase, purchase => purchase.tenant, { cascade: true })
  purchases: Purchase[];

  @OneToMany(() => Customer, customer => customer.tenant, { cascade: true })
  customers: Customer[];

  @OneToMany(() => Vendor, vendor => vendor.tenant, { cascade: true })
  vendors: Vendor[];

  @OneToMany(() => Expense, expense => expense.tenant, { cascade: true })
  expenses: Expense[];

  @OneToMany(() => Invoice, invoice => invoice.tenant, { cascade: true })
  invoices: Invoice[];

  @OneToMany(() => Subscription, subscription => subscription.tenant, { cascade: true })
  subscriptions: Subscription[];
}
