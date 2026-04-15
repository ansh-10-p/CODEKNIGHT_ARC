import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/order-models";
import { MenuItemModel, CanteenModel } from "@/lib/models";
import { createRazorpayOrder } from "@/lib/razorpay";

// Generate order ID helper function
const generateOrderId = async () => {
  try {
    const year = new Date().getFullYear();
    const count = await OrderModel.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback to timestamp-based ID
    return `ORD-${Date.now()}`;
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch orders for a user
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const canteenId = searchParams.get('canteenId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!customerId && !canteenId) {
      return NextResponse.json(
        { error: "Either customerId or canteenId is required" },
        { status: 400 }
      );
    }

    const query: any = {};
    if (customerId) query.customerId = customerId;
    if (canteenId) query.canteenId = canteenId;
    if (status) query.status = status;

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return NextResponse.json({ 
      data: orders,
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error fetching orders:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const requiredFields = ['customerId', 'customerName', 'customerRole', 'customerEmail', 'canteenId', 'items', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Get canteen details
    const canteen = await CanteenModel.findById(body.canteenId);
    if (!canteen) {
      return NextResponse.json(
        { error: "Canteen not found" },
        { status: 404 }
      );
    }

    // Validate menu items and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of body.items) {
      const menuItem = await MenuItemModel.findById(item.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item ${item.menuItemId} not found` },
          { status: 404 }
        );
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json(
          { error: `${menuItem.name} is currently unavailable` },
          { status: 400 }
        );
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image,
        isVeg: menuItem.isVeg,
        isSpicy: menuItem.isSpicy,
        prepTime: menuItem.prepTime
      });
    }

    // Calculate total amount (you can add tax, delivery fee, etc. here)
    const tax = 0; // No tax for now
    const deliveryFee = 0; // No delivery fee for now
    const discount = body.discount || 0;
    const totalAmount = subtotal + tax + deliveryFee - discount;

    // Calculate estimated time (max prep time + 10 minutes buffer)
    const maxPrepTime = Math.max(...validatedItems.map(item => item.prepTime));
    const estimatedTime = new Date(Date.now() + (maxPrepTime + 10) * 60 * 1000);

    // Generate order ID
    const orderId = await generateOrderId();

    // Create order data
    const orderData = {
      orderId,
      customerId: body.customerId,
      customerName: body.customerName,
      customerRole: body.customerRole,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      canteenId: body.canteenId,
      canteenName: canteen.ownerName,
      items: validatedItems,
      subtotal,
      tax,
      deliveryFee,
      discount,
      totalAmount,
      paymentMethod: body.paymentMethod,
      estimatedTime,
      specialInstructions: body.specialInstructions,
      deliveryType: body.deliveryType || 'pickup',
      deliveryAddress: body.deliveryAddress,
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    };

    // Create order
    const order = await OrderModel.create(orderData);

    // If payment method is online, create Razorpay order
    let razorpayOrder = null;
    if (body.paymentMethod === 'online') {
      try {
        razorpayOrder = await createRazorpayOrder(totalAmount, order.orderId, body.customerEmail);
        
        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
      } catch (error) {
        console.error('Error creating Razorpay order:', error);
        // Delete the order if Razorpay order creation fails
        await OrderModel.findByIdAndDelete(order._id);
        return NextResponse.json(
          { error: "Failed to create payment order" },
          { status: 500 }
        );
      }
    } else {
      // For offline payments, mark as paid
      order.paymentStatus = 'paid';
      await order.save();
    }
    
    return NextResponse.json({ 
      data: {
        order,
        razorpayOrder
      },
      message: "Order created successfully",
      status: "success" 
    }, { status: 201 });
  } catch (e: any) {
    console.error("Error creating order:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (!body.orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await OrderModel.findOne({ orderId: body.orderId });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order fields
    if (body.status) {
      order.addStatusHistory(body.status, body.note);
      
      if (body.status === 'completed') {
        order.completedAt = new Date();
      }
    }

    if (body.paymentStatus) {
      order.paymentStatus = body.paymentStatus;
    }

    if (body.razorpayPaymentId) {
      order.razorpayPaymentId = body.razorpayPaymentId;
    }

    if (body.razorpaySignature) {
      order.razorpaySignature = body.razorpaySignature;
    }

    if (body.rating) {
      order.rating = body.rating;
    }

    if (body.review) {
      order.review = body.review;
    }

    await order.save();
    
    return NextResponse.json({ 
      data: order,
      message: "Order updated successfully",
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error updating order:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}