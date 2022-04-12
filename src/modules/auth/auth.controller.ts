import { Request, Response } from "express";
import { sign as jwtSign } from "jsonwebtoken";
import User from "../auth/user.model";
import { Controller, Post } from "../../core";
import { Validate } from "../../core/decorators/validate.decorator";
import { UserRegisterDTO } from "../../modules/auth/user-register.dto";
import { imagekit } from "../../config/imagekit.config";

@Controller("/auth")
export default class AuthController {
  @Post("/register")
  @Validate(UserRegisterDTO, { isMultipart: true, fieldName: "avatar" })
  public async registerUser(req: Request, res: Response) {
    const newUserDetails = req.body as UserRegisterDTO;
    const newUserFile = req.file;

    const { email, password, confirmPassword, username } = newUserDetails;

    if (password !== confirmPassword) {
      res.status(400).json({
        message: "Validation failed",
        errors: {
          confirmPassword: [
            `confirmPassword must match password, "${confirmPassword}" does not match "${password}"`,
          ],
        },
      });
      return;
    }

    // checking if user already exists
    let existingUser = await User.findOne({
      username,
    });
    if (existingUser) {
      res.status(400).json({
        message: `Username: "&${existingUser.username}" already exists`,
      });
      return;
    }
    existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        message: `Email: "${existingUser.email}" already exists`,
      });
      return;
    }

    const imageExtension = newUserFile?.originalname.split(".").slice(-1)[0];
    const fileName = `${username}_profile_image.${imageExtension}`;
    try {
      const uploaded = await imagekit.upload({
        file: newUserFile?.buffer as Buffer,
        fileName,
      });
      // create new user
      const newUser = new User({
        username,
        email,
        password,
        avatar: uploaded.url,
      });
      const response = await newUser.save();
      res.json({
        message: "Registered successfully",
        token: jwtSign(
          {
            _id: response._id,
            username: response.username,
            email: response.email,
            avatar: response.avatar,
          },
          process.env.JWT_SECRET as string
        ),
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    }
  }
}
