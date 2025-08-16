import ReceiptClientPage from "./ReceiptClientPage"

export const metadata = {
  title: "Receipt – Flexicure",
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
  return <ReceiptClientPage params={params} />
}
