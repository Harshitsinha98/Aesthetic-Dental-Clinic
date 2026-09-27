import type { Metadata } from "next";
import { QueueScreen } from "@/components/admin/queue-screen";

export const metadata: Metadata = {
  title: "Waiting room",
  robots: { index: false, follow: false },
};

export default function QueuePage() {
  return <QueueScreen />;
}
