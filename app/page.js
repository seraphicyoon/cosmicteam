"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true);

      if (!error) {
        setProductos(data || []);
      }

      setCargando(false);
    };

    cargarProductos();
  }, []);

  return (
    <main style={{ padding: "30px" }}>
      <h1>COSMICTEAM 💖</h1>

      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {productos.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid pink",
                padding: "20px",
                borderRadius: "20px",
              }}
            >
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <p><strong>{p.price} créditos</strong></p>
              <p>
                {p.stock > 0 ? `Stock: ${p.stock}` : "Agotado"}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}