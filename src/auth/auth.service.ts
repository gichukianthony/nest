import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as Bycrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mails/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  // Helper method to generates access and refresh tokens for the user
  private async getTokens(userId: number, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
          role: role,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ), // 15 minutes
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
          role: role,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ), // 60, "2 days", "10h", "7d"
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  // Helper method to hashes the password using bcrypt
  private async hashData(data: string): Promise<string> {
    const salt = await Bycrypt.genSalt(10);
    return await Bycrypt.hash(data, salt);
  }

  // Helper method to remove password from profile
  private async saveRefreshToken(userId: number, refreshToken: string) {
    // hash refresh token
    const hashedRefreshToken = await this.hashData(refreshToken);
    // save hashed refresh token in the database
    await this.userRepository.update(userId, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }

  // Method to sign in the user
  async signIn(createAuthDto: CreateAuthDto) {
    // check if the user exists in the database
    const foundUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: ['id', 'email', 'password', 'role'], // Only select necessary fields
    });
    if (!foundUser) {
      throw new NotFoundException(
        `User with email ${createAuthDto.email} not found`,
      );
    }
    // compare hashed password with the password provided
    const foundPassword = await Bycrypt.compare(
      createAuthDto.password,
      foundUser.password,
    );
    if (!foundPassword) {
      throw new NotFoundException('Invalid credentials');
    }
    // if correct generate tokens
    const { accessToken, refreshToken } = await this.getTokens(
      foundUser.id,
      foundUser.email,
      foundUser.role, // Include role in the token payload
    );

    // save refresh token in the database
    await this.saveRefreshToken(foundUser.id, refreshToken);
    // return the tokens
    return { accessToken, refreshToken };
  }

  // Method to sign out the user
  async signOut(userId: string) {
    // set user refresh token to null
    const res = await this.userRepository.update(userId, {
      hashedRefreshToken: null,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return { message: `User with id : ${userId} signed out successfully` };
  }

  // Method to refresh tokens
  async refreshTokens(id: number, refreshToken: string) {
    // get user
    const foundUser = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!foundUser.hashedRefreshToken) {
      throw new NotFoundException('No refresh token found');
    }

    // check if the refresh token is valid
    const refreshTokenMatches = await Bycrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new NotFoundException('Invalid refresh token');
    }
    // generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
      foundUser.id,
      foundUser.email,
      foundUser.role, // Include role in the token payload
    );
    // save new refresh token in the database
    await this.saveRefreshToken(foundUser.id, newRefreshToken);
    // return the new tokens
    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and save it to the user
    const hashedToken = await this.hashData(resetToken);
    await this.userRepository.update(user.id, {
      hashedRefreshToken: hashedToken,
    });

    // Send reset password email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    const emailHtml = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #007bff; color: #ffffff; padding: 20px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
      </div>
      <div style="padding: 30px; color: #333;">
        <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 15px; color: #555;">
          We received a request to reset your password. Click the button below to set a new password for your account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
            style="background-color: #28a745; color: #fff; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 5px; display: inline-block; transition: background-color 0.3s ease;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #777;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; color: #777;">
          Please note: This link will expire in <strong>1 hour</strong>.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          Best regards,<br>The Team
        </p>
      </div>
      <div style="background-color: #f8f9fa; text-align: center; padding: 15px; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </div>
`;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: emailHtml,
    });

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Find user with the reset token
    const user = await this.userRepository.findOne({
      where: {
        hashedRefreshToken: await this.hashData(resetPasswordDto.token),
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await this.hashData(resetPasswordDto.newPassword);

    // Update user's password and clear the reset token
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      hashedRefreshToken: null,
    });

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Password Reset Successful</h1>
          <p style="color: #666;">Hello ${user.name},</p>
          <p style="color: #666;">Your password has been successfully reset.</p>
          <p style="color: #666;">If you did not make this change, please contact our support team immediately.</p>
          <p style="color: #666;">Best regards,<br>The Team</p>
        </div>
      </div>
    `;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Password Reset Successful',
      html: emailHtml,
    });

    return { message: 'Password reset successful' };
  }
}
