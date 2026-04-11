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
  const [stocksEditados, setStocksEditados] = useState({});
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

      setPedidos(listaPedidos || []);

      const { data: listaProductos } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      const productosFinal = listaProductos || [];
      setProductos(productosFinal);

      const stocksIniciales = {};
      productosFinal.forEach((p) => {
        stocksIniciales[p.id] = p.stock ?? 0;
      });
      setStocksEditados(stocksIniciales);

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

  const guardarStock = async (productoId) => {
    setMensaje("");

    const nuevoStock = Number(stocksEditados[productoId]);

    if (isNaN(nuevoStock) || nuevoStock < 0) {
      setMensaje("El stock debe ser un número válido mayor o igual a 0.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ stock: nuevoStock })
      .eq("id", productoId);

    if (error) {
      setMensaje("No se pudo actualizar el stock.");
      return;
    }

    setProductos((prev) =>
      prev.map((producto) =>
        producto.id === productoId ? { ...producto, stock: nuevoStock } : producto
      )
    );

    setMensaje("Stock actualizado correctamente 💖");
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
    setStocksEditados((prev) => ({
      ...prev,
      [data.id]: data.stock ?? 0,
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

  const cambiarActivo = async (productoId, valorActual) => {
    setMensaje("");

    const nuevoValor = !valorActual;

    const { error } = await supabase
      .from("products")
      .update({ active: nuevoValor })
      .eq("id", productoId);

    if (error) {
      setMensaje("No se pudo cambiar el estado del producto.");
      return;
    }

    setProductos((prev) =>
      prev.map((producto) =>
        producto.id === productoId ? { ...producto, active: nuevoValor } : producto
      )
    );

    setMensaje("Estado del producto actualizado 💖");
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
                Desde aquí puedes editar saldo, pedidos, stock y crear productos.
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
                        onClick={() => cambiarEstadoPedido(pedido.id, "pendiente")}
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
                        onClick={() => cambiarEstadoPedido(pedido.id, "entregado")}
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
                        Entregado
                      </button>

                      <button
                        onClick={() => cambiarEstadoPedido(pedido.id, "cancelado")}
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
                        Cancelado
                      </button>
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
            <h2 style={{ marginTop: 0, color: "#c5578b" }}>Productos y stock</h2>

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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", color: "#c5578b", fontSize: "20px" }}>
                        {producto.name}
                      </div>
                      <div style={{ color: "#8d6278", marginTop: "6px" }}>
                        Precio: {producto.price} créditos
                      </div>
                      <div style={{ color: "#8d6278", marginTop: "4px" }}>
                        Stock actual: {producto.stock ?? 0}
                      </div>
                      <div style={{ color: "#8d6278", marginTop: "4px" }}>
                        Estado: {producto.active ? "Activo" : "Oculto"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <input
                        type="number"
                        min="0"
                        value={stocksEditados[producto.id] ?? 0}
                        onChange={(e) =>
                          setStocksEditados((prev) => ({
                            ...prev,
                            [producto.id]: e.target.value,
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
                        onClick={() => guardarStock(producto.id)}
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
                        Guardar stock
                      </button>

                      <button
                        onClick={() => cambiarActivo(producto.id, producto.active)}
                        style={{
                          border: "1px solid #f4c5db",
                          background: "#fff",
                          color: "#9a6b82",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {producto.active ? "Ocultar" : "Activar"}
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