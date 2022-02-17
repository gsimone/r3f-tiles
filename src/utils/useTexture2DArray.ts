import React from "react";
import { useTexture } from "@react-three/drei";
import { DataTexture2DArray } from "three";

function getImageData(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

/**
 * Loads a texture and converts it to a texture2DArray texture
 */
export const useTexture2DArray = (
  path: string,
  width: number,
  height: number,
  count: number
) => {
  const texture = useTexture<string>(path);

  return React.useMemo(() => {
    const imageData = getImageData(texture.image as HTMLImageElement);
    const array = new Uint8Array(imageData.data);

    const dataTexture = new DataTexture2DArray(array, width, height, count);
    dataTexture.needsUpdate = true;

    texture.dispose();

    return dataTexture;
  }, [texture]);
};
