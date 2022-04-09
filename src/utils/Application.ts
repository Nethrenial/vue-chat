import express, { Application as ExpressApplication, Handler } from "express";
import cors from "cors";
import { config as configEnvs } from "dotenv";
import { controllers } from "@controllers/index";
import { IRouter } from "@decorators/handlers.decorator";
import { MetadataKeys } from "@utils/metadata.keys";

class Application {
  private readonly _instance: ExpressApplication;
  get instance(): ExpressApplication {
    return this._instance;
  }
  constructor() {
    configEnvs();
    this._instance = express();
    this._instance.use(
      cors({
        origin: process.env.CORS_ORIGIN,
      })
    );
    this._instance.use(express.json());
    this._instance.use(express.urlencoded({ extended: true }));
    this.registerRouters();
  }
  private registerRouters() {
    const info: Array<{ api: string; handler: string }> = [];

    controllers.forEach((controllerClass) => {
      const controllerInstance: { [handleName: string]: Handler } =
        new controllerClass() as any;

      const basePath: string =
        "/api" + Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
      const routers: IRouter[] = Reflect.getMetadata(
        MetadataKeys.ROUTERS,
        controllerClass
      );

      const exRouter = express.Router();

      routers.forEach(({ method, path, handlerName }) => {
        exRouter[method](
          path,
          controllerInstance[String(handlerName)].bind(controllerInstance)
        );

        info.push({
          api: `${method.toLocaleUpperCase()} ${basePath + path}`,
          handler: `${controllerClass.name}.${String(handlerName)}`,
        });
      });

      this._instance.use(basePath, exRouter);
    });

    console.table(info);
  }
}
export default new Application();
