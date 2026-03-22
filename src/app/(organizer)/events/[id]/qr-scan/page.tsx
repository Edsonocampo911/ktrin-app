"use client";

import { use } from "react";
import QRScanner from "@/components/qr/QRScanner";

interface QRScanPageProps {
  params: Promise<{ id: string }>;
}

export default function QRScanPage({ params }: QRScanPageProps) {
  const { id } = use(params);
  
  return <QRScanner eventId={id} />;
}
