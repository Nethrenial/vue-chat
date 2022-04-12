import { BaseController } from "../core";
import AuthController from "./auth/auth.controller";

export const controllers: Array<typeof BaseController> = [AuthController];
