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

export const useTexture2DArray = (path: string) => {
  const texture = useTexture<string>(path);

  return React.useMemo(() => {
    console.log(texture.image.width, texture.image.height)
    const imageData = getImageData(texture.image as HTMLImageElement);
    const array = new Uint8Array(imageData.data);

    console.log(array.length, imageData.data.length)

    const dataTexture = new DataTexture2DArray(array, 16, 16, 137);
    dataTexture.generateMipmaps = true;

    dataTexture.needsUpdate = true;

    texture.dispose();

    return dataTexture;
  }, [texture]);
};
