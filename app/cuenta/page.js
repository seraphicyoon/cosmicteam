"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CuentaPage() {
  const [perfil, setPerfil] = useState(null);
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
                Hola, {perfil?.username || "clienta"} 💖
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
                {perfil?.username || "-"}
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
            <h2 style={{ marginTop: 0, color: "#c5578b" }}>¿Qué sigue?</h2>
            <p style={{ color: "#8d6278" }}>
              Aquí después pondremos tus pedidos, recargas y acceso rápido a la tienda.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "14px" }}>
              <a
                href="/"
                style={{
                  textDecoration: "none",
                  background: "#e98ab3",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  fontWeight: "bold",
                }}
              >
                Ir a la tienda
              </a>

              <a
                href="https://wa.me/"
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
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}