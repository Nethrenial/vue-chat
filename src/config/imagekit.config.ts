import ImageKit from "imagekit";
import { ImageKitOptions } from "imagekit/dist/libs/interfaces";

export let imagekit: ImageKit;

export function connectToImageKit(options: ImageKitOptions) {
  imagekit = new ImageKit(options);
}
