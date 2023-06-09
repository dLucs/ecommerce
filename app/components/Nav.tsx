"use client";

import { Session } from "next-auth";
import { signIn } from "next-auth/react";

export default function Nav() {
  return (
    <nav>
      <h1>Hello Nav</h1>
    </nav>
  );
}
