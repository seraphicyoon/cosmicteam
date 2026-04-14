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

      const { data: perfil } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

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
        setMensaje(error.message);
        return;
      }

      const user = data.user;

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            username,
            role: "user",
            balance: 0,
          },
        ]);

      if (profileError) {
        setMensaje("Error al crear perfil.");
        return;
      }

      await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

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
    <main style={main}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* BANNER */}
        <div style={banner}>
          <h1 style={{ color: "#b84d82" }}>COSMICTEAM 💖</h1>
          <p style={{ color: "#8d6278" }}>
            Precios más baratos que el mercado 🚀
          </p>

          <div style={grid}>
            <div style={card}>
              <b>ChatGPT Pro</b>
              <p>Precio real: ~350 MXN</p>
              <p style={{ color: "green" }}>Tu precio: 60 MXN</p>
            </div>

            <div style={card}>
              <b>Canva Pro</b>
              <p>Precio real: ~2000 MXN</p>
              <p style={{ color: "green" }}>Tu precio: 50 MXN</p>
            </div>

            <div style={card}>
              <b>CapCut Pro</b>
              <p>Precio real: ~170 MXN</p>
              <p style={{ color: "green" }}>Tu precio: 40 MXN</p>
            </div>
          </div>

          <div style={more}>Y mucho más... ✨</div>
        </div>

        {/* LOGIN */}
        <div style={loginBox}>
          <h2 style={{ textAlign: "center" }}>COSMICTEAM</h2>

          <div style={tabs}>
            <button
              onClick={() => setModo("login")}
              style={modo === "login" ? activeTab : tab}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => setModo("register")}
              style={modo === "register" ? activeTab : tab}
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

          <button onClick={handleSubmit} style={btn}>
            {modo === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          {mensaje && <p style={{ color: "#c5578b" }}>{mensaje}</p>}
        </div>

      </div>
    </main>
  );
}

/* estilos */

const main = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #fff8fc 0%, #ffeef7 45%, #fffaf3 100%)",
  padding: "20px",
  fontFamily: "Arial",
};

const banner = {
  background: "#eaa3c2",
  borderRadius: "20px",
  padding: "20px",
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "10px",
};

const card = {
  background: "white",
  padding: "10px",
  borderRadius: "10px",
};

const more = {
  marginTop: "10px",
  textAlign: "center",
  fontWeight: "bold",
};

const loginBox = {
  maxWidth: "400px",
  margin: "0 auto",
  background: "white",
  padding: "20px",
  borderRadius: "20px",
};

const tabs = {
  display: "flex",
  marginBottom: "10px",
};

const tab = {
  flex: 1,
  padding: "10px",
  background: "#eee",
};

const activeTab = {
  ...tab,
  background: "#e98ab3",
  color: "white",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
};

const btn = {
  width: "100%",
  padding: "10px",
  background: "#e98ab3",
  color: "white",
  border: "none",
};