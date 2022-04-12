import { RequestHandler } from "express";
import { OptionsJson, OptionsUrlencoded } from "body-parser";
import { Methods } from "../enums";

export class BaseController {
  [key: string]: any;
}

export class BaseDTO {
  [key: string]: any;
}

export interface BodyParserOptions {
  json?: boolean | OptionsJson;
  urlencoded?: boolean | OptionsUrlencoded;
}

export interface RouteHandlerDescriptor extends PropertyDescriptor {
  value?: RequestHandler;
}

export interface NethrenialApplicationRouter {
  method: Methods;
  path: string;
  handlerName: string | symbol;
}

export type NethrenialValidationError = Array<{
  children: [];
  constraints: Record<string, string>;
  property: string;
}>;
