"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

function usernameToEmail(username) {
  return `${String(username || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")}@cosmicteam.local`;
}

export default function LoginPage() {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setMensaje("");

    const username = usuario.trim();
    const pass = password.trim();

    if (!username || !pass) {
      setMensaje("Escribe tu usuario y contraseña.");
      return;
    }

    setCargando(true);

    try {
      const email = usernameToEmail(username);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setMensaje("Usuario o contraseña incorrectos.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMensaje("No se pudo iniciar sesión.");
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (perfilError || !perfil) {
        setMensaje("No se encontró tu perfil.");
        return;
      }

      if (perfil.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/cuenta";
      }
    } catch {
      setMensaje("Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  const handleRegister = async () => {
    setMensaje("");

    const username = usuario.trim();
    const pass = password.trim();

    if (!username || !pass) {
      setMensaje("Escribe usuario y contraseña.");
      return;
    }

    if (username.length < 3) {
      setMensaje("El usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (pass.length < 6) {
      setMensaje("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const email = usernameToEmail(username);

      const { data: exists } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (exists) {
        setMensaje("Ese usuario ya existe.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) {
        setMensaje("No se pudo crear la cuenta: " + error.message);
        return;
      }

      const user = data?.user;

      if (!user) {
        setMensaje("No se pudo crear la cuenta.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          username,
          role: "user",
          balance: 0,
        },
      ]);

      if (profileError) {
        setMensaje("Error al crear perfil: " + profileError.message);
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (loginError) {
        setMensaje("Cuenta creada. Ahora inicia sesión.");
        setModo("login");
        return;
      }

      window.location.href = "/cuenta";
    } catch {
      setMensaje("Error al registrarte.");
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = () => {
    if (modo === "login") handleLogin();
    else handleRegister();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff8fc 0%, #ffeef7 45%, #fffaf3 100%)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            background: "#eaa3c2",
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "34px",
            border: "1px solid #f2bcd6",
            boxShadow: "0 12px 28px rgba(233,145,184,0.16)",
          }}
        >
          <h1
            style={{
              color: "#b84d82",
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            COSMICTEAM 💖
          </h1>

          <p
            style={{
              color: "#8d6278",
              marginTop: "12px",
              marginBottom: "16px",
            }}
          >
            Precios más baratos que el mercado 🚀
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid #f4c5db",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "16px" }}>
                ChatGPT Pro
              </div>
              <p style={{ margin: "8px 0 0 0", color: "#8d6278", fontSize: "14px" }}>
                Precio real: ~350 MXN
              </p>
              <p style={{ margin: "10px 0 0 0", color: "#4c9a69", fontWeight: "bold" }}>
                Tu precio: 60 MXN 💸
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid #f4c5db",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "16px" }}>
                Canva Pro (1 año)
              </div>
              <p style={{ margin: "8px 0 0 0", color: "#8d6278", fontSize: "14px" }}>
                Precio real: ~2000 MXN
              </p>
              <p style={{ margin: "10px 0 0 0", color: "#4c9a69", fontWeight: "bold" }}>
                Tu precio: 50 MXN 💸
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid #f4c5db",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "16px" }}>
                CapCut Pro (1 mes)
              </div>
              <p style={{ margin: "8px 0 0 0", color: "#8d6278", fontSize: "14px" }}>
                Precio real: ~170 MXN
              </p>
              <p style={{ margin: "10px 0 0 0", color: "#4c9a69", fontWeight: "bold" }}>
                Tu precio: 40 MXN 💸
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "14px",
              background: "rgba(255,255,255,0.55)",
              borderRadius: "14px",
              padding: "10px",
              textAlign: "center",
              color: "#b84d82",
              fontWeight: "bold",
            }}
          >
            Y mucho más... ✨
          </div>
        </div>

        <div
          style={{
            maxWidth: "430px",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "24px",
            padding: "28px",
            border: "1px solid #f4c5db",
            boxShadow: "0 12px 28px rgba(233,145,184,0.12)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#c5578b",
              margin: 0,
              fontSize: "24px",
            }}
          >
            COSMICTEAM
          </h2>

          <div
            style={{
              display: "flex",
              marginTop: "20px",
              marginBottom: "16px",
              background: "#f7edf2",
              borderRadius: "14px",
              padding: "4px",
            }}
          >
            <button
              onClick={() => {
                setModo("login");
                setMensaje("");
              }}
              type="button"
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: modo === "login" ? "#e98ab3" : "transparent",
                color: modo === "login" ? "white" : "#7f5b70",
                fontWeight: "bold",
              }}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => {
                setModo("register");
                setMensaje("");
              }}
              type="button"
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: modo === "register" ? "#e98ab3" : "transparent",
                color: modo === "register" ? "white" : "#7f5b70",
                fontWeight: "bold",
              }}
            >
              Registrarse
            </button>
          </div>

          <input
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "10px",
              borderRadius: "12px",
              border: "1px solid #f4c5db",
              boxSizing: "border-box",
              fontSize: "15px",
              outline: "none",
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "14px",
              borderRadius: "12px",
              border: "1px solid #f4c5db",
              boxSizing: "border-box",
              fontSize: "15px",
              outline: "none",
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={cargando}
            style={{
              width: "100%",
              padding: "14px",
              background: "#e98ab3",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {cargando
              ? modo === "login"
                ? "Entrando..."
                : "Creando cuenta..."
              : modo === "login"
              ? "Entrar a mi cuenta"
              : "Crear mi cuenta"}
          </button>

          {mensaje ? (
            <p
              style={{
                color: "#c5578b",
                marginTop: "14px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {mensaje}
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: "42px" }}>
          <h2
            style={{
              textAlign: "center",
              color: "#c5578b",
              fontSize: "30px",
              margin: 0,
            }}
          >
            ¿Por qué elegirnos?
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#8d6278",
              marginTop: "10px",
              marginBottom: "22px",
            }}
          >
            Todo pensado para que compres fácil, rápido y con confianza.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #f4c5db",
                borderRadius: "18px",
                padding: "20px",
                textAlign: "center",
                boxShadow: "0 10px 24px rgba(233,145,184,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>💬</div>
              <h3 style={{ color: "#c5578b" }}>Soporte rápido</h3>
              <p style={{ color: "#7f5b70", lineHeight: 1.6 }}>
                Puedes hablar directo desde el pedido y recibir ayuda más rápida.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #f4c5db",
                borderRadius: "18px",
                padding: "20px",
                textAlign: "center",
                boxShadow: "0 10px 24px rgba(233,145,184,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>⚡</div>
              <h3 style={{ color: "#c5578b" }}>Entrega sencilla</h3>
              <p style={{ color: "#7f5b70", lineHeight: 1.6 }}>
                Todo se entrega dentro del pedido de forma clara y ordenada.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #f4c5db",
                borderRadius: "18px",
                padding: "20px",
                textAlign: "center",
                boxShadow: "0 10px 24px rgba(233,145,184,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>💸</div>
              <h3 style={{ color: "#c5578b" }}>Precios accesibles</h3>
              <p style={{ color: "#7f5b70", lineHeight: 1.6 }}>
                Servicios mucho más baratos que el precio normal del mercado.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #f4c5db",
                borderRadius: "18px",
                padding: "20px",
                textAlign: "center",
                boxShadow: "0 10px 24px rgba(233,145,184,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>📋</div>
              <h3 style={{ color: "#c5578b" }}>Todo organizado</h3>
              <p style={{ color: "#7f5b70", lineHeight: 1.6 }}>
                Revisa saldo, pedidos y mensajes en un solo lugar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}