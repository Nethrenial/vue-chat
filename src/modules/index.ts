import { BaseController } from "@/core";
import AuthController from "@/modules/auth/auth.controller";

export const controllers: Array<typeof BaseController> = [AuthController];
