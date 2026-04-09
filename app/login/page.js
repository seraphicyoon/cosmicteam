"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const email = username + "@cosmicteam.com";

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Bienvenido 💖");
    }
  };

  const handleRegister = async () => {
    const email = username + "@cosmicteam.com";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Cuenta creada 💖");

      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: username,
          balance: 0,
          role: "user",
        },
      ]);
    }
  };

  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>Login / Registro</h1>

      <input
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Iniciar sesión</button>

      <br /><br />

      <button onClick={handleRegister}>Registrarse</button>
    </main>
  );
}