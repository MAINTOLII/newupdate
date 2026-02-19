import { useState } from "react";
import Credits from "./Credits";
import Reports from "./Reports";
import Sales from "./Sales";
import Logbook from "./Logbook.tsx";
import type { CreditAccount } from "./types";


function App() {
  const [page, setPage] = useState<"sales" | "reports" | "credits" | "logbook">("sales");
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [, setSales] = useState<any[]>([]);

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
        <button onClick={() => setPage("logbook")}>Logbook</button>
      </div>

      {page === "sales" && (
        <Sales setSales={setSales} />
      )}

      {page === "reports" && (
        <Reports />
      )}

      {page === "credits" && (
        <Credits
          credits={credits}
          addManualCredit={addManualCredit}
        />
      )}

      {page === "logbook" && (
        <Logbook />
      )}
    </div>
  );
}

export default App;