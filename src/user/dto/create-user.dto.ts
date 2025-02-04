import {IsEmail, IsStrongPassword} from 'class-validator'

export class CreateUserDto {
    username: string;

    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;
}
