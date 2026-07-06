import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)',
  })
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class VerifyPhoneDto {
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email?: string;

  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;

  @IsString()
  type: 'email' | 'phone';
}
