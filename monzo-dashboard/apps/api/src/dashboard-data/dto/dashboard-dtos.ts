import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class DashboardQueryDto {

  @IsString()
  accountId!: string

  @IsDate()
  @Type(() => Date)
  start!: Date;

  @IsDate()
  @Type(() => Date)
  end!: Date;
}