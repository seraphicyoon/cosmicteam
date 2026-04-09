export default function Home() {
  const servicios = [
    { nombre: "Canva Mes", precio: "20 Pesos", info: "Via Invitacion" },
    { nombre: "Canva 1 Año", precio: "50 Pesos", info: "Via Invitacion" },
    { nombre: "Canva Permanente", precio: "100 Pesos", info: "Via Invitacion" },
    { nombre: "Capcut Mes", precio: "40 Pesos", info: "Correo + Contraseña" },
    { nombre: "Capcut Anual", precio: "350 Pesos", info: "Correo + Contraseña" },
    { nombre: "Adobe Creative", precio: "80 Pesos", info: "Correo + Contraseña" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #2a0000 0%, #120000 35%, #000000 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid rgba(255,0,0,0.25)",
            borderRadius: "20px",
            padding: "20px 24px",
            background: "rgba(20,0,0,0.7)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#ff3b3b",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Tienda digital
            </div>
            <h1 style={{ margin: 0, fontSize: "38px", color: "#ff2a2a" }}>
              COSMICTEAM
            </h1>
            <p style={{ marginTop: "10px", color: "#d1d5db" }}>
              Servicios digitales, recargas y compras por créditos.
            </p>
          </div>

          <div
            style={{
              background: "#140000",
              border: "1px solid rgba(255,0,0,0.25)",
              borderRadius: "16px",
              padding: "14px 18px",
              minWidth: "180px",
              textAlign: "right",
            }}
          >
            <div style={{ color: "#bbb", fontSize: "13px" }}>Saldo</div>
            <div style={{ color: "#ff2a2a", fontSize: "30px", fontWeight: "bold" }}>
              0 créditos
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "18px 22px",
            background: "rgba(10,10,10,0.55)",
          }}
        >
          <p style={{ margin: 0, color: "#e5e7eb" }}>
            Bienvenido a <strong>COSMICTEAM</strong>. Aquí podrás comprar servicios
            y recargar saldo por transferencia.
          </p>
          <p style={{ marginTop: "8px", color: "#ff6b6b", fontWeight: "bold" }}>
            1 crédito = 1 peso
          </p>
        </div>

        <div style={{ marginTop: "34px" }}>
          <h2 style={{ fontSize: "32px", marginBottom: "18px" }}>
            Servicios disponibles
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {servicios.map((servicio) => (
              <div
                key={servicio.nombre}
                style={{
                  background: "rgba(15,15,15,0.95)",
                  border: "1px solid rgba(255,0,0,0.28)",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    height: "170px",
                    background:
                      "linear-gradient(135deg, #020617 0%, #111827 35%, #7f1d1d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: "#ffffff",
                  }}
                >
                  {servicio.nombre}
                </div>

                <div style={{ padding: "18px" }}>
                  <h3 style={{ margin: 0, fontSize: "24px" }}>{servicio.nombre}</h3>
                  <p style={{ color: "#d1d5db", marginTop: "10px" }}>{servicio.info}</p>
                  <p
                    style={{
                      color: "#ff2a2a",
                      fontWeight: "bold",
                      fontSize: "28px",
                      marginTop: "14px",
                    }}
                  >
                    {servicio.precio}
                  </p>

                  <button
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      background: "#e10600",
                      color: "white",
                      border: "none",
                      borderRadius: "14px",
                      padding: "13px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}