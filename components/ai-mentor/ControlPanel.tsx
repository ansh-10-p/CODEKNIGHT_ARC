import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ControlPanelProps {
  isCallActive: boolean;
  isLoading: boolean;
  onToggleCall: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isCallActive, 
  isLoading, 
  onToggleCall 
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex justify-center gap-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleCall}
                disabled={isLoading}
                variant={isCallActive ? "destructive" : "default"}
                size="lg"
                className={cn(
                  "rounded-full h-16 w-16 transition-all duration-300",
                  isCallActive ? "hover:bg-destructive/90" : "hover:bg-primary/90",
                  "shadow-lg hover:shadow-xl active:scale-95"
                )}
              >
                {isLoading ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : isCallActive ? (
                  <PhoneOff className="h-6 w-6" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLoading ? "Processing..." : isCallActive ? "End call" : "Start call"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={true}
                variant="outline"
                size="lg"
                className={cn(
                  "rounded-full h-16 w-16 transition-all duration-300",
                  "shadow-md hover:shadow-lg",
                  "border-2",
                  isCallActive ? "border-primary" : "border-muted"
                )}
              >
                {isCallActive ? (
                  <Mic className="h-6 w-6 text-primary" />
                ) : (
                  <MicOff className="h-6 w-6 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Microphone {isCallActive ? "active" : "inactive"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {isLoading ? "Processing your request..." :
         isCallActive ? "Call in progress - Speak clearly into your microphone" :
         "Click the phone button to start a conversation"}
      </p>
    </div>
  );
};

export default ControlPanel; 