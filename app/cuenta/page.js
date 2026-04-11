"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CuentaPage() {
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarCuenta() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (activo) {
            setCargando(false);
            window.location.href = "/login";
          }
          return;
        }

        const { data: perfilData, error: perfilError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (perfilError || !perfilData) {
          if (activo) {
            setCargando(false);
            window.location.href = "/login";
          }
          return;
        }

        const { data: pedidosData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!activo) return;

        setPerfil(perfilData);
        setPedidos(pedidosData || []);
        setCargando(false);
      } catch (e) {
        if (activo) {
          setCargando(false);
          window.location.href = "/login";
        }
      }
    }

    cargarCuenta();

    return () => {
      activo = false;
    };
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (cargando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          background: "linear-gradient(180deg, #fff8fc 0%, #ffeef7 50%, #fffaf3 100%)",
        }}
      >
        Cargando tu cuenta...
      </main>
    );
  }

  const username = perfil?.username || "clienta";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff8fc 0%, #ffeef7 50%, #fffaf3 100%)",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#7c4a65",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #f4c5db",
            borderRadius: "28px",
            padding: "28px",
            boxShadow: "0 12px 30px rgba(233, 145, 184, 0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#d46a98",
                  fontSize: "13px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Mi cuenta
              </p>

              <h1
                style={{
                  margin: "10px 0 8px 0",
                  fontSize: "34px",
                  color: "#c5578b",
                }}
              >
                Hola, {username} 💖
              </h1>

              <p style={{ margin: 0, color: "#8d6278" }}>
                Desde aquí podrás revisar tu saldo y tus compras.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {perfil?.role === "admin" ? (
                <a
                  href="/admin"
                  style={{
                    textDecoration: "none",
                    background: "#fff",
                    color: "#9a6b82",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    fontWeight: "bold",
                    border: "1px solid #f4c5db",
                  }}
                >
                  Panel admin
                </a>
              ) : null}

              <button
                onClick={cerrarSesion}
                style={{
                  padding: "12px 18px",
                  borderRadius: "16px",
                  border: "none",
                  background: "#e98ab3",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            <div
              style={{
                background: "#fff7fb",
                border: "1px solid #f4c5db",
                borderRadius: "22px",
                padding: "20px",
              }}
            >
              <p style={{ margin: 0, color: "#9f6c84", fontSize: "14px" }}>
                Usuario
              </p>
              <h3 style={{ margin: "10px 0 0 0", color: "#c5578b", fontSize: "26px" }}>
                {username}
              </h3>
            </div>

            <div
              style={{
                background: "#fff7fb",
                border: "1px solid #f4c5db",
                borderRadius: "22px",
                padding: "20px",
              }}
            >
              <p style={{ margin: 0, color: "#9f6c84", fontSize: "14px" }}>
                Saldo disponible
              </p>
              <h3 style={{ margin: "10px 0 0 0", color: "#c5578b", fontSize: "26px" }}>
                {perfil?.balance ?? 0} créditos
              </h3>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              background: "#fff7fb",
              border: "1px solid #f4c5db",
              borderRadius: "22px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#c5578b" }}>Mis pedidos</h2>

            {pedidos.length === 0 ? (
              <p style={{ color: "#8d6278" }}>Todavía no tienes pedidos.</p>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #f4c5db",
                      borderRadius: "18px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "20px" }}>
                      {pedido.product_name}
                    </div>

                    <div style={{ color: "#8d6278", marginTop: "8px" }}>
                      Precio: {pedido.price} créditos
                    </div>

                    <div style={{ color: "#8d6278", marginTop: "4px" }}>
                      Estado: {pedido.status}
                    </div>

                    {pedido.delivery_message ? (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "12px",
                          background: "#fff7fb",
                          border: "1px solid #f4c5db",
                          color: "#8d6278",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <strong style={{ color: "#c5578b" }}>Entrega:</strong>
                        <br />
                        {pedido.delivery_message}
                      </div>
                    ) : null}

                    {pedido.admin_comment ? (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "12px",
                          background: "#fff7fb",
                          border: "1px solid #f4c5db",
                          color: "#8d6278",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <strong style={{ color: "#c5578b" }}>Comentario:</strong>
                        <br />
                        {pedido.admin_comment}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}