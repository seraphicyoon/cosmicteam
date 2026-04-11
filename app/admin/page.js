"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [perfil, setPerfil] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarTodo = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        window.location.href = "/login";
        return;
      }

      const { data: miPerfil, error: perfilError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (perfilError || !miPerfil) {
        window.location.href = "/login";
        return;
      }

      if (miPerfil.role !== "admin") {
        window.location.href = "/cuenta";
        return;
      }

      setPerfil(miPerfil);

      const { data: listaUsuarios } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setUsuarios(listaUsuarios || []);
      setCargando(false);
    };

    cargarTodo();
  }, []);

  const cambiarSaldo = async (id, saldoActual, cambio) => {
    setMensaje("");

    const nuevoSaldo = Number(saldoActual || 0) + Number(cambio);

    if (isNaN(nuevoSaldo)) {
      setMensaje("Saldo inválido.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ balance: nuevoSaldo })
      .eq("id", id);

    if (error) {
      setMensaje("No se pudo actualizar el saldo.");
      return;
    }

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, balance: nuevoSaldo } : u
      )
    );

    setMensaje("Saldo actualizado correctamente 💖");
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (cargando) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        Cargando panel admin...
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
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
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
                Panel de administración
              </p>

              <h1
                style={{
                  margin: "10px 0 8px 0",
                  fontSize: "34px",
                  color: "#c5578b",
                }}
              >
                Hola, {perfil?.username} 👑
              </h1>

              <p style={{ margin: 0, color: "#8d6278" }}>
                Desde aquí puedes ver usuarias y cambiar saldo.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
              }}
            >
              {mensaje}
            </div>
          ) : null}

          <div
            style={{
              marginTop: "24px",
              background: "#fff7fb",
              border: "1px solid #f4c5db",
              borderRadius: "22px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#c5578b" }}>Usuarias registradas</h2>

            <div style={{ display: "grid", gap: "14px" }}>
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #f4c5db",
                    borderRadius: "18px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "20px" }}>
                      {usuario.username}
                    </div>
                    <div style={{ color: "#8d6278", marginTop: "6px" }}>
                      Rol: {usuario.role} · Saldo: {usuario.balance ?? 0} créditos
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => cambiarSaldo(usuario.id, usuario.balance, 10)}
                      style={{
                        border: "none",
                        background: "#e98ab3",
                        color: "white",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      +10
                    </button>

                    <button
                      onClick={() => cambiarSaldo(usuario.id, usuario.balance, 50)}
                      style={{
                        border: "none",
                        background: "#d96c9d",
                        color: "white",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      +50
                    </button>

                    <button
                      onClick={() => cambiarSaldo(usuario.id, usuario.balance, 100)}
                      style={{
                        border: "none",
                        background: "#c5578b",
                        color: "white",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      +100
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}