"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function getStatusStyle(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("pendiente")) {
    return {
      background: "#fff2f8",
      color: "#cc6f9b",
      border: "1px solid #f4c5db",
    };
  }

  if (s.includes("verificando")) {
    return {
      background: "#fff7ec",
      color: "#c98a3d",
      border: "1px solid #f1d3a6",
    };
  }

  if (s.includes("esperando")) {
    return {
      background: "#f8f4ff",
      color: "#8f6ccf",
      border: "1px solid #d8caf7",
    };
  }

  if (s.includes("preparacion")) {
    return {
      background: "#eef7ff",
      color: "#4f88c7",
      border: "1px solid #c9def7",
    };
  }

  if (s.includes("entrega")) {
    return {
      background: "#eefcf3",
      color: "#4c9a69",
      border: "1px solid #c9ebd3",
    };
  }

  if (s.includes("cancelado")) {
    return {
      background: "#fff1f1",
      color: "#c56b6b",
      border: "1px solid #efc6c6",
    };
  }

  return {
    background: "#fff7fb",
    color: "#8d6278",
    border: "1px solid #f4c5db",
  };
}

function formatDate(dateString) {
  if (!dateString) return "Sin fecha";

  const date = new Date(dateString);

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CuentaPage() {
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [mensajesPorPedido, setMensajesPorPedido] = useState({});
  const [nuevoMensaje, setNuevoMensaje] = useState({});
  const [cargando, setCargando] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [showRechargeInfo, setShowRechargeInfo] = useState(false);
  const [reopenForms, setReopenForms] = useState({});
  const [aviso, setAviso] = useState("");

  async function cargarMensajes(orderIds) {
    if (!orderIds || orderIds.length === 0) {
      setMensajesPorPedido({});
      return;
    }

    const { data: mensajesData } = await supabase
      .from("order_messages")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true });

    const mensajesMap = {};
    (mensajesData || []).forEach((msg) => {
      if (!mensajesMap[msg.order_id]) {
        mensajesMap[msg.order_id] = [];
      }
      mensajesMap[msg.order_id].push(msg);
    });

    setMensajesPorPedido(mensajesMap);
  }

  async function cargarCuenta(showLoading = true) {
    if (showLoading) setCargando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (showLoading) setCargando(false);
        window.location.href = "/login";
        return;
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (perfilError || !perfilData) {
        if (showLoading) setCargando(false);
        window.location.href = "/login";
        return;
      }

      const { data: pedidosData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const pedidosFinal = pedidosData || [];
      const ids = pedidosFinal.map((p) => p.id);

      setPerfil(perfilData);
      setPedidos(pedidosFinal);
      await cargarMensajes(ids);

      if (showLoading) setCargando(false);
    } catch (e) {
      if (showLoading) setCargando(false);
      window.location.href = "/login";
    }
  }

  useEffect(() => {
    let mounted = true;
    let intervalId;

    async function init() {
      if (!mounted) return;
      await cargarCuenta(true);

      intervalId = setInterval(async () => {
        if (!mounted) return;
        await cargarCuenta(false);
      }, 3000);
    }

    init();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  function toggleOrder(pedidoId) {
    setExpandedOrders((prev) => ({
      ...prev,
      [pedidoId]: !prev[pedidoId],
    }));
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function enviarMensaje(orderId) {
    const texto = (nuevoMensaje[orderId] || "").trim();
    if (!texto || !perfil) return;

    const pedido = pedidos.find((p) => p.id === orderId);
    if (pedido?.chat_closed) return;

    const { data, error } = await supabase
      .from("order_messages")
      .insert([
        {
          order_id: orderId,
          user_id: perfil.id,
          sender_role: perfil.role === "admin" ? "admin" : "user",
          message: texto,
        },
      ])
      .select()
      .single();

    if (error) return;

    setMensajesPorPedido((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), data],
    }));

    setNuevoMensaje((prev) => ({
      ...prev,
      [orderId]: "",
    }));
  }

async function solicitarReapertura(orderId) {
  const motivo = (reopenForms[orderId] || "").trim();

  if (!motivo) {
    setAviso("Escribe el motivo de la reposición.");
    return;
  }

  if (!perfil?.id) {
    setAviso("No se pudo identificar tu cuenta.");
    return;
  }

  const { data: updatedOrder, error } = await supabase
    .from("orders")
    .update({
      reopen_requested: true,
      reopen_reason: motivo,
    })
    .eq("id", orderId)
    .eq("user_id", perfil.id)
    .select()
    .single();

  if (error || !updatedOrder) {
    setAviso(
      "No se pudo enviar la solicitud. Revisa las políticas de Supabase para permitir que la clienta actualice su propio pedido."
    );
    return;
  }

  const { data: msgData } = await supabase
    .from("order_messages")
    .insert([
      {
        order_id: orderId,
        user_id: perfil.id,
        sender_role: "user",
        message:
          "Solicité reapertura del chat por reposición/garantía.\nMotivo: " +
          motivo,
      },
    ])
    .select()
    .single();

  if (msgData) {
    setMensajesPorPedido((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), msgData],
    }));
  }

  setPedidos((prev) =>
    prev.map((p) =>
      p.id === orderId
        ? {
            ...p,
            reopen_requested: true,
            reopen_reason: motivo,
          }
        : p
    )
  );

  setReopenForms((prev) => ({
    ...prev,
    [orderId]: "",
  }));

  setAviso("Solicitud enviada correctamente 💖");
}

  if (cargando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          background:
            "linear-gradient(180deg, #fff8fc 0%, #ffeef7 50%, #fffaf3 100%)",
        }}
      >
        Cargando tu cuenta...
      </main>
    );
  }

  const username = perfil?.username || "clienta";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff8fc 0%, #ffeef7 50%, #fffaf3 100%)",
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
                Desde aquí podrás revisar tu saldo y tus pedidos.
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

          {aviso ? (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "14px",
                border: "1px solid #f4c5db",
                background: "#fff7fb",
                color: "#8d6278",
              }}
            >
              {aviso}
            </div>
          ) : null}

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
              marginTop: "20px",
              background: "#fff7fb",
              border: "1px solid #f4c5db",
              borderRadius: "20px",
              padding: "16px",
            }}
          >
            <button
              onClick={() => setShowRechargeInfo(!showRechargeInfo)}
              style={{
                border: "none",
                background: showRechargeInfo ? "#e98ab3" : "#fff",
                color: showRechargeInfo ? "white" : "#9a6b82",
                borderRadius: "14px",
                padding: "12px 16px",
                fontWeight: "bold",
                cursor: "pointer",
                borderWidth: showRechargeInfo ? "0" : "1px",
                borderStyle: "solid",
                borderColor: "#f4c5db",
              }}
            >
              {showRechargeInfo
                ? "Ocultar instrucciones de recarga"
                : "Ver instrucciones de recarga"}
            </button>

            {showRechargeInfo ? (
              <div
                style={{
                  marginTop: "14px",
                  background: "#fff",
                  border: "1px solid #f4c5db",
                  borderRadius: "18px",
                  padding: "16px",
                  color: "#8d6278",
                  lineHeight: 1.8,
                }}
              >
                <strong style={{ color: "#c5578b", fontSize: "18px" }}>
                  Recargar saldo
                </strong>
                <br />
                Para recargar tu saldo, únete al grupo de WhatsApp y solicita los
                datos bancarios para hacer tu transferencia.
                <br />
                <br />
                <a
                  href="https://chat.whatsapp.com/GFXj499XGDnF7Gej4NJZxB"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    textDecoration: "none",
                    background: "#e98ab3",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    marginBottom: "14px",
                  }}
                >
                  Unirme al grupo de WhatsApp
                </a>
                <br />
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
            ) : null}
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
                {pedidos.map((pedido) => {
                  const statusStyle = getStatusStyle(pedido.status);
                  const mensajes = mensajesPorPedido[pedido.id] || [];
                  const isOpen = !!expandedOrders[pedido.id];

                  return (
                    <div
                      key={pedido.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #f4c5db",
                        borderRadius: "18px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "bold",
                              color: "#c5578b",
                              fontSize: "20px",
                            }}
                          >
                            {pedido.product_name}
                          </div>

                          <div style={{ color: "#8d6278", marginTop: "8px" }}>
                            Precio: {pedido.price} créditos
                          </div>

                          <div style={{ color: "#8d6278", marginTop: "4px" }}>
                            Fecha: {formatDate(pedido.created_at)}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <div
                            style={{
                              ...statusStyle,
                              borderRadius: "999px",
                              padding: "8px 12px",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            {pedido.status}
                          </div>

                          <button
                            onClick={() => toggleOrder(pedido.id)}
                            style={{
                              border: "1px solid #f4c5db",
                              background: "#fff",
                              color: "#9a6b82",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            {isOpen ? "Ocultar" : "Ver pedido"}
                          </button>
                        </div>
                      </div>

                      {!isOpen ? null : (
                        <>
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "8px 12px",
                              borderRadius: "12px",
                              background: pedido.chat_closed ? "#fff1f1" : "#eefcf3",
                              color: pedido.chat_closed ? "#c56b6b" : "#4c9a69",
                              border: pedido.chat_closed
                                ? "1px solid #efc6c6"
                                : "1px solid #c9ebd3",
                              fontWeight: "bold",
                              fontSize: "14px",
                              display: "inline-block",
                            }}
                          >
                            {pedido.chat_closed ? "Chat cerrado por admin" : "Chat abierto"}
                          </div>

                          {pedido.delivery_message ? (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px",
                                borderRadius: "12px",
                                background: "#fff7fb",
                                border: "1px solid #f4c5db",
                                color: "#8d6278",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              <strong style={{ color: "#c5578b" }}>Entrega:</strong>
                              <br />
                              {pedido.delivery_message}
                            </div>
                          ) : null}

                          {pedido.admin_comment ? (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px",
                                borderRadius: "12px",
                                background: "#fff7fb",
                                border: "1px solid #f4c5db",
                                color: "#8d6278",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              <strong style={{ color: "#c5578b" }}>Comentario:</strong>
                              <br />
                              {pedido.admin_comment}
                            </div>
                          ) : null}

                          {pedido.chat_closed ? (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#fff7fb",
                                border: "1px solid #f4c5db",
                              }}
                            >
                              <div style={{ color: "#c5578b", fontWeight: "bold" }}>
                                Solicitar abrir chat por reposición
                              </div>

                              <div style={{ color: "#8d6278", marginTop: "8px" }}>
                                Si tu servicio tuvo una caída dentro del tiempo de garantía
                                indicado en tu pedido, puedes solicitar reapertura para
                                revisión.
                              </div>

                              {pedido.reopen_requested ? (
                                <div
                                  style={{
                                    marginTop: "10px",
                                    color: "#8d6278",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Ya enviaste una solicitud de reapertura.
                                </div>
                              ) : (
                                <>
                                  <textarea
                                    rows={3}
                                    placeholder="Explica brevemente la caída o el problema del servicio..."
                                    value={reopenForms[pedido.id] || ""}
                                    onChange={(e) =>
                                      setReopenForms((prev) => ({
                                        ...prev,
                                        [pedido.id]: e.target.value,
                                      }))
                                    }
                                    style={{
                                      width: "100%",
                                      marginTop: "10px",
                                      padding: "12px",
                                      borderRadius: "12px",
                                      border: "1px solid #f4c5db",
                                      fontSize: "15px",
                                      resize: "vertical",
                                      boxSizing: "border-box",
                                    }}
                                  />

                                  <button
                                    onClick={() => solicitarReapertura(pedido.id)}
                                    style={{
                                      marginTop: "10px",
                                      border: "none",
                                      background: "#e98ab3",
                                      color: "white",
                                      borderRadius: "12px",
                                      padding: "10px 14px",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Solicitar abrir chat por reposición
                                  </button>
                                </>
                              )}
                            </div>
                          ) : null}

                          <div
                            style={{
                              marginTop: "14px",
                              background: "#fffafc",
                              border: "1px solid #f4c5db",
                              borderRadius: "16px",
                              padding: "14px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                color: "#c5578b",
                                marginBottom: "10px",
                              }}
                            >
                              Chat del pedido
                            </div>

                            <div style={{ display: "grid", gap: "10px" }}>
                              {mensajes.length === 0 ? (
                                <div style={{ color: "#8d6278", fontSize: "14px" }}>
                                  Todavía no hay mensajes en este pedido.
                                </div>
                              ) : (
                                mensajes.map((msg) => (
                                  <div
                                    key={msg.id}
                                    style={{
                                      padding: "10px 12px",
                                      borderRadius: "12px",
                                      background:
                                        msg.sender_role === "admin"
                                          ? "#fff1f7"
                                          : "#f9f7ff",
                                      border: "1px solid #f1d5e3",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        color: "#b36088",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      {msg.sender_role === "admin" ? "Admin" : "Tú"} ·{" "}
                                      {formatDate(msg.created_at)}
                                    </div>
                                    <div style={{ color: "#7c4a65", whiteSpace: "pre-wrap" }}>
                                      {msg.message}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                              <textarea
                                rows={3}
                                placeholder={
                                  pedido.chat_closed
                                    ? "Este chat fue cerrado por admin."
                                    : "Escribe un mensaje sobre este pedido..."
                                }
                                value={nuevoMensaje[pedido.id] || ""}
                                onChange={(e) =>
                                  setNuevoMensaje((prev) => ({
                                    ...prev,
                                    [pedido.id]: e.target.value,
                                  }))
                                }
                                disabled={pedido.chat_closed}
                                style={{
                                  width: "100%",
                                  padding: "12px",
                                  borderRadius: "12px",
                                  border: "1px solid #f4c5db",
                                  fontSize: "15px",
                                  resize: "vertical",
                                  boxSizing: "border-box",
                                  background: pedido.chat_closed ? "#f7f2f5" : "white",
                                }}
                              />

                              <button
                                onClick={() => enviarMensaje(pedido.id)}
                                disabled={pedido.chat_closed}
                                style={{
                                  border: "none",
                                  background: pedido.chat_closed ? "#d8c5cf" : "#e98ab3",
                                  color: "white",
                                  borderRadius: "12px",
                                  padding: "10px 14px",
                                  fontWeight: "bold",
                                  cursor: pedido.chat_closed ? "not-allowed" : "pointer",
                                  width: "fit-content",
                                }}
                              >
                                Enviar mensaje
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}