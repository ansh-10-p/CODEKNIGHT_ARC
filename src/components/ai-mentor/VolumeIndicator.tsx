import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface VolumeIndicatorProps {
  volumeLevel: number;
}

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({ volumeLevel }) => {
  // Normalize volume level to a percentage (0-100)
  const normalizedVolume = Math.min(Math.max(volumeLevel * 100, 0), 100);
  
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-muted-foreground">
          {normalizedVolume.toFixed(0)}%
        </div>
        <div className={cn(
          "text-xs",
          normalizedVolume < 30 ? "text-yellow-500" :
          normalizedVolume < 70 ? "text-green-500" :
          "text-red-500"
        )}>
          {normalizedVolume < 30 ? "Low" :
           normalizedVolume < 70 ? "Good" :
           "High"}
        </div>
      </div>
      <Progress
        value={normalizedVolume}
        className={cn(
          "h-2 transition-all duration-300",
          normalizedVolume < 30 ? "[&>div]:bg-yellow-500" :
          normalizedVolume < 70 ? "[&>div]:bg-green-500" :
          "[&>div]:bg-red-500"
        )}
      />
    </div>
  );
};

export default VolumeIndicator; 