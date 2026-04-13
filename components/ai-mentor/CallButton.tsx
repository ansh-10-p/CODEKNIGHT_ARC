'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Loader2, AlertCircle, Check, Info, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface CallButtonProps {
  assistantId?: string;
}

export default function CallButton({ assistantId }: CallButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const { toast } = useToast();

  // Validate phone number in E.164 format
  const validatePhoneNumber = (number: string) => {
    // Basic E.164 validation: + followed by numbers only
    const isValid = /^\+[0-9]{10,15}$/.test(number);
    setIsValidNumber(isValid);
    return isValid;
  };

  // Handle phone number change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);

    // Only validate if there's input
    if (value.trim()) {
      validatePhoneNumber(value);
    } else {
      setIsValidNumber(true); // Reset validation for empty field
    }
  };

  // Format phone number to E.164
  const formatToE164 = (number: string) => {
    // Remove all non-digit characters except the + at the beginning
    let formatted = number.replace(/[^\d+]/g, '');

    // Ensure it starts with a +
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }

    return formatted;
  };

  const initiateCall = async () => {
    try {
      // Format and validate the phone number first
      const formattedNumber = formatToE164(phoneNumber);
      if (!validatePhoneNumber(formattedNumber)) {
        setErrorMessage('Please enter a valid phone number in international format (e.g., +917738705798)');
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Please enter a valid international phone number with country code.",
        });
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Show initiating call toast
      toast({
        title: "Initiating Call",
        description: "Please wait while we connect your call...",
      });

      const response = await fetch('/api/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          assistantId: assistantId,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to initiate call';
        let rawText = '';

        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          try {
            rawText = await response.text();
            errorMsg = rawText || errorMsg;
          } catch {}
        }

        console.error('❌ API Error Details:');
        console.error('Status:', response.status);
        console.error('Message:', errorMsg);

        setErrorMessage(errorMsg);

        toast({
          variant: "destructive",
          title: "Call Failed",
          description: errorMsg,
        });

        setIsLoading(false);
        return;
      }

      const data = await response.json();
      // Clear any previous error
      setErrorMessage(null);

      // Check if the response has an id property
      if (data && data.id) {
        // Store call ID and show success dialog
        setCallId(data.id);
        setShowSuccessDialog(true);

        // Also show toast for non-disruptive notification
        toast({
          title: "Call Initiated Successfully!",
          description: `Your phone will ring shortly. Call ID: ${data.id.substring(0, 8)}...`,
          variant: "default",
        });
      } else {
        console.warn('Call initiated but no ID was returned:', data);
        // Show success dialog without ID
        setCallId(null);
        setShowSuccessDialog(true);

        toast({
          title: "Call Initiated Successfully!",
          description: "Your phone will ring shortly.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      const msg = error instanceof Error ? error.message : 'Failed to initiate call. Please try again.';
      setErrorMessage(msg);

      // Show error toast if not already shown
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-zinc-300">
            Phone Number
          </Label>
          <div className="relative">
            <Input
              id="phoneNumber"
              type="text"
              placeholder="+917738705798"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              disabled={isLoading}
              className={`pl-3 pr-10 py-2 bg-zinc-900 border ${!isValidNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-zinc-700 focus:ring-[#e78a53] focus:border-[#e78a53]'}`}
            />
            {!isValidNumber && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>

          {!isValidNumber && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid international phone number with country code
            </p>
          )}

          <p className="text-xs text-zinc-500">
            Format: Include country code with + (e.g., +917738705798)
          </p>
        </div>

        <Button
          onClick={initiateCall}
          disabled={isLoading || !phoneNumber.trim() || !isValidNumber}
          className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-black font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initiating call...
            </>
          ) : (
            <>
              <Phone className="mr-2 h-4 w-4" />
              Start Call
            </>
          )}
        </Button>

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 text-red-500 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md border border-zinc-800 bg-zinc-900 shadow-xl">
          <DialogHeader>
            <div className="mx-auto bg-[#e78a53]/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-9 w-9 text-[#e78a53]" />
            </div>
            <DialogTitle className="text-center text-xl text-white">Call Sent Successfully!</DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Your AI Mentor will call you shortly at {phoneNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-3 p-4 bg-[#e78a53]/10 rounded-md">
            <div className="flex justify-center items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#e78a53]" />
              <p className="text-[#e78a53] font-medium">Get ready to answer your phone</p>
            </div>

            {callId && (
              <div className="bg-black/30 border border-zinc-800 p-3 rounded text-center">
                <p className="text-xs text-zinc-400">Call Reference ID:</p>
                <p className="font-mono text-sm text-white break-all">{callId}</p>
              </div>
            )}

            <p className="text-sm text-[#e78a53]/80 text-center">
              Please answer the incoming call to start your AI Mentor session
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-black transition-colors"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
