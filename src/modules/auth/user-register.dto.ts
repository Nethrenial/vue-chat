import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class UserRegisterDTO {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  confirmPassword!: string;
}
