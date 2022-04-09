import { Request, Response } from "express";
import formidable from "formidable";
import validator from "validator";
import { sign as jwtSign } from "jsonwebtoken";
import User from "../models/user.model";
import Controller from "../utils/decorators/controller.decorator";
import { Post } from "../utils/decorators/handlers.decorator";

@Controller("/auth")
export default class AuthController {
  @Post("/register")
  public registerUser(req: Request, res: Response) {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({
          message: "Error parsing form",
          error: err,
        });
      } else {
        const { username, email, password } = fields;

        // checking if input is valid
        switch (true) {
          case !validator.isEmail(email as string):
            res.status(400).json({
              message: "Email is not valid",
            });
            return;
          case validator.isEmpty(username as string):
            res.status(400).json({
              message: "Username is required",
            });
            return;
          case validator.isEmpty(password as string) ||
            !validator.isLength(password as string, { min: 6 }):
            res.status(400).json({
              message: "Password is required and must be at least 6 characters",
            });
            return;
          case files.image === undefined:
            res.status(400).json({
              message: "Profile image is required",
            });
            return;

          default:
            break;
        }

        // checking if user already exists
        let existingUser = await User.findOne({
          username: fields.username,
        });
        if (existingUser) {
          res.status(400).json({
            message: `Username: "&${existingUser.username}" already exists`,
          });
          return;
        }
        existingUser = await User.findOne({ email: fields.email });
        if (existingUser) {
          res.status(400).json({
            message: `Email: "${existingUser.email}" already exists`,
          });
          return;
        }

        const imageExtension = (files.image as formidable.File).originalFilename
          ?.split(".")
          .pop();
        const imageName = `${fields.username}_profile_image.${imageExtension}`;

        // create new user
        const newUser = new User({
          username: fields.username,
          email: fields.email,
          password: fields.password,
          avatar: imageName,
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
      }
    });
  }
}
