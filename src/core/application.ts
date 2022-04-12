import "reflect-metadata";
import express, { Application } from "express";
import { OptionsJson, OptionsUrlencoded } from "body-parser";
import cors, { CorsOptions } from "cors";
import { MetadataKeys } from "./enums";
import {
  BaseController,
  BodyParserOptions,
  NethrenialApplicationRouter,
} from "./types";

export class NethrenialApplicationFactory {
  /**
   * Express application instance.
   */
  _instance: Application | undefined = undefined;

  /**
   * All the configurations for the application.
   */
  _configurations: Array<Function> = [];

  /**
   * All the assigned controller classes.
   */
  _controllers: Array<typeof BaseController>;

  /**
   * Info object to show how handlers and endpoints are mapped to each other.
   */
  _info: Array<{ Endpoint: string; Handler: string }> = [];

  constructor(controllers: Array<typeof BaseController> = []) {
    this._controllers = controllers;
  }

  /**
   * Getter for the express application instance.
   */
  get instance() {
    if (!this._instance) {
      this._instance = express();
      this._configurations.forEach((configuration) => {
        configuration();
      });
      this.registerRoutes();
      console.log(" Each Method + Endpoint with Associated Handler:");
      console.table(this._info);
      return this._instance;
    }
    return this._instance;
  }

  /**
   * Register all the routes/middlewares for the application.
   */
  private registerRoutes() {
    this._controllers.forEach((controllerClass) => {
      const controllerInstance = new controllerClass();
      const basePath: string = Reflect.getMetadata(
        MetadataKeys.BasePath,
        controllerClass
      );
      const routers: NethrenialApplicationRouter[] = Reflect.getMetadata(
        MetadataKeys.Routers,
        controllerClass
      );

      const newRouter = express.Router();
      routers.forEach(({ handlerName, method, path }) => {
        const correctedPath = path === "/" ? "" : path;
        const middlewares =
          Reflect.getMetadata(
            MetadataKeys.Middleware,
            controllerClass,
            handlerName
          ) || [];

        newRouter[method](
          correctedPath,
          [...middlewares],
          controllerInstance[String(handlerName)].bind(controllerInstance)
        );
        this._info.push({
          Endpoint: `${method.toLocaleUpperCase()} ${basePath + correctedPath}`,
          Handler: `${controllerClass.name}.${String(handlerName)}`,
        });
      });
      this._instance?.use(basePath, newRouter);
    });
  }

  /**
   *
   * @param options - Options for parsing the body of the request,
   * defaults to { json: false, urlencoded: false } which will not parse the body
   * To allow JSON parsing,
   * use `{json: true, urlencoded: false // (or true)}`
   * If you want to pass options for the `json` parser,
   * use
   * `{json: { //takes same options as express.json()}, urlencoded: false // (or true)}`
   * It's the same for the `urlencoded` parser.
   * @example
   * ```ts
   * app.enableBodyParser({json: true, urlencoded: false});
   * app.enableBodyParser({json: {limit: '10kb'}, urlencoded: false});
   * ```
   */
  setupBodyParsers(
    options: BodyParserOptions = {
      json: false,
      urlencoded: false,
    }
  ) {
    if (options.json) {
      if (typeof options.json === "boolean") {
        this._configurations.push(() => {
          this._instance?.use(express.json());
        });
      } else {
        this._configurations.push(() => {
          this._instance?.use(express.json(options.json as OptionsJson));
        });
      }
    }
    if (options.urlencoded) {
      if (typeof options.urlencoded === "boolean") {
        this._configurations.push(() => {
          this._instance?.use(express.urlencoded());
        });
      } else {
        this._configurations.push(() => {
          this._instance?.use(
            express.urlencoded(options.urlencoded as OptionsUrlencoded)
          );
        });
      }
    }
  }

  /**
   * Enable CORS if needed.
   * @param enable Whether to allow CORS or not, defaults to `false`.
   * @param options - Options for CORS, takes the same options as the `cors` package.
   * Default options will be used if not provided.
   * @example
   * ```ts
   * app.enableCors(true);
   * app.enableCors(true, {origin: 'http://localhost:3000'});
   * ```
   */
  enableCors(enable: boolean = false, options?: CorsOptions) {
    if (enable) {
      if (!options) {
        this._configurations.unshift(() => {
          this._instance?.use(cors());
        });
      } else {
        this._configurations.unshift(() => {
          this._instance?.use(cors(options));
        });
      }
    }
  }
}
