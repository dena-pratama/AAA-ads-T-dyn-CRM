export const SHOPEE_SPEC = {
  kelola: {
    sheetName: "orders",
    orderId: "No. Pesanan",
    createdTime: "Waktu Pesanan Dibuat",
    productName: "Nama Produk",
    quantity: "Jumlah",
    status: "Status Pesanan",
  },
  income: {
    sheetName: "Income",
    orderIdCandidates: ["No. Pesanan"],
    dateCandidates: ["Tanggal Penghasilan", "Waktu Transaksi"],
    settlementCandidates: ["Jumlah Diterima", "Total Penghasilan"],
    feeCandidates: ["Total Biaya", "Biaya Admin"],
    typeCandidates: ["Tipe Transaksi"],
    revenueCandidates: ["Total Penghasilan", "Total Revenue", "Gross Amount"], // Added based on context, user asked for "fallback: Total Penghasilan - Total Biaya"
  },
};
