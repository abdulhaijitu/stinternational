import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  type: "circle" | "square" | "diamond" | "ring";
}

interface FloatingParticlesProps {
  accentColor?: string;
  count?: number;
}

const FloatingParticles = ({ accentColor = "accent", count = 15 }: FloatingParticlesProps) => {
  // Generate random particles with varied properties
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2-6px
      x: Math.random() * 100, // 0-100%
      y: Math.random() * 100, // 0-100%
      duration: Math.random() * 15 + 20, // 20-35s
      delay: Math.random() * 10, // 0-10s delay
      opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4
      type: ["circle", "square", "diamond", "ring"][Math.floor(Math.random() * 4)] as Particle["type"],
    }));
  }, [count]);

  // Geometric shapes configuration
  const geometricShapes = useMemo(() => [
    // Floating hexagon outline - top right area
    {
      id: "hex-1",
      type: "hexagon",
      size: 60,
      x: 75,
      y: 15,
      rotation: 30,
      duration: 25,
      opacity: 0.08,
    },
    // Diamond shape - center left
    {
      id: "diamond-1",
      type: "diamond",
      size: 40,
      x: 10,
      y: 40,
      rotation: 45,
      duration: 30,
      opacity: 0.06,
    },
    // Circle ring - bottom right
    {
      id: "ring-1",
      type: "ring",
      size: 80,
      x: 85,
      y: 70,
      rotation: 0,
      duration: 35,
      opacity: 0.05,
    },
    // Small triangle - top left
    {
      id: "tri-1",
      type: "triangle",
      size: 35,
      x: 20,
      y: 20,
      rotation: 15,
      duration: 28,
      opacity: 0.07,
    },
    // Cross/plus shape - center area
    {
      id: "cross-1",
      type: "cross",
      size: 25,
      x: 50,
      y: 60,
      rotation: 0,
      duration: 22,
      opacity: 0.06,
    },
  ], []);

  const renderShape = (type: string, size: number) => {
    switch (type) {
      case "hexagon":
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <polygon
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case "diamond":
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <rect
              x="29.29"
              y="29.29"
              width="58.58"
              height="58.58"
              transform="rotate(45 50 50)"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case "ring":
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
        );
      case "triangle":
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <polygon
              points="50,10 90,90 10,90"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case "cross":
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating dot particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, particle.opacity, particle.opacity, 0],
            scale: [0, 1, 1, 0],
            y: [0, -30, -60, -90],
            x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20, Math.random() * 60 - 30],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {particle.type === "circle" && (
            <div className={`w-full h-full rounded-full bg-${accentColor}/60`} />
          )}
          {particle.type === "square" && (
            <div className={`w-full h-full bg-primary-foreground/40 rotate-12`} />
          )}
          {particle.type === "diamond" && (
            <div className={`w-full h-full bg-${accentColor}/50 rotate-45`} />
          )}
          {particle.type === "ring" && (
            <div className={`w-full h-full rounded-full border border-primary-foreground/40`} />
          )}
        </motion.div>
      ))}

      {/* Larger geometric shapes - very subtle */}
      {geometricShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute text-primary-foreground"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: shape.opacity,
          }}
          initial={{ rotate: shape.rotation }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            y: [0, -15, 0, 15, 0],
            x: [0, 10, 0, -10, 0],
          }}
          transition={{
            rotate: {
              duration: shape.duration * 2,
              repeat: Infinity,
              ease: "linear",
            },
            y: {
              duration: shape.duration,
              repeat: Infinity,
              ease: "easeInOut",
            },
            x: {
              duration: shape.duration * 1.3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {renderShape(shape.type, shape.size)}
        </motion.div>
      ))}

      {/* Subtle connecting lines - very faint grid effect */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary-foreground"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating orbs with glow */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-accent/40 blur-[2px]"
        style={{ left: "30%", top: "25%" }}
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-primary-foreground/30 blur-[1px]"
        style={{ left: "65%", top: "45%" }}
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-accent/20 blur-[3px]"
        style={{ left: "80%", top: "30%" }}
        animate={{
          y: [0, -25, 0],
          x: [0, -30, 0],
          opacity: [0.15, 0.35, 0.15],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-primary-foreground/25 blur-[2px]"
        style={{ left: "15%", top: "65%" }}
        animate={{
          y: [0, -35, 0],
          x: [0, 25, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 7,
        }}
      />
    </div>
  );
};

export default FloatingParticles;
