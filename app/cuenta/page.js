"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CuentaPage() {
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (!error) {
        setPerfil(data);
      }

      const { data: pedidosData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      setPedidos(pedidosData || []);
      setCargando(false);
    };

    cargarPerfil();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (cargando) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
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
            <h2 style={{ marginTop: 0, color: "#c5578b" }}>Recargar saldo</h2>

            <p style={{ color: "#8d6278", lineHeight: 1.7 }}>
              Para recargar tu saldo, únete al grupo de WhatsApp y solicita los datos
              bancarios para hacer tu transferencia.
            </p>

            <div
              style={{
                background: "#fffdff",
                border: "1px solid #f4c5db",
                borderRadius: "18px",
                padding: "16px",
                color: "#8d6278",
                lineHeight: 1.8,
              }}
            >
              <strong style={{ color: "#c5578b" }}>Instrucciones:</strong>
              <br />
              1. Únete al grupo de WhatsApp.
              <br />
              2. Pide los datos bancarios de transferencia.
              <br />
              3. Realiza tu pago.
              <br />
              4. Envía en el grupo tu comprobante de pago.
              <br />
              5. Escribe también tu nombre de usuario:
              <br />
              <strong style={{ color: "#c5578b" }}>{username}</strong>
              <br />
              6. Un administrador revisará tu pago y añadirá el saldo a tu cuenta.
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
              <a
                href="https://chat.whatsapp.com/AQUI_TU_LINK_DEL_GRUPO"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  background: "#e98ab3",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  fontWeight: "bold",
                }}
              >
                Unirme al grupo de WhatsApp
              </a>

              <a
                href="/"
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
                Ir a la tienda
              </a>
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