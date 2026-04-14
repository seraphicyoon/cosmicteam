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

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (loginError) {
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
    } catch (e) {
      setMensaje("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  const handleRegister = async () => {
    setMensaje("");

    const username = usuario.trim();
    const pass = password.trim();

    if (!username || !pass) {
      setMensaje("Escribe un usuario y una contraseña.");
      return;
    }

    if (username.length < 3) {
      setMensaje("El usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (pass.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const email = usernameToEmail(username);

      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existingUser) {
        setMensaje("Ese usuario ya existe.");
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password: pass,
        }
      );

      if (signUpError) {
        setMensaje("No se pudo crear la cuenta: " + signUpError.message);
        return;
      }

      const newUser = signUpData?.user;

      if (!newUser) {
        setMensaje("No se pudo crear la cuenta.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: newUser.id,
          username,
          role: "user",
          balance: 0,
          password: pass,
        },
      ]);

      if (profileError) {
        setMensaje("La cuenta auth se creó, pero falló el perfil: " + profileError.message);
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
    } catch (e) {
      setMensaje("Ocurrió un error al registrarte.");
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = () => {
    if (modo === "login") {
      handleLogin();
    } else {
      handleRegister();
    }
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
            marginBottom: "30px",
            border: "1px solid #f2bcd6",
          }}
        >
          <h1 style={{ color: "#b84d82", margin: 0 }}>COSMICTEAM 💖</h1>

          <p style={{ color: "#8d6278", marginTop: "10px" }}>
            Precios más baratos que el mercado 🚀
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginTop: "16px",
            }}
          >
            <div style={cardStyle}>
              <b style={titleStyle}>ChatGPT Pro</b>
              <p style={smallText}>Precio real: ~350 MXN</p>
              <p style={greenText}>Tu precio: 60 MXN 💸</p>
            </div>

            <div style={cardStyle}>
              <b style={titleStyle}>Canva Pro (1 año)</b>
              <p style={smallText}>Precio real: ~2000 MXN</p>
              <p style={greenText}>Tu precio: 50 MXN 💸</p>
            </div>

            <div style={cardStyle}>
              <b style={titleStyle}>CapCut Pro (1 mes)</b>
              <p style={smallText}>Precio real: ~170 MXN</p>
              <p style={greenText}>Tu precio: 40 MXN 💸</p>
            </div>
          </div>

          <div style={moreBox}>Y mucho más... ✨</div>
        </div>

        <div style={loginBox}>
          <h2 style={{ textAlign: "center", color: "#c5578b" }}>COSMICTEAM</h2>

          <div style={tabs}>
            <button
              onClick={() => {
                setModo("login");
                setMensaje("");
              }}
              style={modo === "login" ? tabActive : tab}
              type="button"
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => {
                setModo("register");
                setMensaje("");
              }}
              style={modo === "register" ? tabActive : tab}
              type="button"
            >
              Registrarse
            </button>
          </div>

          <input
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <button onClick={handleSubmit} style={loginBtn} disabled={cargando}>
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

        <div style={{ marginTop: "40px" }}>
          <h2 style={sectionTitle}>¿Por qué elegirnos?</h2>
          <p style={sectionSub}>
            Todo pensado para que compres fácil, rápido y con confianza.
          </p>

          <div style={grid}>
            <div style={featureCard}>
              💬
              <h3>Soporte rápido</h3>
              <p>Puedes hablar directo desde el pedido y recibir ayuda más rápida.</p>
            </div>

            <div style={featureCard}>
              ⚡
              <h3>Entrega sencilla</h3>
              <p>Todo se entrega dentro del pedido de forma clara y ordenada.</p>
            </div>

            <div style={featureCard}>
              💸
              <h3>Precios accesibles</h3>
              <p>Servicios mucho más baratos que el precio normal del mercado.</p>
            </div>

            <div style={featureCard}>
              📋
              <h3>Todo organizado</h3>
              <p>Revisa saldo, pedidos y mensajes en un solo lugar.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "14px",
  border: "1px solid #f4c5db",
};

const titleStyle = {
  color: "#c5578b",
  fontSize: "16px",
};

const smallText = {
  fontSize: "13px",
  color: "#8d6278",
};

const greenText = {
  color: "#4c9a69",
  fontWeight: "bold",
};

const moreBox = {
  marginTop: "14px",
  padding: "10px",
  borderRadius: "14px",
  background: "#fff",
  textAlign: "center",
  color: "#b84d82",
  fontWeight: "bold",
};

const loginBox = {
  maxWidth: "400px",
  margin: "0 auto",
  background: "#fff",
  borderRadius: "20px",
  padding: "25px",
  border: "1px solid #f4c5db",
};

const tabs = {
  display: "flex",
  marginTop: "15px",
  marginBottom: "15px",
};

const tab = {
  flex: 1,
  padding: "10px",
  border: "none",
  background: "#eee",
  cursor: "pointer",
};

const tabActive = {
  ...tab,
  background: "#e98ab3",
  color: "white",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "10px",
  border: "1px solid #f4c5db",
  boxSizing: "border-box",
};

const loginBtn = {
  width: "100%",
  padding: "12px",
  background: "#e98ab3",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionTitle = {
  textAlign: "center",
  color: "#c5578b",
  fontSize: "28px",
};

const sectionSub = {
  textAlign: "center",
  color: "#8d6278",
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
};

const featureCard = {
  background: "#fff",
  border: "1px solid #f4c5db",
  borderRadius: "18px",
  padding: "20px",
  textAlign: "center",
};