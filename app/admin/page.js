"use client";

import { useEffect, useMemo, useState } from "react";
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

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: active ? "#e98ab3" : "#fff",
        color: active ? "white" : "#9a6b82",
        borderRadius: "14px",
        padding: "12px 16px",
        fontWeight: "bold",
        cursor: "pointer",
        borderWidth: active ? "0" : "1px",
        borderStyle: "solid",
        borderColor: "#f4c5db",
      }}
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [perfil, setPerfil] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mensajesPorPedido, setMensajesPorPedido] = useState({});
  const [nuevoMensaje, setNuevoMensaje] = useState({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [saldosEditados, setSaldosEditados] = useState({});
  const [productosEditados, setProductosEditados] = useState({});
  const [pedidosEditados, setPedidosEditados] = useState({});
  const [nuevoProducto, setNuevoProducto] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    active: true,
    options_text: "",
  });
  const [activeTab, setActiveTab] = useState("resumen");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    let mounted = true;
    let intervalId;

    async function cargarTodo(showLoading = true) {
      if (!mounted) return;
      if (showLoading) setCargando(true);

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

      const usuariosFinal = listaUsuarios || [];
      setUsuarios(usuariosFinal);

      const saldosIniciales = {};
      usuariosFinal.forEach((u) => {
        saldosIniciales[u.id] = u.balance ?? 0;
      });
      setSaldosEditados(saldosIniciales);

      const { data: listaPedidos } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const pedidosFinal = listaPedidos || [];
      setPedidos(pedidosFinal);

      const pedidosIniciales = {};
      pedidosFinal.forEach((p) => {
        pedidosIniciales[p.id] = {
          delivery_message: p.delivery_message || "",
          admin_comment: p.admin_comment || "",
        };
      });
      setPedidosEditados(pedidosIniciales);

      const pedidoIds = pedidosFinal.map((p) => p.id);
      const mensajesMap = {};

      if (pedidoIds.length > 0) {
        const { data: mensajesData } = await supabase
          .from("order_messages")
          .select("*")
          .in("order_id", pedidoIds)
          .order("created_at", { ascending: true });

        (mensajesData || []).forEach((msg) => {
          if (!mensajesMap[msg.order_id]) {
            mensajesMap[msg.order_id] = [];
          }
          mensajesMap[msg.order_id].push(msg);
        });
      }

      setMensajesPorPedido(mensajesMap);

      const { data: listaProductos } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      const productosFinal = listaProductos || [];
      setProductos(productosFinal);

      const productosIniciales = {};
      productosFinal.forEach((p) => {
        productosIniciales[p.id] = {
          name: p.name || "",
          description: p.description || "",
          price: p.price ?? 0,
          stock: p.stock ?? 0,
          active: !!p.active,
          options_text: p.options_text || "",
        };
      });
      setProductosEditados(productosIniciales);

      if (showLoading) setCargando(false);
    }

    cargarTodo(true);

    intervalId = setInterval(() => {
      cargarTodo(false);
    }, 3000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const stats = useMemo(() => {
    const pedidosPendientes = pedidos.filter((p) =>
      (p.status || "").toLowerCase().includes("pendiente")
    ).length;

    const pedidosAbiertos = pedidos.filter((p) => !p.chat_closed).length;
    const productosActivos = productos.filter((p) => p.active).length;

    return {
      usuarios: usuarios.length,
      pedidos: pedidos.length,
      pendientes: pedidosPendientes,
      chatsAbiertos: pedidosAbiertos,
      productos: productos.length,
      productosActivos,
    };
  }, [usuarios, pedidos, productos]);

  const toggleOrder = (pedidoId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [pedidoId]: !prev[pedidoId],
    }));
  };

  const guardarSaldo = async (id) => {
    setMensaje("");

    const nuevoSaldo = Number(saldosEditados[id]);

    if (isNaN(nuevoSaldo) || nuevoSaldo < 0) {
      setMensaje("El saldo debe ser un número válido mayor o igual a 0.");
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
      prev.map((u) => (u.id === id ? { ...u, balance: nuevoSaldo } : u))
    );

    setMensaje("Saldo actualizado correctamente 💖");
  };

  const crearProducto = async () => {
    setMensaje("");

    const name = nuevoProducto.name.trim();
    const description = nuevoProducto.description.trim();
    const price = Number(nuevoProducto.price);
    const stock = Number(nuevoProducto.stock);
    const options_text = nuevoProducto.options_text.trim();

    if (!name) {
      setMensaje("Escribe el nombre del producto.");
      return;
    }

    if (isNaN(price) || price < 0) {
      setMensaje("El precio base debe ser un número válido.");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setMensaje("El stock debe ser un número válido.");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price,
          stock,
          active: nuevoProducto.active,
          options_text,
        },
      ])
      .select()
      .single();

    if (error) {
      setMensaje("No se pudo crear el producto.");
      return;
    }

    setProductos((prev) => [data, ...prev]);
    setProductosEditados((prev) => ({
      ...prev,
      [data.id]: {
        name: data.name || "",
        description: data.description || "",
        price: data.price ?? 0,
        stock: data.stock ?? 0,
        active: !!data.active,
        options_text: data.options_text || "",
      },
    }));

    setNuevoProducto({
      name: "",
      description: "",
      price: "",
      stock: "",
      active: true,
      options_text: "",
    });

    setMensaje("Producto creado correctamente 💖");
  };

  const guardarProducto = async (productoId) => {
    setMensaje("");

    const producto = productosEditados[productoId];
    if (!producto) {
      setMensaje("No se encontró el producto a editar.");
      return;
    }

    const name = String(producto.name || "").trim();
    const description = String(producto.description || "").trim();
    const price = Number(producto.price);
    const stock = Number(producto.stock);
    const active = !!producto.active;
    const options_text = String(producto.options_text || "").trim();

    if (!name) {
      setMensaje("El producto debe tener nombre.");
      return;
    }

    if (isNaN(price) || price < 0) {
      setMensaje("El precio debe ser un número válido.");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setMensaje("El stock debe ser un número válido.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price,
        stock,
        active,
        options_text,
      })
      .eq("id", productoId);

    if (error) {
      setMensaje("No se pudo guardar el producto.");
      return;
    }

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId
          ? { ...p, name, description, price, stock, active, options_text }
          : p
      )
    );

    setMensaje("Producto actualizado correctamente 💖");
  };

  const eliminarProducto = async (productoId, nombreProducto) => {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar "${nombreProducto}"?`
    );

    if (!confirmado) return;

    setMensaje("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productoId);

    if (error) {
      setMensaje("No se pudo eliminar el producto.");
      return;
    }

    setProductos((prev) => prev.filter((p) => p.id !== productoId));

    setProductosEditados((prev) => {
      const copia = { ...prev };
      delete copia[productoId];
      return copia;
    });

    setMensaje("Producto eliminado correctamente 💖");
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    setMensaje("");

    const { error } = await supabase
      .from("orders")
      .update({ status: nuevoEstado })
      .eq("id", pedidoId);

    if (error) {
      setMensaje("No se pudo actualizar el pedido.");
      return;
    }

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, status: nuevoEstado } : pedido
      )
    );

    setMensaje("Pedido actualizado correctamente 💖");
  };

  const cambiarEstadoChat = async (pedidoId, cerrado) => {
    setMensaje("");

    const { error } = await supabase
      .from("orders")
      .update({ chat_closed: cerrado })
      .eq("id", pedidoId);

    if (error) {
      setMensaje("No se pudo cambiar el estado del chat.");
      return;
    }

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, chat_closed: cerrado } : pedido
      )
    );

    setMensaje(cerrado ? "Chat cerrado correctamente 💖" : "Chat reabierto correctamente 💖");
  };

  const guardarDetallePedido = async (pedidoId) => {
    setMensaje("");

    const detalle = pedidosEditados[pedidoId] || {};
    const delivery_message = String(detalle.delivery_message || "").trim();
    const admin_comment = String(detalle.admin_comment || "").trim();

    const { error } = await supabase
      .from("orders")
      .update({
        delivery_message,
        admin_comment,
      })
      .eq("id", pedidoId);

    if (error) {
      setMensaje("No se pudo guardar la información del pedido.");
      return;
    }

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId
          ? { ...pedido, delivery_message, admin_comment }
          : pedido
      )
    );

    setMensaje("Información del pedido guardada correctamente 💖");
  };

  const enviarMensaje = async (orderId) => {
    const texto = (nuevoMensaje[orderId] || "").trim();
    if (!texto || !perfil) return;

    const pedido = pedidos.find((p) => p.id === orderId);
    if (pedido?.chat_closed) {
      setMensaje("Este chat está cerrado.");
      return;
    }

    const { data, error } = await supabase
      .from("order_messages")
      .insert([
        {
          order_id: orderId,
          user_id: perfil.id,
          sender_role: "admin",
          message: texto,
        },
      ])
      .select()
      .single();

    if (error) {
      setMensaje("No se pudo enviar el mensaje.");
      return;
    }

    setMensajesPorPedido((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), data],
    }));

    setNuevoMensaje((prev) => ({
      ...prev,
      [orderId]: "",
    }));

    setMensaje("Mensaje enviado correctamente 💖");
  };

  const obtenerUsername = (userId) => {
    const usuario = usuarios.find((u) => u.id === userId);
    return usuario?.username || "Usuario desconocido";
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
      <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
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
                Todo está más ordenado por secciones.
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
              marginTop: "22px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <TabButton active={activeTab === "resumen"} onClick={() => setActiveTab("resumen")}>
              Resumen
            </TabButton>
            <TabButton active={activeTab === "pedidos"} onClick={() => setActiveTab("pedidos")}>
              Pedidos
            </TabButton>
            <TabButton active={activeTab === "usuarias"} onClick={() => setActiveTab("usuarias")}>
              Usuarias
            </TabButton>
            <TabButton active={activeTab === "productos"} onClick={() => setActiveTab("productos")}>
              Productos
            </TabButton>
          </div>

          {activeTab === "resumen" ? (
            <div
              style={{
                marginTop: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                ["Usuarias", stats.usuarios],
                ["Pedidos", stats.pedidos],
                ["Pendientes", stats.pendientes],
                ["Chats abiertos", stats.chatsAbiertos],
                ["Productos", stats.productos],
                ["Productos activos", stats.productosActivos],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "#fff7fb",
                    border: "1px solid #f4c5db",
                    borderRadius: "22px",
                    padding: "20px",
                  }}
                >
                  <div style={{ color: "#9f6c84", fontSize: "14px" }}>{label}</div>
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#c5578b",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "usuarias" ? (
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
                        Rol: {usuario.role}
                      </div>
                      <div style={{ color: "#8d6278", marginTop: "4px" }}>
                        Saldo actual: {usuario.balance ?? 0} créditos
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        value={saldosEditados[usuario.id] ?? 0}
                        onChange={(e) =>
                          setSaldosEditados((prev) => ({
                            ...prev,
                            [usuario.id]: e.target.value,
                          }))
                        }
                        style={{
                          width: "120px",
                          padding: "10px 12px",
                          borderRadius: "12px",
                          border: "1px solid #f4c5db",
                          fontSize: "15px",
                        }}
                      />

                      <button
                        onClick={() => guardarSaldo(usuario.id)}
                        style={{
                          border: "none",
                          background: "#e98ab3",
                          color: "white",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Guardar saldo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "productos" ? (
            <>
              <div
                style={{
                  marginTop: "24px",
                  background: "#fff7fb",
                  border: "1px solid #f4c5db",
                  borderRadius: "22px",
                  padding: "20px",
                }}
              >
                <h2 style={{ marginTop: 0, color: "#c5578b" }}>Crear producto nuevo</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nuevoProducto.name}
                    onChange={(e) =>
                      setNuevoProducto((prev) => ({ ...prev, name: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #f4c5db",
                      fontSize: "15px",
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Descripción"
                    value={nuevoProducto.description}
                    onChange={(e) =>
                      setNuevoProducto((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #f4c5db",
                      fontSize: "15px",
                    }}
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Precio base"
                    value={nuevoProducto.price}
                    onChange={(e) =>
                      setNuevoProducto((prev) => ({ ...prev, price: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #f4c5db",
                      fontSize: "15px",
                    }}
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={nuevoProducto.stock}
                    onChange={(e) =>
                      setNuevoProducto((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #f4c5db",
                      fontSize: "15px",
                    }}
                  />
                </div>

                <textarea
                  placeholder={"Opciones de precio, una por línea.\nEjemplo:\n1 mes|20\n2 meses|35\n6 meses|90\nAnual|150"}
                  value={nuevoProducto.options_text}
                  onChange={(e) =>
                    setNuevoProducto((prev) => ({
                      ...prev,
                      options_text: e.target.value,
                    }))
                  }
                  rows={6}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #f4c5db",
                    fontSize: "15px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#8d6278",
                      fontWeight: "bold",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={nuevoProducto.active}
                      onChange={(e) =>
                        setNuevoProducto((prev) => ({
                          ...prev,
                          active: e.target.checked,
                        }))
                      }
                    />
                    Activo
                  </label>

                  <button
                    onClick={crearProducto}
                    style={{
                      border: "none",
                      background: "#e98ab3",
                      color: "white",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Crear producto
                  </button>
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
                <h2 style={{ marginTop: 0, color: "#c5578b" }}>Editar productos</h2>

                {productos.length === 0 ? (
                  <p style={{ color: "#8d6278" }}>Todavía no hay productos.</p>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {productos.map((producto) => (
                      <div
                        key={producto.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #f4c5db",
                          borderRadius: "18px",
                          padding: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "12px",
                          }}
                        >
                          <input
                            type="text"
                            value={productosEditados[producto.id]?.name ?? ""}
                            onChange={(e) =>
                              setProductosEditados((prev) => ({
                                ...prev,
                                [producto.id]: {
                                  ...prev[producto.id],
                                  name: e.target.value,
                                },
                              }))
                            }
                            placeholder="Nombre"
                            style={{
                              padding: "12px",
                              borderRadius: "12px",
                              border: "1px solid #f4c5db",
                              fontSize: "15px",
                            }}
                          />

                          <input
                            type="text"
                            value={productosEditados[producto.id]?.description ?? ""}
                            onChange={(e) =>
                              setProductosEditados((prev) => ({
                                ...prev,
                                [producto.id]: {
                                  ...prev[producto.id],
                                  description: e.target.value,
                                },
                              }))
                            }
                            placeholder="Descripción"
                            style={{
                              padding: "12px",
                              borderRadius: "12px",
                              border: "1px solid #f4c5db",
                              fontSize: "15px",
                            }}
                          />

                          <input
                            type="number"
                            min="0"
                            value={productosEditados[producto.id]?.price ?? 0}
                            onChange={(e) =>
                              setProductosEditados((prev) => ({
                                ...prev,
                                [producto.id]: {
                                  ...prev[producto.id],
                                  price: e.target.value,
                                },
                              }))
                            }
                            placeholder="Precio base"
                            style={{
                              padding: "12px",
                              borderRadius: "12px",
                              border: "1px solid #f4c5db",
                              fontSize: "15px",
                            }}
                          />

                          <input
                            type="number"
                            min="0"
                            value={productosEditados[producto.id]?.stock ?? 0}
                            onChange={(e) =>
                              setProductosEditados((prev) => ({
                                ...prev,
                                [producto.id]: {
                                  ...prev[producto.id],
                                  stock: e.target.value,
                                },
                              }))
                            }
                            placeholder="Stock"
                            style={{
                              padding: "12px",
                              borderRadius: "12px",
                              border: "1px solid #f4c5db",
                              fontSize: "15px",
                            }}
                          />
                        </div>

                        <textarea
                          value={productosEditados[producto.id]?.options_text ?? ""}
                          onChange={(e) =>
                            setProductosEditados((prev) => ({
                              ...prev,
                              [producto.id]: {
                                ...prev[producto.id],
                                options_text: e.target.value,
                              },
                            }))
                          }
                          placeholder={"Opciones de precio, una por línea.\nEjemplo:\n1 mes|20\n2 meses|35\n6 meses|90\nAnual|150"}
                          rows={6}
                          style={{
                            width: "100%",
                            marginTop: "12px",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1px solid #f4c5db",
                            fontSize: "15px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                        />

                        <div
                          style={{
                            marginTop: "14px",
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: "#8d6278",
                              fontWeight: "bold",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!!productosEditados[producto.id]?.active}
                              onChange={(e) =>
                                setProductosEditados((prev) => ({
                                  ...prev,
                                  [producto.id]: {
                                    ...prev[producto.id],
                                    active: e.target.checked,
                                  },
                                }))
                              }
                            />
                            Activo
                          </label>

                          <button
                            onClick={() => guardarProducto(producto.id)}
                            style={{
                              border: "none",
                              background: "#e98ab3",
                              color: "white",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            Guardar producto
                          </button>

                          <button
                            onClick={() => eliminarProducto(producto.id, producto.name)}
                            style={{
                              border: "none",
                              background: "#94456b",
                              color: "white",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            Eliminar producto
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}

          {activeTab === "pedidos" ? (
            <div
              style={{
                marginTop: "24px",
                background: "#fff7fb",
                border: "1px solid #f4c5db",
                borderRadius: "22px",
                padding: "20px",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#c5578b" }}>Pedidos</h2>

              {pedidos.length === 0 ? (
                <p style={{ color: "#8d6278" }}>Todavía no hay pedidos.</p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
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
                            <div style={{ color: "#8d6278", marginTop: "6px" }}>
                              Usuaria: {obtenerUsername(pedido.user_id)}
                            </div>
                            <div style={{ color: "#8d6278", marginTop: "4px" }}>
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
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                marginTop: "14px",
                              }}
                            >
                              <button
                                onClick={() => cambiarEstadoPedido(pedido.id, "Pendiente")}
                                style={smallBtn("#f3a1c7")}
                              >
                                Pendiente
                              </button>
                              <button
                                onClick={() => cambiarEstadoPedido(pedido.id, "Verificando")}
                                style={smallBtn("#e98ab3")}
                              >
                                Verificando
                              </button>
                              <button
                                onClick={() =>
                                  cambiarEstadoPedido(
                                    pedido.id,
                                    "Esperando para tomar Orden"
                                  )
                                }
                                style={smallBtn("#d96c9d")}
                              >
                                Esperando para tomar Orden
                              </button>
                              <button
                                onClick={() =>
                                  cambiarEstadoPedido(pedido.id, "Preparacion")
                                }
                                style={smallBtn("#c5578b")}
                              >
                                Preparacion
                              </button>
                              <button
                                onClick={() =>
                                  cambiarEstadoPedido(
                                    pedido.id,
                                    "Entrega (El Vendedor ha enviado)"
                                  )
                                }
                                style={smallBtn("#b84d82")}
                              >
                                Entrega
                              </button>
                              <button
                                onClick={() =>
                                  cambiarEstadoPedido(pedido.id, "Cancelado")
                                }
                                style={smallBtn("#94456b")}
                              >
                                Cancelado
                              </button>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "12px",
                              }}
                            >
                              {!pedido.chat_closed ? (
                                <button
                                  onClick={() => cambiarEstadoChat(pedido.id, true)}
                                  style={smallBtn("#94456b")}
                                >
                                  Cerrar chat
                                </button>
                              ) : (
                                <button
                                  onClick={() => cambiarEstadoChat(pedido.id, false)}
                                  style={smallBtn("#4c9a69")}
                                >
                                  Reabrir chat
                                </button>
                              )}

                              <div
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: "12px",
                                  background: pedido.chat_closed
                                    ? "#fff1f1"
                                    : "#eefcf3",
                                  color: pedido.chat_closed ? "#c56b6b" : "#4c9a69",
                                  border: pedido.chat_closed
                                    ? "1px solid #efc6c6"
                                    : "1px solid #c9ebd3",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                }}
                              >
                                {pedido.chat_closed ? "Chat cerrado" : "Chat abierto"}
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: "16px",
                                display: "grid",
                                gap: "12px",
                              }}
                            >
                              <textarea
                                placeholder="Mensaje de entrega opcional: cuenta, contraseña, instrucciones, etc."
                                value={pedidosEditados[pedido.id]?.delivery_message ?? ""}
                                onChange={(e) =>
                                  setPedidosEditados((prev) => ({
                                    ...prev,
                                    [pedido.id]: {
                                      ...prev[pedido.id],
                                      delivery_message: e.target.value,
                                    },
                                  }))
                                }
                                rows={4}
                                style={textAreaStyle}
                              />

                              <textarea
                                placeholder="Comentario opcional para la clienta"
                                value={pedidosEditados[pedido.id]?.admin_comment ?? ""}
                                onChange={(e) =>
                                  setPedidosEditados((prev) => ({
                                    ...prev,
                                    [pedido.id]: {
                                      ...prev[pedido.id],
                                      admin_comment: e.target.value,
                                    },
                                  }))
                                }
                                rows={3}
                                style={textAreaStyle}
                              />

                              <div>
                                <button
                                  onClick={() => guardarDetallePedido(pedido.id)}
                                  style={smallBtn("#e98ab3")}
                                >
                                  Guardar info del pedido
                                </button>
                              </div>
                            </div>

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
                                        {msg.sender_role === "admin"
                                          ? "Admin"
                                          : obtenerUsername(msg.user_id)}{" "}
                                        · {formatDate(msg.created_at)}
                                      </div>
                                      <div
                                        style={{
                                          color: "#7c4a65",
                                          whiteSpace: "pre-wrap",
                                        }}
                                      >
                                        {msg.message}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div
                                style={{
                                  marginTop: "12px",
                                  display: "grid",
                                  gap: "10px",
                                }}
                              >
                                <textarea
                                  rows={3}
                                  placeholder={
                                    pedido.chat_closed
                                      ? "Este chat está cerrado."
                                      : "Escribe un mensaje para esta orden..."
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
                                    ...textAreaStyle,
                                    background: pedido.chat_closed
                                      ? "#f7f2f5"
                                      : "white",
                                  }}
                                />

                                <button
                                  onClick={() => enviarMensaje(pedido.id)}
                                  disabled={pedido.chat_closed}
                                  style={{
                                    ...smallBtn(
                                      pedido.chat_closed ? "#d8c5cf" : "#e98ab3"
                                    ),
                                    cursor: pedido.chat_closed
                                      ? "not-allowed"
                                      : "pointer",
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
          ) : null}
        </div>
      </div>
    </main>
  );
}

function smallBtn(background) {
  return {
    border: "none",
    background,
    color: "white",
    borderRadius: "12px",
    padding: "10px 12px",
    fontWeight: "bold",
    cursor: "pointer",
  };
}

const textAreaStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #f4c5db",
  fontSize: "15px",
  resize: "vertical",
  boxSizing: "border-box",
};