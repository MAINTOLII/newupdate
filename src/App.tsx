import { useState } from "react";
import Credits from "./Credits";
import Reports from "./Reports";
import Sales from "./Sales";

type Sale = {
  id: number;
  items: any[];
  total: number;
  profit: number;
  date: string;
  type: "cash" | "credit";
  customer?: string;
};

type CreditAccount = {
  phone: string;
  sales: Sale[];
  payments: number[];
  manualCredits: { amount: number; note: string; date: string }[];
};

function App() {
  const [page, setPage] = useState<"sales" | "reports" | "credits">("sales");
  const [sales, setSales] = useState<Sale[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);

  const addPayment = (phone: string, amount: number) => {
    if (!amount) return;
    setCredits((prev) =>
      prev.map((c) =>
        c.phone === phone
          ? { ...c, payments: [...c.payments, amount] }
          : c
      )
    );
  };

  const addManualCredit = (phone: string, amount: number, note: string) => {
    if (!amount) return;

    const newCredit = {
      amount,
      note,
      date: new Date().toLocaleString(),
    };

    setCredits((prev) => {
      const existing = prev.find((c) => c.phone === phone);

      if (existing) {
        return prev.map((c) =>
          c.phone === phone
            ? {
                ...c,
                manualCredits: [...(c.manualCredits || []), newCredit],
              }
            : c
        );
      }

      return [
        ...prev,
        {
          phone,
          sales: [],
          payments: [],
          manualCredits: [newCredit],
        },
      ];
    });
  };

  const generateCreditInvoice = (account: CreditAccount) => {
    const salesTotal = account.sales.reduce((s, sale) => s + sale.total, 0);
    const manualTotal = (account.manualCredits || []).reduce(
      (s, m) => s + m.amount,
      0
    );
    const totalOwed = salesTotal + manualTotal;
    const totalPaid = account.payments.reduce((s, p) => s + p, 0);
    const balance = totalOwed - totalPaid;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <body style="font-family: Arial; background: white; padding: 30px;">
          <h2>Credit Statement</h2>
          <p><strong>Customer:</strong> ${account.phone}</p>
          <hr />
          <div><strong>Total Owed:</strong> $${totalOwed.toFixed(2)}</div>
          <div><strong>Total Paid:</strong> $${totalPaid.toFixed(2)}</div>
          <div><strong>Balance:</strong> $${balance.toFixed(2)}</div>
        </body>
      </html>
    `);

    win.document.close();
  };

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Arial",
        maxWidth: 650,
        margin: "0 auto",
        lineHeight: 1.6,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>
        Mato POS
      </h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 30,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setPage("sales")}>Sales</button>
        <button onClick={() => setPage("reports")}>Reports</button>
        <button onClick={() => setPage("credits")}>Credits</button>
      </div>

      {page === "sales" && (
        <Sales sales={sales} setSales={setSales} credits={credits} setCredits={setCredits} />
      )}

      {page === "reports" && (
        <Reports sales={sales} credits={credits} />
      )}

      {page === "credits" && (
        <Credits
          credits={credits}
          addPayment={addPayment}
          addManualCredit={addManualCredit}
          generateCreditInvoice={generateCreditInvoice}
        />
      )}
    </div>
  );
}

export default App;