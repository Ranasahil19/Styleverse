const Payment = require("../../models/payment");
const stripe = require("stripe")(
  "sk_test_51QYRRtKgiwXQrp00BdABYu1SFipnpTtxYt8dV8BLALhh9SlndFOFiZG75bxEqzP02smfjk0svjmKsoS8fhQnLJb100BntIVL6Y"
);
const { v4: uuidv4 } = require("uuid");
const { placeOrder } = require("../order/orderController");

const endpointSecret =
  "whsec_b6e51c8b744b6b7cf54d1e7be26cf1043cf46acfb9a49f7ac9488eb4d36720c6";

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Webhook event:", event);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Find the payment record by sessionId
      const payment = await Payment.findOne({ sessionId: session.id });

      if (!payment) {
        return console.error(
          "Payment record not found for sessionId:",
          session.id
        );
      }

      console.log("Payment record found:", payment);

      // Update payment status
      payment.status = "paid";
      payment.cardHolderName = session.customer_details?.name || "Unknown";
      await payment.save();
      console.log("Payment record updated:", payment);

      // Extract order details
      const {
        userId,
        carts,
        totalPrice,
        _id: paymentId,
        shippingAddress,
      } = payment;
      console.log("Carts:", carts);

      // Ensure we have all necessary data
      if (!userId || !carts || !carts.length || !totalPrice) {
        return console.error("Missing order details.");
      }

      console.log("Shipping Address:", shippingAddress);

      // Create the order (with shipping address)
      await placeOrder({
        userId,
        cartItems: carts,
        totalPrice,
        shippingAddress,
        paymentId,
        createdAt: new Date(),
        status: "Pending",
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Estimated delivery
      });

      console.log("Order placed successfully after payment");
    } catch (err) {
      console.error("Error processing payment or order:", err.message);
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object;

    try {
      await Payment.findOneAndUpdate(
        { sessionId: session.id },
        { status: "unpaid" },
        { new: true }
      );
      console.log(
        "Payment status updated to 'unpaid' for sessionId:",
        session.id
      );
    } catch (err) {
      console.error("Error updating payment status:", err.message);
    }
  }

  res.json({ received: true });
};

exports.createPayment = async (req, res) => {
  const { userId, products, paymentMethod, totalPrice, shippingAddress } =
    req.body;

  try {
    // Check if all required fields are present
    if (
      !userId ||
      !products ||
      products.length === 0 ||
      !paymentMethod ||
      !shippingAddress
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Map the products into Stripe line items
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.title,
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents for Stripe
      },
      quantity: product.quantity,
    }));

    if (lineItems.length === 0) {
      return res.status(400).json({ message: "No valid products in the cart" });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:3000/cancel",
    });

    // Prepare the cart data to be saved in the database
    const carts = products.map((product) => ({
      productId: product.productId,
      title: product.title,
      image: product.image,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
    }));

    // Create a new payment record in the database
    const newPayment = new Payment({
      userId,
      carts,
      sessionId: session.id,
      transactionId: uuidv4(),
      paymentMethod,
      totalPrice,
      status: "pending",
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country,
        mobileno: shippingAddress.mobileno,
      },
      createdAt: new Date(),
    });

    // Save payment to the database
    const payment = await newPayment.save();

    // Assign the generated ID to `paymentId`
    payment.paymentId = payment._id.toString();
    await payment.save(); // Save the updated document with `paymentId`

    // Respond with the session ID and payment details
    res.status(200).json({ sessionId: session.id, paymentId: payment._id });
  } catch (error) {
    console.error("Error creating payment session:", error.message);
    res.status(500).send("Failed to create payment session");
  }
};

exports.finalizePayment = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const cardHolderName = session.customer_details?.name;

    const payment = await Payment.findOneAndUpdate(
      { sessionId },
      { cardHolderName },
      { new: true }
    );

    res.status(200).json({ message: "Payment finalized", payment });
  } catch (error) {
    console.error("Error finalizing payment:", error.message);
    res.status(500).send("Failed to finalize payment");
  }
};

exports.getSessionId = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );
    res.status(200).json({ paymentIntentId: session.payment_intent });
  } catch (error) {
    console.error("Error fetching payment intent:", error);
    res.status(500).json({ error: "Failed to fetch payment intent" });
  }
};

exports.getPaymentId = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error.message);
    res.status(500).send("Failed to fetch payment details");
  }
};

// exports.payment_success = async (req, res) => {
//   const sessionId = req.params.sessionId;

//   // Retrieve payment session details from Stripe
//   const session = await stripe.checkout.sessions.retrieve(sessionId);

//   if (session.payment_status === "paid") {
//     res.json({ success: true });
//   } else {
//     res.json({ success: false });
//   }
// };

// exports.success_url = async (req, res) => {
//   const { session_id } = req.query;
//   console.log("Session ID received:", session_id); // Log the session ID to verify it's being passed

//   try {
//     // Retrieve the session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(session_id);
//     console.log("Retrieved session:", session); // Log session data for debugging
//     console.log(session.metadata)

//     // Check if metadata.carts exists before parsing
//     if (session.metadata && session.metadata.carts) {
//       const carts = JSON.parse(session.metadata.carts);
//       console.log("Parsed cart items:", carts); // Log parsed carts

//       const orderData = {
//         userId: session.metadata.userId,
//         cartItems: carts,
//         totalPrice: session.amount_total / 100,
//         paymentStatus: session.payment_status,
//         sessionId: session.id,
//       };

//       // Save order to database (e.g., MongoDB or other storage)
//       await Order.create(orderData);

//       res.json({ success: true, message: "Order placed successfully!" });
//     } else {
//       throw new Error("Cart items not found in session metadata");
//     }
//   } catch (error) {
//     console.error("Error processing payment:", error); // Log detailed error message
//     res.status(500).send("Error processing payment.");
//   }
// };
