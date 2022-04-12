import "reflect-metadata";

import { RequestHandler } from "express";
import { MetadataKeys } from "../enums";
import { RouteHandlerDescriptor } from "../types";

/**
 * Use this decorator to add middlewares to the controller methods
 * @param middleware A valid express style middleware function
 * @example
 * ```typescript
 * ＠Controller("/")
 * class HomeController {
 *   ＠Get("/")
 *   ＠Use(logger)
 *   public getHome() {
 *     return "Hello World";
 *   }
 * }
 * ```
 */
export function Use(middleware: RequestHandler) {
  return function (
    target: Object,
    key: string | symbol,
    desc: RouteHandlerDescriptor
  ) {
    const middlewares: Array<RequestHandler> =
      Reflect.getMetadata(MetadataKeys.Middleware, target.constructor, key) ||
      [];

    Reflect.defineMetadata(
      MetadataKeys.Middleware,
      [...middlewares, middleware],
      target.constructor,
      key
    );
  };
}
