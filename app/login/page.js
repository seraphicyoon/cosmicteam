"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async () => {
    setMensaje("");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", usuario)
      .single();

    if (error || !data) {
      setMensaje("Usuario no encontrado.");
      return;
    }

    if (data.password !== password) {
      setMensaje("Contraseña incorrecta.");
      return;
    }

    localStorage.setItem("user_id", data.id);

    if (data.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/cuenta";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff8fc 0%, #ffeef7 50%, #fffaf3 100%)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* 🔥 BANNER PROMO */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffb6d9, #ffcce6)",
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 10px 25px rgba(233,145,184,0.25)",
            border: "1px solid #f4c5db",
          }}
        >
          <h1 style={{ color: "#b84d82", marginBottom: "10px" }}>
            COSMICTEAM 💖
          </h1>

          <p style={{ color: "#8d6278", marginBottom: "20px" }}>
            Precios más baratos que el mercado 🚀
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            {/* CHATGPT */}
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid #f4c5db",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#c5578b" }}>
                ChatGPT Pro
              </div>
              <div style={{ fontSize: "14px", color: "#8d6278" }}>
                Precio real: ~$20 USD (~350 MXN)
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontWeight: "bold",
                  color: "#4c9a69",
                }}
              >
                Tu precio: 60 MXN 💸
              </div>
            </div>

            {/* CANVA */}
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid #f4c5db",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#c5578b" }}>
                Canva Pro (1 año)
              </div>
              <div style={{ fontSize: "14px", color: "#8d6278" }}>
                Precio real: ~$120 USD (~2000 MXN)
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontWeight: "bold",
                  color: "#4c9a69",
                }}
              >
                Tu precio: 50 MXN 💸
              </div>
            </div>

            {/* CAPCUT */}
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid #f4c5db",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#c5578b" }}>
                CapCut Pro (1 mes)
              </div>
              <div style={{ fontSize: "14px", color: "#8d6278" }}>
                Precio real: ~$10 USD (~170 MXN)
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontWeight: "bold",
                  color: "#4c9a69",
                }}
              >
                Tu precio: 40 MXN 💸
              </div>
            </div>
          </div>
        </div>

        {/* 💖 LOGIN */}
        <div
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid #f4c5db",
            boxShadow: "0 10px 25px rgba(233,145,184,0.15)",
          }}
        >
          <h2 style={{ textAlign: "center", color: "#c5578b" }}>
            COSMICTEAM
          </h2>

          <div
            style={{
              display: "flex",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => setModo("login")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: modo === "login" ? "#e98ab3" : "#eee",
                color: modo === "login" ? "white" : "#555",
                fontWeight: "bold",
              }}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => setModo("register")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: modo === "register" ? "#e98ab3" : "#eee",
                color: modo === "register" ? "white" : "#555",
                fontWeight: "bold",
              }}
            >
              Registrarse
            </button>
          </div>

          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #f4c5db",
              marginBottom: "10px",
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #f4c5db",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#e98ab3",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Entrar a mi cuenta
          </button>

          {mensaje && (
            <p style={{ marginTop: "10px", color: "#c5578b" }}>{mensaje}</p>
          )}
        </div>
      </div>
    </main>
  );
}