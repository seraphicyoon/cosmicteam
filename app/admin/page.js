"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    setPedidos(data || []);
  }

  async function cambiarEstado(id, estado) {
    await supabase.from("orders").update({ status: estado }).eq("id", id);
    cargarPedidos();
  }

  async function toggleChat(id, current) {
    await supabase
      .from("orders")
      .update({ chat_closed: !current })
      .eq("id", id);

    cargarPedidos();
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Panel Admin</h1>

      {mensaje && <p>{mensaje}</p>}

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            border: "1px solid pink",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "12px",
          }}
        >
          <h3>{pedido.product_name}</h3>
          <p>Estado: {pedido.status}</p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => cambiarEstado(pedido.id, "Pendiente")}>
              Pendiente
            </button>
            <button onClick={() => cambiarEstado(pedido.id, "Verificando")}>
              Verificando
            </button>
            <button onClick={() => cambiarEstado(pedido.id, "Preparacion")}>
              Preparación
            </button>
            <button onClick={() => cambiarEstado(pedido.id, "Entrega")}>
              Entrega
            </button>
            <button onClick={() => cambiarEstado(pedido.id, "Cancelado")}>
              Cancelado
            </button>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => toggleChat(pedido.id, pedido.chat_closed)}>
              {pedido.chat_closed ? "Abrir chat" : "Cerrar chat"}
            </button>
          </div>

          {/* 🔥 REAPERTURA */}
          {pedido.reopen_requested && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px",
                border: "1px solid #f4c5db",
                borderRadius: "10px",
                background: "#fff7fb",
              }}
            >
              <b>Solicitud de reapertura</b>

              <p style={{ marginTop: "6px" }}>
                {pedido.reopen_reason || "Sin motivo"}
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={async () => {
                    await supabase
                      .from("orders")
                      .update({
                        chat_closed: false,
                        reopen_requested: false,
                        reopen_reason: null,
                      })
                      .eq("id", pedido.id);

                    setMensaje("Chat reabierto 💖");
                    cargarPedidos();
                  }}
                >
                  Reabrir chat
                </button>

                <button
                  onClick={async () => {
                    await supabase
                      .from("orders")
                      .update({
                        reopen_requested: false,
                      })
                      .eq("id", pedido.id);

                    setMensaje("Solicitud ignorada");
                    cargarPedidos();
                  }}
                >
                  Ignorar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </main>
  );
}