"use client";

import { useRouter } from "next/navigation";

export default function Chat() {
  const router = useRouter();

  return (
    <div className="min-h-[100vh] max-w-xl w-full mx-auto flex flex-col">
      <button
        onClick={() => {
          router.push(`./chat/${crypto.randomUUID()}`);
        }}
        className="m-auto mt-[50vh] items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Create new chat
      </button>
    </div>
  );
}
