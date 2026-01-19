import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingBlobsProps {
  accentColor?: string;
  secondaryColor?: string;
}

const MorphingBlobs = ({ 
  accentColor = "accent", 
  secondaryColor = "primary" 
}: MorphingBlobsProps) => {
  // Blob path animations - organic morphing shapes
  const blobVariants = {
    animate1: {
      d: [
        "M440,320 Q480,260 440,200 Q400,140 340,160 Q280,180 260,240 Q240,300 280,360 Q320,420 380,400 Q440,380 440,320",
        "M460,300 Q500,240 460,180 Q420,120 360,140 Q300,160 280,220 Q260,280 300,340 Q340,400 400,380 Q460,360 460,300",
        "M420,340 Q460,280 420,220 Q380,160 320,180 Q260,200 240,260 Q220,320 260,380 Q300,440 360,420 Q420,400 420,340",
        "M440,320 Q480,260 440,200 Q400,140 340,160 Q280,180 260,240 Q240,300 280,360 Q320,420 380,400 Q440,380 440,320",
      ],
    },
    animate2: {
      d: [
        "M200,180 Q240,140 200,100 Q160,60 120,80 Q80,100 60,140 Q40,180 80,220 Q120,260 160,240 Q200,220 200,180",
        "M220,160 Q260,120 220,80 Q180,40 140,60 Q100,80 80,120 Q60,160 100,200 Q140,240 180,220 Q220,200 220,160",
        "M180,200 Q220,160 180,120 Q140,80 100,100 Q60,120 40,160 Q20,200 60,240 Q100,280 140,260 Q180,240 180,200",
        "M200,180 Q240,140 200,100 Q160,60 120,80 Q80,100 60,140 Q40,180 80,220 Q120,260 160,240 Q200,220 200,180",
      ],
    },
    animate3: {
      d: [
        "M350,450 Q390,410 350,370 Q310,330 270,350 Q230,370 210,410 Q190,450 230,490 Q270,530 310,510 Q350,490 350,450",
        "M370,430 Q410,390 370,350 Q330,310 290,330 Q250,350 230,390 Q210,430 250,470 Q290,510 330,490 Q370,470 370,430",
        "M330,470 Q370,430 330,390 Q290,350 250,370 Q210,390 190,430 Q170,470 210,510 Q250,550 290,530 Q330,510 330,470",
        "M350,450 Q390,410 350,370 Q310,330 270,350 Q230,370 210,410 Q190,450 230,490 Q270,530 310,510 Q350,490 350,450",
      ],
    },
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large primary blob - top right */}
      <motion.svg
        className="absolute -top-20 -right-20 w-[500px] h-[500px] md:w-[700px] md:h-[700px] opacity-[0.06]"
        viewBox="0 0 500 500"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <motion.path
          fill="currentColor"
          className={cn("text-accent")}
          initial={{ d: blobVariants.animate1.d[0] }}
          animate={{ d: blobVariants.animate1.d }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>

      {/* Medium secondary blob - top left */}
      <motion.svg
        className="absolute top-10 -left-10 w-[300px] h-[300px] md:w-[400px] md:h-[400px] opacity-[0.04]"
        viewBox="0 0 300 300"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <motion.path
          fill="currentColor"
          className="text-primary-foreground"
          initial={{ d: blobVariants.animate2.d[0] }}
          animate={{ d: blobVariants.animate2.d }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </motion.svg>

      {/* Small accent blob - bottom center-left */}
      <motion.svg
        className="absolute bottom-0 left-1/4 w-[350px] h-[350px] md:w-[450px] md:h-[450px] opacity-[0.05]"
        viewBox="0 0 400 600"
        initial={{ rotate: 0 }}
        animate={{ rotate: 180 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <motion.path
          fill="currentColor"
          className={cn("text-accent")}
          initial={{ d: blobVariants.animate3.d[0] }}
          animate={{ d: blobVariants.animate3.d }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </motion.svg>

      {/* Extra small floating blob - center right */}
      <motion.div
        className="absolute top-1/2 right-[15%] w-32 h-32 md:w-48 md:h-48 opacity-[0.03]"
        animate={{
          y: [0, -20, 0, 20, 0],
          x: [0, 10, 0, -10, 0],
          scale: [1, 1.1, 1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="currentColor" className="text-primary-foreground" />
        </svg>
      </motion.div>
    </div>
  );
};

export default MorphingBlobs;
