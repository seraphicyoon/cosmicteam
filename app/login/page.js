"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  function crearEmailInterno(username) {
    return `${username.trim().toLowerCase()}@cosmicteam.com`;
  }

  function limpiarFormulario() {
    setUsername("");
    setPassword("");
  }

  async function handleRegister() {
    setMensaje("");

    if (!username.trim() || !password.trim()) {
      setMensaje("Completa usuario y contraseña.");
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setCargando(true);

      const email = crearEmailInterno(username);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMensaje("No se pudo crear la cuenta: " + error.message);
        return;
      }

      if (data?.user?.id) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username.trim().toLowerCase(),
          balance: 0,
          role: "user",
        });

        if (profileError) {
          setMensaje("La cuenta se creó, pero hubo un problema al guardar el perfil.");
          return;
        }
      }

      setMensaje("Cuenta creada con éxito. Ahora ya puedes iniciar sesión.");
      limpiarFormulario();
      setModo("login");
    } catch (e) {
      setMensaje("Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  }

  async function handleLogin() {
    setMensaje("");

    if (!username.trim() || !password.trim()) {
      setMensaje("Escribe tu usuario y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const email = crearEmailInterno(username);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMensaje("No se pudo iniciar sesión: " + error.message);
        return;
      }

      setMensaje("Bienvenida 💖 Inicio de sesión correcto.");
      limpiarFormulario();

      setTimeout(() => {
        router.push("/cuenta");
      }, 600);
    } catch (e) {
      setMensaje("Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff8fc 0%, #ffeef7 50%, #fffaf3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "rgba(255,255,255,0.88)",
          border: "1px solid #f4c5db",
          borderRadius: "28px",
          padding: "30px 24px",
          boxShadow: "0 12px 30px rgba(233, 145, 184, 0.18)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
            Acceso a clientes
          </p>

          <h1
            style={{
              margin: "10px 0 8px 0",
              fontSize: "34px",
              color: "#c5578b",
            }}
          >
            COSMICTEAM
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8d6278",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Entra con tu usuario y contraseña para comprar y revisar tu saldo.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            background: "#fff7fb",
            padding: "8px",
            borderRadius: "18px",
            border: "1px solid #f5d2e3",
          }}
        >
          <button
            onClick={() => setModo("login")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              background: modo === "login" ? "#e98ab3" : "transparent",
              color: modo === "login" ? "white" : "#9a6b82",
            }}
          >
            Iniciar sesión
          </button>

          <button
            onClick={() => setModo("registro")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              background: modo === "registro" ? "#e98ab3" : "transparent",
              color: modo === "registro" ? "white" : "#9a6b82",
            }}
          >
            Registrarse
          </button>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#8d6278",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Usuario
            </label>

            <input
              type="text"
              placeholder="Escribe tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #efc6da",
                outline: "none",
                fontSize: "15px",
                boxSizing: "border-box",
                background: "#fffdff",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#8d6278",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #efc6da",
                outline: "none",
                fontSize: "15px",
                boxSizing: "border-box",
                background: "#fffdff",
              }}
            />
          </div>

          <button
            onClick={modo === "login" ? handleLogin : handleRegister}
            disabled={cargando}
            style={{
              marginTop: "6px",
              width: "100%",
              padding: "14px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(90deg, #f3a1c7 0%, #e47bac 100%)",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 10px 20px rgba(228,123,172,0.25)",
            }}
          >
            {cargando
              ? "Cargando..."
              : modo === "login"
              ? "Entrar a mi cuenta"
              : "Crear mi cuenta"}
          </button>
        </div>

        {mensaje ? (
          <div
            style={{
              marginTop: "18px",
              padding: "14px",
              borderRadius: "16px",
              background: "#fff7fb",
              border: "1px solid #f4c5db",
              color: "#8a4f6e",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {mensaje}
          </div>
        ) : null}
      </div>
    </main>
  );
}