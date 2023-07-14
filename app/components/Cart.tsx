"use client";

import Image from "next/image";
import { useCartStore } from "@/store";
import formatPrice from "@/util/PriceFormat";
import { IoAddCircle, IoRemoveCircle } from "react-icons/io5";
import emptyCart from "@/public/empty-cart.png";
import { AnimatePresence, motion } from "framer-motion";
import Checkout from "./Checkout";

export default function Cart() {
  const cartStore = useCartStore();

  //generate total price
  const totalPrice = cartStore.cart.reduce((accumulating, item) => {
    return accumulating + item.unit_amount! * item.quantity!;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => cartStore.toggleCart()}
      className="fixed w-full h-screen left-0 top-0 bg-black/25"
    >
      {/* Cart element */}
      <motion.div
        layout
        onClick={(e) => e.stopPropagation()}
        className="bg-white absolute right-0 top-0 w-full lg:w-1/4 h-screen p-12 overflow-y-scroll text-gray-700"
      >
        <button
          onClick={() => cartStore.toggleCart()}
          className=" text-sm font-bold pb-12"
        >
          Back to Store
        </button>
        {cartStore.onCheckout === "cart" && (
          <>
            {cartStore.cart.map((item) => (
              <motion.div key={item.id} layout className="flex py-4 gap-4">
                <Image
                  className="rounded-md h-24"
                  src={item.image}
                  alt={item.name}
                  width={120}
                  height={120}
                />
                <div>
                  <h2>{item.name}</h2>
                  <div className="flex gap-2">
                    <h2>Quantity: {item.quantity}</h2>
                    <button
                      onClick={() =>
                        cartStore.removeProduct({
                          id: item.id,
                          name: item.name,
                          image: item.image,
                          unit_amount: item.unit_amount,
                          quantity: item.quantity,
                        })
                      }
                    >
                      <IoRemoveCircle />
                    </button>
                    <button
                      onClick={() =>
                        cartStore.addProduct({
                          id: item.id,
                          name: item.name,
                          image: item.image,
                          unit_amount: item.unit_amount,
                          quantity: item.quantity,
                        })
                      }
                    >
                      <IoAddCircle />
                    </button>
                  </div>

                  <p className="text-sm">
                    {item.unit_amount && formatPrice(item.unit_amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </>
        )}

        <motion.div layout>
          {cartStore.cart.length > 0 && (
            <>
              <p>Total: {formatPrice(totalPrice)}</p>
              <button
                onClick={() => cartStore.setCheckout("checkout")}
                className="py-2 mt-4 bg-teal-700 w-full rounded-md text-white"
              >
                Checkout
              </button>
            </>
          )}
        </motion.div>
        {cartStore.onCheckout === "checkout" && <Checkout />}
        <AnimatePresence>
          {!cartStore.cart.length && (
            <motion.div
              animate={{ scale: 1, rotateZ: 0, opacity: 0.75 }}
              initial={{ scale: 0.5, rotateZ: -1, opacity: 0 }}
              exit={{ scale: 0.5, rotateZ: -1, opacity: 0 }}
              className="flex flex-col items-center gap-12 text-2xl font-medium pt-56 opacity-75"
            >
              <h1>...Uhh Ohh...its empty!</h1>
              <Image
                src={emptyCart}
                alt="empty-cart"
                width={200}
                height={200}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
