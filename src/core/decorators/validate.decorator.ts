import "reflect-metadata";
import { RequestHandler } from "express";
import { MetadataKeys } from "../enums";
import { BaseDTO, NethrenialValidationError } from "../types";
import { transformAndValidate } from "class-transformer-validator";
import multer from "multer";

interface ValidateOptions {
  isMultipart?: boolean;
  fieldName?: string;
  multiple?: boolean;
  fieldNames?: string[];
  maxCount?: number;
}

/**
 * Use this decorator to validate the request body
 * @param dto A DTO class made with class-validator
 * @param options Options for the incoming body, optional (by default treat as JSON)
 * @example
 * ```typescript
 * ＠Controller("/")
 * class HomeController {
 *   ＠Get("/")
 *   ＠Validate(RegisterUserDTO, {isMultipart: true, fieldName: "avatar"})
 *   public registerUser(req: Request, res: Response) {
 *     // do something
 *   }
 * }
 * ```
 * ```typescript
 * ＠Controller("/")
 * class HomeController {
 *   ＠Get("/")
 *   ＠Validate(RegisterUserDTO)
 *   public registerUser(req: Request, res: Response) {
 *     // do something
 *   }
 * }
 * ```
 */
export function Validate(dto: typeof BaseDTO, options?: ValidateOptions) {
  return function (
    target: any,
    key: string | symbol,
    desc: PropertyDescriptor
  ) {
    const middlewares: Array<RequestHandler> =
      Reflect.getMetadata(MetadataKeys.Middleware, target.constructor, key) ||
      [];

    let validationMiddleware: RequestHandler | undefined = undefined;

    if (options) {
      if (options.isMultipart) {
        if (!options.multiple) {
          validationMiddleware = async (req, res, next) => {
            const upload = multer().single(options.fieldName || "file");
            upload(req, res, async function (err) {
              if (err instanceof multer.MulterError) {
                res.status(500).send({
                  message: "Error parsing form",
                  error: err,
                });
              } else if (err) {
                res.status(500).send({
                  message: "Something went wrong",
                  error: err,
                });
              }
              try {
                await transformAndValidate(dto, req.body);
                next();
              } catch (error) {
                const errors: {
                  [key: string]: Array<string>;
                } = {};

                (error as NethrenialValidationError).forEach((err) => {
                  const constraintArray = Object.values(err.constraints);
                  errors[err.property] = constraintArray;
                });

                res.status(400).json({
                  message: "Validation failed",
                  errors,
                });
              }
            });
          };
        } else {
          validationMiddleware = async (req, res, next) => {
            const upload = multer().array(
              options.fieldName || "files",
              options.maxCount
            );
            upload(req, res, function (err) {
              if (err instanceof multer.MulterError) {
                res.status(500).send({
                  message: "Error parsing form",
                  error: err,
                });
              } else if (err) {
                res.status(500).send({
                  message: "Something went wrong",
                  error: err,
                });
              }
              /**
               * TODO: add validation for fields
               */
            });
            next();
          };
        }
      } else {
        validationMiddleware = async (req, res, next) => {
          try {
            await transformAndValidate(dto, req.body);
            next();
          } catch (error) {
            const errors: {
              [key: string]: Array<string>;
            } = {};

            (error as NethrenialValidationError).forEach((err) => {
              const constraintArray = Object.values(err.constraints);
              errors[err.property] = constraintArray;
            });

            res.status(400).json({
              message: "Validation failed",
              errors,
            });
          }
        };
      }
    } else {
      validationMiddleware = async (req, res, next) => {
        try {
          await transformAndValidate(dto, req.body);
          next();
        } catch (error) {
          const errors: {
            [key: string]: Array<string>;
          } = {};

          (error as NethrenialValidationError).forEach((err) => {
            const constraintArray = Object.values(err.constraints);
            errors[err.property] = constraintArray;
          });

          res.status(400).json({
            message: "Validation failed",
            errors,
          });
        }
      };
    }
    // const validationMiddleware: RequestHandler = async (req, res, next) => {
    //   if (options && !options.isMultipart) {
    //     try {
    //       await transformAndValidate(dto, req.body);
    //       next();
    //     } catch (error) {
    //       const errors: {
    //         [key: string]: Array<string>;
    //       } = {};

    //       (error as NethrenialValidationError).forEach((err) => {
    //         const constraintArray = Object.values(err.constraints);
    //         errors[err.property] = constraintArray;
    //       });

    //       res.status(400).json({
    //         message: "Validation failed",
    //         errors,
    //       });
    //     }
    //   } else if (options && options.isMultipart) {
    //     if (options.multiple) {
    //       const upload = multer().array(
    //         options.fieldName || "files",
    //         options.maxCount
    //       );
    //       upload(req, res, function (err) {
    //         if (err instanceof multer.MulterError) {
    //           res.status(500).send({
    //             message: "Error parsing form",
    //             error: err,
    //           });
    //         } else if (err) {
    //           res.status(500).send({
    //             message: "Something went wrong",
    //             error: err,
    //           });
    //         }
    //         /**
    //          * TODO: add validation for files
    //          */
    //       });
    //       next();
    //     } else {
    //       const upload = multer().single(options.fieldName || "file");
    //       upload(req, res, async function (err) {
    //         if (err instanceof multer.MulterError) {
    //           res.status(500).send({
    //             message: "Error parsing form",
    //             error: err,
    //           });
    //         } else if (err) {
    //           res.status(500).send({
    //             message: "Something went wrong",
    //             error: err,
    //           });
    //         }
    //         try {
    //           await transformAndValidate(dto, req.body);
    //           next();
    //         } catch (error) {
    //           const errors: {
    //             [key: string]: Array<string>;
    //           } = {};

    //           (error as NethrenialValidationError).forEach((err) => {
    //             const constraintArray = Object.values(err.constraints);
    //             errors[err.property] = constraintArray;
    //           });

    //           res.status(400).json({
    //             message: "Validation failed",
    //             errors,
    //           });
    //         }
    //       });
    //     }
    //   }
    // };

    Reflect.defineMetadata(
      MetadataKeys.Middleware,
      [...middlewares, validationMiddleware],
      target.constructor,
      key
    );
  };
}
