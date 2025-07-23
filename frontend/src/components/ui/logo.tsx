import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ 
  width = 32, 
  height = 32, 
  className,
  showText = false,
  textClassName = "text-xl font-bold text-gray-900"
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image 
        src="/images/optimacx-logo.png" 
        alt="Óptima-CX Logo" 
        width={width} 
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={textClassName}>
          Óptima-CX
        </span>
      )}
    </div>
  );
}