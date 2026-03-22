"use client";

import { use } from "react";
import QRDisplay from "@/components/qr/QRDisplay";

interface QRPageProps {
  params: Promise<{ id: string }>;
}

export default function QRPage({ params }: QRPageProps) {
  const { id } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <QRDisplay requestId={id} />
    </div>
  );
}
