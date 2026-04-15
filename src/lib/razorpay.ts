import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
export const createRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (amount: number, orderId: string, customerEmail: string) => {
  try {
    const razorpay = createRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderId,
      notes: {
        order_id: orderId,
        customer_email: customerEmail,
      },
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

// Verify Razorpay payment signature
export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
};

// Get payment details
export const getRazorpayPayment = async (paymentId: string) => {
  try {
    const razorpay = createRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw error;
  }
};

// Refund payment
export const refundRazorpayPayment = async (paymentId: string, amount?: number) => {
  try {
    const razorpay = createRazorpayInstance();
    const refundOptions: any = {};
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Amount in paise
    }
    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Error refunding Razorpay payment:', error);
    throw error;
  }
};