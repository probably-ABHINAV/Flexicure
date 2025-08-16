"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#9ca3af" fontFamily="sans-serif" fontSize="14">
        Loading...
      </text>
    </svg>`,
  ).toString("base64")}`

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0.7 : 1 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden ${className}`}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        className="transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {isLoading && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />}
    </motion.div>
  )
}

// Progressive image loading component
export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = "",
  lowQualitySrc,
}: OptimizedImageProps & { lowQualitySrc?: string }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false)

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Low quality placeholder */}
      {lowQualitySrc && (
        <Image
          src={lowQualitySrc || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          quality={10}
          onLoad={() => setLowQualityLoaded(true)}
          className={`absolute inset-0 transition-opacity duration-300 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          } filter blur-sm`}
        />
      )}

      {/* High quality image */}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        quality={85}
        onLoad={() => setImageLoaded(true)}
        className={`transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Loading skeleton */}
      {!lowQualityLoaded && !imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  )
}
