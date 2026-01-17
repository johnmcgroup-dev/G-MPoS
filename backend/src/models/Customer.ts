import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from './Tenant';

export enum CustomerType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  VIP = 'vip'
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'enum', enum: CustomerType, default: CustomerType.RETAIL })
  type: CustomerType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: '0.00' })
  totalPurchases: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: '0.00' })
  loyaltyPoints: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0.00' })
  loyaltyDiscount: number;

  @Column({ type: 'varchar', nullable: true })
  loyaltyTierId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastPurchaseDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, tenant => tenant.customers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
