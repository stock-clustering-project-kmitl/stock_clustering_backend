import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsString()
  algorithmName: string;

  @IsObject()
  parameterPreset: Record<string, any>;

}
