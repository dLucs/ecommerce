import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { AddCartType } from "@/types/AddCartType";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

const calculateOrderAmount = (items: AddCartType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    return acc + item.unit_amount * item.quantity!;
  }, 0);
  return totalPrice;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  //get user info
  const userSession = await getServerSession(request, response, authOptions);
  if (!userSession?.user) {
    response.status(403).json({ message: "Not logged in" });
    return;
  }
  //Get data from the body
  const { items, payment_intent_id } = request.body;

  //create order data
  const orderData = {
    user: { connect: { id: userSession.user?.id } },
    amount: calculateOrderAmount(items),
    currency: "usd",
    status: "pending",
    paymentIntentId: payment_intent_id,
    products: {
      create: items.map((item) => ({
        name: item.name,
        description: item.description || null,
        unit_amount: parseFloat(item.unit_amount),
        quantity: item.quantity,
        image: item.image,
      })),
    },
  };
  // check for payment intent
  if (payment_intent_id) {
    const current_intent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );
    if (current_intent) {
      const updated_intent = await stripe.paymentIntents.update(
        payment_intent_id,
        { amount: calculateOrderAmount(items) }
      );
      //Fetch order with products ids
      const existing_order = await prisma.order.findFirst({
        where: { paymentIntentId: updated_intent.id },
        include: { products: true },
      });
      if (!existing_order) {
        response.status(400).json({ message: "Invalid Payment Intent" });
      }
      const updated_order = await prisma.order.update({
        where: {
          id: existing_order?.id,
        },
        data: {
          amount: calculateOrderAmount(items),
          products: {
            deleteMany: {},
            create: items.map((item) => ({
              name: item.name,
              description: item.description || null,
              unit_amount: parseFloat(item.unit_amount),
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
      });
      response.status(200).json({ paymentIntent: updated_intent });
      return;
    }
  } else {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    orderData.paymentIntentId = paymentIntent.id;
    const newOrder = await prisma.order.create({ data: orderData });
    response.status(200).json({ paymentIntent });
  }

  //get data necessary for the order.
}
