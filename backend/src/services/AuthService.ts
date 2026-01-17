import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';
import { generateToken, hashPassword, comparePassword } from '../utils/helpers';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(tenantId: string, userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
  }) {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email, tenantId }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(userData.password);

    const user = this.userRepository.create({
      ...userData,
      passwordHash,
      tenantId
    });

    await this.userRepository.save(user);

    const token = generateToken({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async login(email: string, password: string, tenantId: string) {
    const user = await this.userRepository.findOne({
      where: { email, tenantId }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const token = generateToken({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    };
  }
}
