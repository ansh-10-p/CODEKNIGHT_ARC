import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get API keys from environment variables
    const PRIVATE_API_KEY = process.env.VAPI_PRIVATE_API_KEY;
    const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;

    // Validate API keys
    if (!PRIVATE_API_KEY) {
      throw new Error('VAPI Private API Key is not configured in environment variables');
    }

    if (!PHONE_NUMBER_ID) {
      throw new Error('VAPI Phone Number ID is not configured in environment variables');
    }

    const body = await request.json();
    let { phoneNumber, assistantId: customAssistantId } = body;

    // Get default assistant ID from environment variable
    const defaultAssistantId = process.env.NEXT_PUBLIC_VAPI_GENERATE_ASSISTANT_ID;

    // Use custom assistant ID if provided, otherwise use default
    const assistantId = customAssistantId || defaultAssistantId;

    // Validate assistant ID
    if (!assistantId) {
      throw new Error('Assistant ID is not configured');
    }

    // Ensure phone number is in E.164 format (with country code)
    // If it doesn't start with +, we assume it needs the country code
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber.replace(/\D/g, '');
    }

    console.log('Initiating call to:', phoneNumber, 'with assistant:', assistantId);
    console.log('Using phone number ID:', PHONE_NUMBER_ID);

    // Use the correct endpoint and payload format as documented
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_API_KEY}`,
      },
      body: JSON.stringify({
        assistantId: assistantId,
        phoneNumberId: PHONE_NUMBER_ID, // Required for outbound calls
        customer: {
          number: phoneNumber
        }
      }),
    });

    // Log the raw response for debugging
    console.log('Status code:', response.status);

    // Try to parse response as JSON but handle case where it might not be valid JSON
    let data;
    try {
      data = await response.json();
      console.log('Vapi API response:', data);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Failed to parse API response: ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Failed to initiate call: ${response.status}`;
      console.error('Error response:', errorMessage);
      throw new Error(errorMessage);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate call' },
      { status: 500 }
    );
  }
} 