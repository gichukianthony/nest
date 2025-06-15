import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as Bcrypt from 'bcrypt';
import { MailService } from '../mails/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}
  private async hashData(data: string): Promise<string> {
    const salt = await Bcrypt.genSalt(10);
    return await Bcrypt.hash(data, salt);
  }
  private excludePassword(user: User): Partial<User> {
    const { password, hashedRefreshToken, ...rest } = user;
    return rest;
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, password, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashData(password);

    // Create new user
    const newUser: Partial<User> = {
      name: createUserDto.name,
      email,
      password: hashedPassword,
      role: role || Role.USER, // Use enum value instead of string
    };

    try {
      // Save user
      const savedUser = await this.userRepository.save(newUser);

      // Send welcome email
      try {
        const welcomeEmailHtml = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <div style="background-color: #17a2b8; color: #ffffff; padding: 25px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to Our Platform!</h1>
      </div>
      
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">
          Dear <strong>${createUserDto.name || email}</strong>,
        </p>
        <p style="font-size: 15px; color: #555;">
          Thank you for creating an account with us. We're excited to have you on board! Your account has been successfully created.
        </p>
        <p style="font-size: 15px; color: #555;">
          You can now log in to your account and start exploring our services.
        </p>

        <div style="background-color: #f1f3f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0 0 10px; font-weight: bold; color: #333;">Your Account Details:</p>
          <p style="margin: 5px 0; color: #444;">📧 Email: <strong>${email}</strong></p>
          <p style="margin: 5px 0; color: #444;">👤 Role: <strong>${role || 'USER'}</strong></p>
        </div>

        <p style="font-size: 14px; color: #666;">
          If you have any questions or need help, don't hesitate to contact our support team. We're here to help!
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          Best regards,<br><strong>The Team</strong>
        </p>
      </div>
      
      <div style="background-color: #e9ecef; text-align: center; padding: 15px; font-size: 12px; color: #888;">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </div>
`;

        await this.mailService.sendMail({
          to: email,
          subject: 'Welcome to Our Platform!',
          html: welcomeEmailHtml,
        });
      } catch (emailError) {
        // Log the error but don't fail the user creation
        console.error('Failed to send welcome email:', emailError);
      }

      return this.excludePassword(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Helper function to remove sensitive data
  private excludeSensitiveData(
    user: User,
  ): Omit<User, 'password' | 'hashedRefreshToken'> {
    const { password, hashedRefreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  async findAll(): Promise<Omit<User, 'password' | 'hashedRefreshToken'>[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .getMany();
    return users.map((user) => this.excludeSensitiveData(user));
  }

  async searchUser(
    query: string,
  ): Promise<Omit<User, 'password' | 'hashedRefreshToken'>[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .where('user.name ILIKE :query', { query: `%${query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${query}%` })
      .getMany();
    return users.map((user) => this.excludeSensitiveData(user));
  }

  async findOne(
    id: number,
  ): Promise<Omit<User, 'password' | 'hashedRefreshToken'>> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.excludeSensitiveData(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<string> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
    return `User with ID ${id} removed successfully`;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .where('user.email = :email', { email })
      .getOne();
  }
}
