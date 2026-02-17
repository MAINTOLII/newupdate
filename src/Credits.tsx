import { useState, useEffect } from "react";
import type { CreditAccount } from "./types";
type Props = {
  credits: CreditAccount[];
  addManualCredit: (phone: string, amount: number, note: string) => void;
  addPayment: (phone: string, amount: number) => void;
};

export default function Credits({
  credits,
  addManualCredit,
  addPayment,
}: Props) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Persist credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pos_credit_accounts", JSON.stringify(credits));
  }, [credits]);

  // Load persisted credits on first render (if parent allows hydration)
  useEffect(() => {
    const stored = localStorage.getItem("pos_credit_accounts");
    if (!stored) return;
    // Parent component should ideally hydrate from this.
    // This is just ensuring persistence exists.
  }, []);

  return (
    <div>
      <h3>Manual Credit</h3>

      {/* Manual Credit Form */}
      <div style={{ marginBottom: 25 }}>
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ marginRight: 5 }}
        />
        <input
          placeholder="Amount (USD)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: 5 }}
        />
        <input
          placeholder="Message"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginRight: 5 }}
        />
        <button
          onClick={() => {
            if (!phone || !amount || isNaN(parseFloat(amount))) return;

            addManualCredit(phone, parseFloat(amount), note);

            setPhone("");
            setAmount("");
            setNote("");
          }}
        >
          Add
        </button>
      </div>

      <hr />

      <h3>Credit Accounts</h3>

      {credits.length === 0 && <div>No credit accounts</div>}

      {credits.map((account) => {
        const salesTotal = account.sales.reduce(
          (sum, sale) => sum + sale.total,
          0
        );

        const manualTotal = (account.manualCredits || []).reduce(
          (sum, c) => sum + c.amount,
          0
        );

        const totalOwed = salesTotal + manualTotal;

        const totalPaid = account.payments.reduce(
          (sum, p) => sum + p,
          0
        );

        const balance = totalOwed - totalPaid;

        return (
          <div
            key={account.phone}
            style={{ marginBottom: 20 }}
          >
            <strong>{account.phone}</strong>
            <div style={{ marginTop: 5 }}>
              <button
                onClick={() => {
                  const statementLines = [];

                  statementLines.push("CREDIT STATEMENT");
                  statementLines.push("----------------------------");
                  statementLines.push("Phone: " + account.phone);
                  statementLines.push("");

                  statementLines.push("SALES:");
                  account.sales.forEach((sale) => {
                    statementLines.push(
                      `${sale.date}  |  Total: $${sale.total.toFixed(2)}`
                    );

                    if (sale.items && sale.items.length > 0) {
                      sale.items.forEach((item: any) => {
                        statementLines.push(
                          `   - ${item.name} x${item.quantity} = $${(
                            item.price * item.quantity
                          ).toFixed(2)}`
                        );
                      });
                    }

                    statementLines.push("");
                  });

                  statementLines.push("");
                  statementLines.push("MANUAL CREDITS:");
                  account.manualCredits.forEach((c) => {
                    statementLines.push(
                      `${c.date}  |  $${c.amount.toFixed(2)}  |  ${c.note}`
                    );
                  });

                  statementLines.push("");
                  statementLines.push("PAYMENTS:");
                  account.payments.forEach((p, i) => {
                    statementLines.push(
                      `Payment ${i + 1}  |  $${p.toFixed(2)}`
                    );
                  });

                  statementLines.push("");
                  statementLines.push(
                    "TOTAL OWED: $" + totalOwed.toFixed(2)
                  );
                  statementLines.push(
                    "TOTAL PAID: $" + totalPaid.toFixed(2)
                  );
                  statementLines.push(
                    "BALANCE: $" + balance.toFixed(2)
                  );

                  const text = statementLines.join("\n");

                  const newWindow = window.open("", "_blank");
                  if (!newWindow) return;

                  newWindow.document.write(`
                    <html>
                      <body style="background:white;font-family:monospace;padding:20px;white-space:pre;">
                        ${text}
                      </body>
                    </html>
                  `);
                  newWindow.document.close();
                }}
                style={{ marginRight: 10 }}
              >
                Statement
              </button>
            </div>
            <div>
              Owed: ${totalOwed.toFixed(2)} | Paid: ${totalPaid.toFixed(2)} | Balance: ${balance.toFixed(2)}
            </div>

            {/* Add Payment */}
            <input
              placeholder="Payment & Enter"
              type="number"
              style={{ marginTop: 5 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = parseFloat(
                    (e.target as HTMLInputElement).value
                  );
                  if (!value) return;

                  addPayment(account.phone, value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}