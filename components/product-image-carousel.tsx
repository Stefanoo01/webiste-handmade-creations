"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ProductImageCarouselProps {
  images: string[]
  alt: string
  interval?: number
}

export default function ProductImageCarousel({ 
  images, 
  alt, 
  interval = 4000 
}: ProductImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  if (images.length === 0) {
    return (
      <Image
        src="/handmade-product.png"
        alt={alt}
        width={400}
        height={400}
        className="h-full w-full object-cover rounded-md"
      />
    )
  }

  return (
    <div className="relative h-full w-full">
      {images.map((imageUrl, index) => (
        <Image
          key={imageUrl}
          src={imageUrl}
          alt={`${alt} - immagine ${index + 1}`}
          width={400}
          height={400}
          className={`absolute inset-0 h-full w-full object-cover rounded-md transition-all duration-1000 ${
            index === currentImageIndex 
              ? "opacity-100" 
              : "opacity-0"
          }`}
        />
      ))}
      
      {/* Image indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-1 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-white w-2"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
