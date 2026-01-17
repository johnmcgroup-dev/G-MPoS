import { AppDataSource } from '../database/data-source';
import { Customer } from '../models/Customer';

export class CustomerService {
  private customerRepository = AppDataSource.getRepository(Customer);

  async createCustomer(tenantId: string, customerData: any) {
    const customer = this.customerRepository.create({
      ...customerData,
      tenantId
    });

    return this.customerRepository.save(customer);
  }

  async getCustomers(tenantId: string, filters?: any) {
    const query = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenantId = :tenantId', { tenantId });

    if (filters?.type) {
      query.andWhere('customer.type = :type', { type: filters.type });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('customer.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.orderBy('customer.createdAt', 'DESC').getMany();
  }

  async getCustomerById(customerId: string, tenantId: string) {
    return this.customerRepository.findOne({
      where: { id: customerId, tenantId }
    });
  }

  async updateCustomer(customerId: string, data: any) {
    await this.customerRepository.update(customerId, data);
    return this.customerRepository.findOne({ where: { id: customerId } });
  }

  async addLoyaltyPoints(customerId: string, points: number) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId }
    });

    if (!customer) throw new Error('Customer not found');

    customer.loyaltyPoints += points;
    return this.customerRepository.save(customer);
  }

  async redeemLoyaltyPoints(customerId: string, points: number, discount: number) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId }
    });

    if (!customer) throw new Error('Customer not found');
    if (customer.loyaltyPoints < points) throw new Error('Insufficient points');

    customer.loyaltyPoints -= points;
    customer.loyaltyDiscount += discount;

    return this.customerRepository.save(customer);
  }

  async getTopCustomers(tenantId: string, limit: number = 10) {
    return this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.tenantId = :tenantId', { tenantId })
      .orderBy('customer.totalPurchases', 'DESC')
      .take(limit)
      .getMany();
  }
}
