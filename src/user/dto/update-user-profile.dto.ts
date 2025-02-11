import {IsEmail, IsStrongPassword} from 'class-validator'

export class UpdateUserProfileDto {
  username?: string;

  @IsEmail()
  email?: string;
}
