import "reflect-metadata";
import { MetadataKeys } from "../enums";

/**
 * Use this decorator to designate a class as a controller
 * @param basePath Prefix to be added to the path, "/" by default
 * @example
 * ```typescript
 * ＠Controller("/")
 * class HomeController {
 *   ＠Get("/")
 *   public getHome() {
 *     return "Hello World";
 *   }
 * }
 * ```
 */
export function Controller(basePath: string = "/"): ClassDecorator {
  return function (target) {
    Reflect.defineMetadata(MetadataKeys.BasePath, basePath, target);
  };
}
