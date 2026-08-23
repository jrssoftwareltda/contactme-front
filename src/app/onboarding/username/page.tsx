import type { Metadata } from "next";
import { UsernameSetup } from "@/components/username-setup";

export const metadata: Metadata = { title: "Choose username" };

export default function UsernamePage() {
  return <UsernameSetup />;
}
