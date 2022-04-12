import "reflect-metadata";
import { MetadataKeys, Methods } from "../enums";
import { NethrenialApplicationRouter, RouteHandlerDescriptor } from "../types";

function routeBinder(method: Methods, path: string) {
  return function () {
    return function (
      target: Object,
      handlerName: string | symbol,
      descriptor: RouteHandlerDescriptor
    ) {
      const controllerClass = target.constructor;
      const routersExists = Reflect.hasMetadata(
        MetadataKeys.Routers,
        controllerClass
      );

      const routers: NethrenialApplicationRouter[] = routersExists
        ? Reflect.getMetadata(MetadataKeys.Routers, controllerClass)
        : [];

      routers.push({
        method,
        path,
        handlerName,
      });

      Reflect.defineMetadata(MetadataKeys.Routers, routers, controllerClass);
    };
  };
}

/**
 * Decorate a controller class's method with this to setup it as a GET route.
 * @param path Prefix to be used for the route
 * @example
 * ```ts
 * class MyController {
 *     ＠Get('/users')
 *     //set the route to /users + whatever the controller's base path is
 *     getUsers() {
 *         // ...
 *     }
 * }
 * ```
 */
export function Get(path: string = "") {
  return routeBinder(Methods.Get, path)();
}

/**
 * Decorate a controller class's method with this to setup it as a POST route.
 * @param path Prefix to be used for the route
 * @example
 * ```ts
 * class MyController {
 *    ＠Post('/users')
 *    //set the route to /users + whatever the controller's base path is
 *    postUsers() {
 *     // ...
 *    }
 * }
 * ```
 */
export function Post(path: string = "") {
  return routeBinder(Methods.Post, path)();
}

/**
 * Decorate a controller class's method with this to setup it as a PUT route.
 * @param path Prefix to be used for the route
 * @example
 * ```ts
 * class MyController {
 *    ＠Put('/users')
 *    //set the route to /users + whatever the controller's base path is
 *    putUsers() {
 *    // ...
 *    }
 * }
 * ```
 */

export function Put(path: string = "") {
  return routeBinder(Methods.Put, path)();
}

/**
 * Decorate a controller class's method with this to setup it as a PATCH route.
 * @param path Prefix to be used for the route
 * @example
 * ```ts
 * class MyController {
 *    ＠Patch('/users')
 *    //set the route to /users + whatever the controller's base path is
 *    patchUsers() {
 *    // ...
 *    }
 * }
 * ```
 */
export function Patch(path: string = "") {
  return routeBinder(Methods.Patch, path)();
}

/**
 * Decorate a controller class's method with this to setup it as a DELETE route.
 * @param path Prefix to be used for the route
 * @example
 * ```ts
 * class MyController {
 *     ＠Delete('/users')
 *     //set the route to /users + whatever the controller's base path is
 *     deleteUsers() {
 *     // ...
 *     x}
 * }
 * ```
 */
export function Delete(path: string = "") {
  return routeBinder(Methods.Delete, path)();
}
