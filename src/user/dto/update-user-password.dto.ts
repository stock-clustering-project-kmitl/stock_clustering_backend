import {IsStrongPassword} from 'class-validator'

export class UpdateUserPasswordDto {
    
    currentPassword: string;

    @IsStrongPassword() 
    newPassword: string;
}
