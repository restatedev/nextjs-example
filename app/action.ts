"use server";
import { counterClient } from "@/restate/client";
import { revalidatePath } from "next/cache";

export async function add(prevState: number, formData: FormData) {
  const amount = Number(formData.get("amount"));
  if (!isNaN(amount)) {
    const value = await counterClient.add(amount);
    console.log(value);
    revalidatePath("/");
    return value;
  }

  throw new Error("Amount value is invalid.");
}
