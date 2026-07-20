"use client";

import { useEffect } from "react";
import { initializeStore } from "@/lib/reportStore";

export default function StoreInitializer() {
  useEffect(() => {
    initializeStore();
  }, []);

  return null;
}
