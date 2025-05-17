import Order from "../models/Order.js";
import Book from "../models/Book.js";
import mongoose from "mongoose";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const createOrder = async (req, res) => {
//   const { userId, userName, items, totalAmount } = req.body;

//   // Validate input
//   if (!userId || !items || !totalAmount) {
//     return res.status(400).json({
//       success: false,
//       message: 'Missing required fields'
//     });
//   }

//   try {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // 1. Create the order
//       const newOrder = new Order({
//         userId,
//         userName,
//         items,
//         totalAmount
//       });

//       const savedOrder = await newOrder.save({ session });

//       // 2. Update book stocks and validate
//       const bulkOps = items.map(item => ({
//         updateOne: {
//           filter: {
//             _id: item.bookId,
//             availableStock: { $gte: item.quantity }
//           },
//           update: { $inc: { availableStock: -item.quantity } },
//           session
//         }
//       }));

//       const result = await Book.bulkWrite(bulkOps, { session });

//       // Check if all books were updated successfully
//       if (result.modifiedCount !== items.length) {
//         throw new Error('Some items are out of stock or quantity exceeds available stock');
//       }

//       await session.commitTransaction();
//       session.endSession();

//       res.status(201).json({
//         success: true,
//         message: 'Order created successfully',
//         order: savedOrder
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message || 'Failed to create order'
//     });
//   }
// };

export const getOrders = async (req, res) => {
  try {
    const { filter } = req.query;
    let query = {};

    if (filter === "daily") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query.orderDate = { $gte: startOfDay };
    } else if (filter === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.orderDate = { $gte: oneWeekAgo };
    }

    const orders = await Order.find(query).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { userId, userName, items, totalAmount } = req.body;

    // Validate stock availability
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book || book.availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.bookName}`,
        });
      }
    }

    // Create order
    const order = new Order({
      userId,
      userName,
      items,
      totalAmount,
      status: "pending",
    });

    await order.save();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "LKR",
          product_data: {
            name: item.bookName,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/order-success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    // Update order with session ID
    order.stripeSessionId = session.id;

    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { availableStock: -item.quantity },
      });
    }

    await order.save();

    res.json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
