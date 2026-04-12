"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [perfil, setPerfil] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
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
  });

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
        };
      });
      setProductosEditados(productosIniciales);

      setCargando(false);
    };

    cargarTodo();
  }, []);

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

    if (!name) {
      setMensaje("Escribe el nombre del producto.");
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

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price,
          stock,
          active: nuevoProducto.active,
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
      },
    }));

    setNuevoProducto({
      name: "",
      description: "",
      price: "",
      stock: "",
      active: true,
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
      })
      .eq("id", productoId);

    if (error) {
      setMensaje("No se pudo guardar el producto.");
      return;
    }

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId
          ? {
              ...p,
              name,
              description,
              price,
              stock,
              active,
            }
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
                Desde aquí puedes editar saldo, pedidos y productos completos.
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
                placeholder="Precio"
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

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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
                {pedidos.map((pedido) => (
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
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "20px" }}>
                          {pedido.product_name}
                        </div>
                        <div style={{ color: "#8d6278", marginTop: "6px" }}>
                          Usuaria: {obtenerUsername(pedido.user_id)}
                        </div>
                        <div style={{ color: "#8d6278", marginTop: "4px" }}>
                          Precio: {pedido.price} créditos
                        </div>
                        <div style={{ color: "#8d6278", marginTop: "4px" }}>
                          Estado: {pedido.status}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, "Pendiente")}
                          style={{
                            border: "none",
                            background: "#f3a1c7",
                            color: "white",
                            borderRadius: "12px",
                            padding: "10px 12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Pendiente
                        </button>

                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, "Verificando")}
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
                          Verificando
                        </button>

                        <button
                          onClick={() =>
                            cambiarEstadoPedido(pedido.id, "Esperando para tomar Orden")
                          }
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
                          Esperando para tomar Orden
                        </button>

                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, "Preparacion")}
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
                          Preparacion
                        </button>

                        <button
                          onClick={() =>
                            cambiarEstadoPedido(
                              pedido.id,
                              "Entrega (El Vendedor ha enviado)"
                            )
                          }
                          style={{
                            border: "none",
                            background: "#b84d82",
                            color: "white",
                            borderRadius: "12px",
                            padding: "10px 12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Entrega
                        </button>

                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, "Cancelado")}
                          style={{
                            border: "none",
                            background: "#94456b",
                            color: "white",
                            borderRadius: "12px",
                            padding: "10px 12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Cancelado
                        </button>
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
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #f4c5db",
                          fontSize: "15px",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
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
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #f4c5db",
                          fontSize: "15px",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />

                      <div>
                        <button
                          onClick={() => guardarDetallePedido(pedido.id)}
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
                          Guardar info del pedido
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                        placeholder="Precio"
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
                        onClick={() =>
                          eliminarProducto(producto.id, producto.name)
                        }
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
        </div>
      </div>
    </main>
  );
}