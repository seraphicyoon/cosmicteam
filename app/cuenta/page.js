"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [comprandoId, setComprandoId] = useState(null);

  useEffect(() => {
    cargarTodo();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      cargarTodo();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function cargarTodo() {
    setCargando(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: perfilData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setPerfil(perfilData || null);
    } else {
      setPerfil(null);
    }

    const { data: productosData } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    setProductos(productosData || []);
    setCargando(false);
  }

  async function comprarProducto(producto) {
    setMensaje("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      window.location.href = "/login";
      return;
    }

    try {
      setComprandoId(producto.id);

      const { data, error } = await supabase.rpc("buy_product", {
        p_product_id: producto.id,
      });

      if (error) {
        setMensaje("No se pudo completar la compra: " + error.message);
        return;
      }

      setMensaje(
        "Compra realizada con éxito 💖 Tu pedido de " +
          (data?.product_name || producto.name) +
          " fue registrado."
      );

      await cargarTodo();
    } catch (e) {
      setMensaje("Ocurrió un error inesperado al comprar.");
    } finally {
      setComprandoId(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff7fb 0%, #ffeef6 35%, #fffaf2 100%)",
        color: "#6b3153",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #f5bfd6",
            borderRadius: "28px",
            padding: "24px 28px",
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            boxShadow: "0 10px 30px rgba(244, 182, 210, 0.25)",
          }}
        >
          <div>
            <div
              style={{
                color: "#d96c9d",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Tienda digital
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                color: "#c95c93",
              }}
            >
              COSMICTEAM
            </h1>

            <p style={{ marginTop: "10px", color: "#8b5d75" }}>
              Servicios digitales, recargas y compras por créditos.
            </p>
          </div>

          <div
            style={{
              background: "#fff8fc",
              border: "1px solid #f5bfd6",
              borderRadius: "20px",
              padding: "14px 18px",
              minWidth: "220px",
              textAlign: "right",
              boxShadow: "0 6px 18px rgba(244, 182, 210, 0.18)",
            }}
          >
            <div style={{ color: "#9f7389", fontSize: "13px" }}>
              {perfil ? "Saldo de " + perfil.username : "Saldo"}
            </div>
            <div
              style={{
                color: "#d55d95",
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              {perfil ? (perfil.balance ?? 0) + " créditos" : "Inicia sesión"}
            </div>
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
              lineHeight: 1.5,
            }}
          >
            {mensaje}
          </div>
        ) : null}

        <div
          style={{
            marginTop: "24px",
            border: "1px solid #f7d6e5",
            borderRadius: "24px",
            padding: "18px 22px",
            background: "rgba(255,255,255,0.78)",
            boxShadow: "0 8px 20px rgba(244, 182, 210, 0.14)",
          }}
        >
          <p style={{ margin: 0, color: "#8b5d75" }}>
            {perfil ? (
              <>
                Bienvenida <strong>{perfil.username}</strong> a{" "}
                <strong>COSMICTEAM</strong>.
              </>
            ) : (
              <>
                Bienvenida a <strong>COSMICTEAM</strong>.
              </>
            )}
          </p>

          <p
            style={{
              marginTop: "8px",
              color: "#d96c9d",
              fontWeight: "bold",
            }}
          >
            1 crédito = 1 peso
          </p>
        </div>

        <div style={{ marginTop: "34px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                fontSize: "32px",
                margin: 0,
                color: "#c95c93",
              }}
            >
              Servicios disponibles
            </h2>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {!perfil ? (
                <a
                  href="/login"
                  style={{
                    textDecoration: "none",
                    background:
                      "linear-gradient(90deg, #f59ac2 0%, #e97fb0 100%)",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Iniciar sesión
                </a>
              ) : (
                <>
                  <a
                    href="/cuenta"
                    style={{
                      textDecoration: "none",
                      background:
                        "linear-gradient(90deg, #f59ac2 0%, #e97fb0 100%)",
                      color: "white",
                      padding: "12px 16px",
                      borderRadius: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Mi cuenta
                  </a>

                  {perfil.role === "admin" ? (
                    <a
                      href="/admin"
                      style={{
                        textDecoration: "none",
                        background: "#fff",
                        color: "#9a6b82",
                        padding: "12px 16px",
                        borderRadius: "16px",
                        fontWeight: "bold",
                        border: "1px solid #f4c5db",
                      }}
                    >
                      Admin
                    </a>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {cargando ? (
            <p style={{ color: "#8b5d75" }}>Cargando productos...</p>
          ) : productos.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #f5bfd6",
                borderRadius: "26px",
                padding: "20px",
                color: "#8b5d75",
              }}
            >
              No hay productos activos todavía.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "22px",
              }}
            >
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid #f5bfd6",
                    borderRadius: "26px",
                    overflow: "hidden",
                    boxShadow: "0 10px 24px rgba(244, 182, 210, 0.22)",
                  }}
                >
                  <div
                    style={{
                      height: "170px",
                      background:
                        "linear-gradient(135deg, #ffd9ea 0%, #fff0f7 45%, #ffe7bf 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#c95c93",
                      textAlign: "center",
                      padding: "12px",
                    }}
                  >
                    {producto.name}
                  </div>

                  <div style={{ padding: "18px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "24px",
                        color: "#a84d7c",
                      }}
                    >
                      {producto.name}
                    </h3>

                    <p style={{ color: "#8b5d75", marginTop: "10px" }}>
                      {producto.description || "Sin descripción"}
                    </p>

                    <p
                      style={{
                        color: "#d55d95",
                        fontWeight: "bold",
                        fontSize: "28px",
                        marginTop: "14px",
                      }}
                    >
                      {producto.price} créditos
                    </p>

                    <p
                      style={{
                        color: producto.stock > 0 ? "#8b5d75" : "#c5578b",
                        marginTop: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      {producto.stock > 0
                        ? "Stock disponible: " + producto.stock
                        : "Agotado"}
                    </p>

                    <button
                      onClick={() => comprarProducto(producto)}
                      disabled={producto.stock <= 0 || comprandoId === producto.id}
                      style={{
                        width: "100%",
                        marginTop: "16px",
                        background:
                          producto.stock > 0
                            ? "linear-gradient(90deg, #f59ac2 0%, #e97fb0 100%)"
                            : "#e6c7d7",
                        color: "white",
                        border: "none",
                        borderRadius: "16px",
                        padding: "13px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        cursor: producto.stock > 0 ? "pointer" : "not-allowed",
                      }}
                    >
                      {comprandoId === producto.id
                        ? "Procesando..."
                        : producto.stock > 0
                        ? "Comprar"
                        : "Agotado"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}