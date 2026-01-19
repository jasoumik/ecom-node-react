import * as React from "react";
import Image, { ImageProps } from "next/image";

export interface ResponsiveImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = (props) => {
  const { loading, priority, className, ...rest } = props;

  // If priority is true, Next.js requires loading to be undefined (it will default to eager)
  const resolvedLoading = priority ? undefined : loading ?? "lazy";

  return (
    <Image
      {...rest}
      src={props.src}
      alt={props.alt}
      className={`rounded-3xl object-cover ${className ?? ""}`}
      placeholder={props.placeholder ?? "empty"}
      loading={resolvedLoading}
      priority={priority}
    />
  );
};
