import { useEffect, useState } from "react";
import { supabase } from "./supabase";

type CartItem = {
  id: number;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  unit: "piece" | "kg";
};

type Sale = {
  id: number;
  items: CartItem[];
  total: number;
  profit: number;
  date: string;
  type: "cash" | "credit" | "shs";
  shsAmount?: number;
  customer?: string;
};

type CreditAccount = {
  phone: string;
  sales: Sale[];
  payments: number[];
  manualCredits: { amount: number; note: string; date: string }[];
};


export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [payments, setPayments] = useState<
    { phone: string; amount: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: salesData } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false });

      const { data: creditsData } = await supabase
        .from("credit_accounts")
        .select("*");

      const { data: paymentsData } = await supabase
        .from("credit_payments2")
        .select("phone, amount");

      if (salesData) {
        setSales(
          salesData.map((s: any) => ({
            ...s,
            items: s.items || [],
            shsAmount: s.shs_amount || 0,
          }))
        );
      }

      if (creditsData) {
        setCredits(creditsData);
      }

      if (paymentsData) {
        setPayments(paymentsData as any);
      }
    };

    fetchData();
  }, []);
  const totalCashSales = sales
    .filter((sale) => sale.type === "cash")
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalShsSales = sales
    .filter((sale) => sale.type === "shs")
    .reduce((sum, sale) => sum + (sale.shsAmount || 0), 0);



  const totalProfit = sales.reduce(
    (sum, sale) => sum + sale.profit,
    0
  );

  const getCustomerName = (phone: string) => {
    const account = credits.find((c) => c.phone === phone);
    if (!account) return null;

    // Look through ALL sales to find a stored customer name
    const saleWithName = account.sales.find((s) => s.customer);

    return saleWithName?.customer || null;
  };


  return (
    <>
      <h4>Sales & Payments</h4>

      <div style={{ marginBottom: 10 }}>
        <strong>Total Profit:</strong>{" "}
        ${totalProfit.toFixed(2)}
        <br />
        <strong>Total Revenue (Cash):</strong>{" "}
        ${totalCashSales.toFixed(2)}
        <br />
        <strong>Total SHS Revenue:</strong>{" "}
        {totalShsSales.toFixed(0)} SHS
        <hr />
      </div>

      {sales.map((sale) => (
        <div key={sale.id} style={{ marginBottom: 12 }}>
          <div>
            {sale.date} ({sale.type === "shs" ? "SHS" : sale.type})
            {sale.customer && ` — ${sale.customer}`}
          </div>

          <div style={{ marginLeft: 10 }}>
            {sale.items.map((item) => (
              <div key={item.id}>
                - {item.name} x{item.quantity} = $
                {(item.price * item.quantity).toFixed(2)}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 4 }}>
            Revenue: ${sale.total.toFixed(2)} | Profit: $
            {sale.profit.toFixed(2)}
          </div>
          {sale.type === "shs" && sale.shsAmount && (
            <div>SHS Paid: {sale.shsAmount.toFixed(0)} SHS</div>
          )}
        </div>
      ))}

      <hr style={{ margin: "25px 0" }} />

      <h4>Credit Payments</h4>
      {payments.map((payment, idx) => {
        const name = getCustomerName(payment.phone);
        return (
          <div
            key={`${payment.phone}-${idx}`}
            style={{ marginBottom: 6 }}
          >
            {payment.phone}
            {name && ` (${name})`} paid $
            {Number(payment.amount).toFixed(2)}
          </div>
        );
      })}
    </>
  );
}