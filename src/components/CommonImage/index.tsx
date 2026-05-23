"use client";

import React from "react";
import { Image, Typography } from "@douyinfe/semi-ui-19";

const { Text } = Typography;

type CommonImageProps = {
  src?: string | string[] | null;
  width?: number | string;
  height?: number | string;
  size?: number;
  alt?: string;
  radius?: number;
  preview?: boolean;
  fallbackText?: string;
  fit?: React.CSSProperties["objectFit"];
  style?: React.CSSProperties;
  className?: string;
};

function normalizeSrc(src?: string | string[] | null) {
  if (Array.isArray(src)) {
    return src.find(Boolean) || "";
  }
  return src || "";
}

export default function CommonImage({
  src,
  width,
  height,
  size,
  alt = "image",
  radius = 8,
  preview = true,
  fallbackText = "无图",
  fit = "cover",
  style,
  className,
}: CommonImageProps) {
  const imageSrc = normalizeSrc(src);
  const imageWidth = width ?? size ?? 48;
  const imageHeight = height ?? size ?? 48;

  if (!imageSrc) {
    return (
      <div
        className={className}
        style={{
          width: imageWidth,
          height: imageHeight,
          borderRadius: radius,
          background: "var(--semi-color-fill-0)",
          border: "1px solid var(--semi-color-border)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          ...style,
        }}
      >
        <Text size="small" type="tertiary">
          {fallbackText}
        </Text>
      </div>
    );
  }

  return (
    <Image
      className={className}
      src={imageSrc}
      width={imageWidth}
      height={imageHeight}
      alt={alt}
      preview={preview ? { src: imageSrc } : false}
      style={{
        borderRadius: radius,
        objectFit: fit,
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
