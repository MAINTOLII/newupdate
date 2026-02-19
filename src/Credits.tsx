import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import type { CreditAccount } from "./types";
type Props = {
  credits: CreditAccount[];
  addManualCredit: (phone: string, amount: number, note: string) => void;
};

export default function Credits({
  credits,
  addManualCredit,
}: Props) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<
    { phone: string; amount: number }[]
  >([]);

  const existingCustomers = credits.map((c) => ({
    name: c.sales.find((s) => s.customer)?.customer || "",
    phone: c.phone,
  }));

  const filteredManualCustomers =
    phone.length >= 2
      ? existingCustomers.filter(
          (c) =>
            c.name.toLowerCase().includes(phone.toLowerCase()) ||
            c.phone.toString().includes(phone)
        )
      : [];

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

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("credit_payments2")
        .select("phone, amount");

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setPayments(data as any);
      }
    };

    fetchPayments();
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
          style={{ marginRight: 5, backgroundColor: "white", color: "black" }}
        />
        {filteredManualCustomers.length > 0 && (
          <div
            style={{
              position: "absolute",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: 6,
              marginTop: 4,
              zIndex: 1000,
              maxHeight: 150,
              overflowY: "auto",
              color: "black",
            }}
          >
            {filteredManualCustomers.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f2f2f2",
                }}
                onClick={() => {
                  setPhone(c.phone.toString());
                }}
              >
                {c.name ? `${c.name} (${c.phone})` : c.phone}
              </div>
            ))}
          </div>
        )}
        <input
          placeholder="Amount (USD)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: 5, backgroundColor: "white", color: "black" }}
        />
        <input
          placeholder="Message"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginRight: 5, backgroundColor: "white", color: "black" }}
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
      <div style={{ marginBottom: 15 }}>
        <input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        />
      </div>

      {credits.length === 0 && <div>No credit accounts</div>}

      {credits
        .filter((account) => {
          const name =
            account.sales.find((s) => s.customer)?.customer || "";
          const phoneStr = account.phone.toString();

          const salesTotal = account.sales.reduce(
            (sum, sale) => sum + sale.total,
            0
          );

          const manualTotal = (account.manualCredits || []).reduce(
            (sum, c) => sum + c.amount,
            0
          );

          const totalOwed = salesTotal + manualTotal;

          const totalPaid = payments
            .filter((p) => p.phone === account.phone)
            .reduce((sum, p) => sum + Number(p.amount), 0);

          const balance = totalOwed - totalPaid;

          // If no search → only show accounts with non-zero balance
          if (!search.trim()) {
            return balance !== 0;
          }

          // If searching → allow showing any previous credit account
          return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            phoneStr.includes(search)
          );
        })
        .map((account) => {
        const displayName =
          account.sales.find((s) => s.customer)?.customer ||
          account.phone;

        const salesTotal = account.sales.reduce(
          (sum, sale) => sum + sale.total,
          0
        );

        const manualTotal = (account.manualCredits || []).reduce(
          (sum, c) => sum + c.amount,
          0
        );

        const totalOwed = salesTotal + manualTotal;

        const totalPaid = payments
          .filter((p) => p.phone === account.phone)
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const balance = totalOwed - totalPaid;

        return (
          <div
            key={account.phone}
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#111",
              color: "white",
              borderRadius: 8,
              border: "1px solid #222",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <strong>
                {displayName !== account.phone ? displayName : account.phone}
              </strong>

              {displayName !== account.phone && (
                <span style={{ fontSize: 12, color: "#bbb" }}>
                  {account.phone}
                </span>
              )}
            </div>
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
                  (account.manualCredits || []).forEach((c) => {
                    statementLines.push(
                      `${c.date}  |  $${c.amount.toFixed(2)}  |  ${c.note}`
                    );
                  });

                  statementLines.push("");
                  statementLines.push("PAYMENTS:");
                  payments
                    .filter((p) => p.phone === account.phone)
                    .forEach((p, i) => {
                      statementLines.push(
                        `Payment ${i + 1}  |  $${Number(p.amount).toFixed(2)}`
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
            <div style={{ marginTop: 6 }}>
              Owed: ${totalOwed.toFixed(2)} | Paid: ${totalPaid.toFixed(2)} | Balance: ${balance.toFixed(2)}
            </div>

            {/* Add Payment */}
            <input
              placeholder="Payment & Enter"
              type="number"
              style={{
                marginTop: 5,
                backgroundColor: "white",
                color: "black",
                padding: 6,
                borderRadius: 4,
                border: "1px solid #ccc"
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  const value = parseFloat(
                    (e.target as HTMLInputElement).value
                  );
                  if (!value) return;

                  // Insert into DB
                  const { error } = await supabase
                    .from("credit_payments2")
                    .insert({
                      phone: account.phone,
                      amount: value,
                    });

                  if (error) {
                    console.error(error);
                    return;
                  }

                  setPayments((prev) => [
                    ...prev,
                    { phone: account.phone, amount: value },
                  ]);

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