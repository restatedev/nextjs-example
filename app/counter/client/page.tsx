"use client";

import { counterClient } from "@/restate/client";
import useSWR from "swr";
import Form from "next/form";
import { useOptimistic } from "react";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/Badge";

export default function () {
  const { data: currentValue, mutate } = useSWR(
    "/Counter/count/current",
    async () => await counterClient.current()
  );

  const [optimisticValue, addOptimistically] = useOptimistic<
    number | undefined,
    number
  >(currentValue, (state, amount) =>
    state !== undefined ? state + amount : undefined
  );

  const formAction = async (formData: FormData) => {
    const amount = Number(formData.get("amount"));
    if (!isNaN(amount)) {
      addOptimistically(amount);
      const newValue = await counterClient.add(amount);
      mutate(newValue);
    }
  };

  return (
    <Form action={formAction} className="flex flex-col gap-4">
      <output className="font-medium text-sm">
        Current value: <Badge>{optimisticValue ?? "…"}</Badge>
      </output>
      <Input
        type="number"
        name="amount"
        required
        placeholder="0"
        label="Amount"
      />
      <SubmitButton>Add</SubmitButton>
    </Form>
  );
}
