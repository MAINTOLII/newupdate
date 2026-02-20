import { useEffect, useState } from "react";
import { supabase } from "./supabase";

type Product = {
  id: string;
  slug: string;
  qty: number;
  cost: number;
  price: number;
  is_weight: boolean;
};

export default function Edit() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState({
    slug: "",
    qty: "",
    cost: "",
    price: "",
    is_weight: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("slug");
    if (data) {
      setProducts(
        data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          qty: Number(p.qty),
          cost: Number(p.cost),
          price: Number(p.price),
          is_weight: p.is_weight,
        }))
      );
    }
  };

  const addProduct = async () => {
    if (!newItem.slug.trim()) return;

    await supabase.from("products").insert({
      slug: newItem.slug,
      qty: Number(newItem.qty) || 0,
      cost: Number(newItem.cost) || 0,
      price: Number(newItem.price) || 0,
      is_weight: newItem.is_weight,
    });

    setNewItem({ slug: "", qty: "", cost: "", price: "", is_weight: false });
    fetchProducts();
  };

  const updateProduct = async (id: string, field: string, value: any) => {
    await supabase.from("products").update({ [field]: value }).eq("id", id);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered =
    search.length >= 2
      ? products.filter((p) =>
          p.slug.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <div
      style={{
        padding: "6px 6px 6px 4px",
        margin: 0,
        width: "100%",
      }}
    >
      <h3>Edit Items</h3>

      <input
        placeholder="Search item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 6, marginBottom: 10, background: "white", color: "black" }}
      />

      {search.length < 2 && (
        <div style={{ marginBottom: 10, fontSize: 14 }}>
          Type at least 2 characters to search items.
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h4>Add New Item</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input
            placeholder="Name"
            value={newItem.slug}
            onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
            style={{ flex: "1 1 200px" }}
          />
          <input
            placeholder="Qty"
            type="number"
            value={newItem.qty}
            onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
            style={{ width: 70 }}
          />
          <input
            placeholder="Cost"
            type="number"
            value={newItem.cost}
            onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
            style={{ width: 70 }}
          />
          <input
            placeholder="Price"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            style={{ width: 70 }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="checkbox"
              checked={newItem.is_weight}
              onChange={(e) =>
                setNewItem({ ...newItem, is_weight: e.target.checked })
              }
            />
            KG Item
          </label>
          <button onClick={addProduct}>Add</button>
        </div>
      </div>

      {search.length >= 2 && (
        <>
          <div
            style={{
              display: "flex",
              gap: 6,
              fontWeight: "bold",
              padding: "6px 0",
              borderBottom: "2px solid #000",
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ width: 55, textAlign: "right" }}>Qty</div>
            <div style={{ width: 55, textAlign: "right" }}>Cost</div>
            <div style={{ width: 55, textAlign: "right" }}>Price</div>
            <div style={{ width: 50, textAlign: "center" }}>Action</div>
          </div>
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                borderBottom: "1px solid #ddd",
                paddingBottom: 6,
                alignItems: "center",
                flexWrap: "nowrap",
              }}
            >
              <input
                style={{
                  flex: 1,
                  minWidth: 90,
                  fontSize: 12,
                  padding: "2px 4px",
                  height: 22,
                }}
                value={p.slug}
                onChange={(e) => updateProduct(p.id, "slug", e.target.value)}
              />
              <input
                type="number"
                value={p.qty}
                onChange={(e) => updateProduct(p.id, "qty", Number(e.target.value))}
                style={{
                  width: 45,
                  textAlign: "right",
                  fontSize: 12,
                  padding: "2px 4px",
                  height: 22,
                }}
              />
              <input
                type="number"
                value={p.cost}
                onChange={(e) => updateProduct(p.id, "cost", Number(e.target.value))}
                style={{
                  width: 45,
                  textAlign: "right",
                  fontSize: 12,
                  padding: "2px 4px",
                  height: 22,
                }}
              />
              <input
                type="number"
                value={p.price}
                onChange={(e) => updateProduct(p.id, "price", Number(e.target.value))}
                style={{
                  width: 45,
                  textAlign: "right",
                  fontSize: 12,
                  padding: "2px 4px",
                  height: 22,
                }}
              />
              <button
                onClick={() => deleteProduct(p.id)}
                style={{
                  width: 45,
                  fontSize: 11,
                  padding: "2px 4px",
                  height: 24,
                  color: "red",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}