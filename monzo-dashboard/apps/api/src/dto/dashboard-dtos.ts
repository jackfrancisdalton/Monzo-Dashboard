import { Transform } from "class-transformer";
import { IsDateString } from "class-validator";

export class DashboardQueryDto {
    @Transform(({ value }) => new Date(value))
    @IsDateString()
    start!: Date;
  
    @Transform(({ value }) => new Date(value))
    @IsDateString()
    end!: Date;
}