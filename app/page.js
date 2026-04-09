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
              minWidth: "180px",
              textAlign: "right",
              boxShadow: "0 6px 18px rgba(244, 182, 210, 0.18)",
            }}
          >
            <div style={{ color: "#9f7389", fontSize: "13px" }}>Saldo</div>
            <div
              style={{
                color: "#d55d95",
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              0 créditos
            </div>
          </div>
        </div>

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
            Bienvenida a <strong>COSMICTEAM</strong>. Aquí podrás comprar tus
            servicios y recargar saldo por transferencia.
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
          <h2
            style={{
              fontSize: "32px",
              marginBottom: "18px",
              color: "#c95c93",
            }}
          >
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
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: "#c95c93",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  {servicio.nombre}
                </div>

                <div style={{ padding: "18px" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "24px",
                      color: "#a84d7c",
                    }}
                  >
                    {servicio.nombre}
                  </h3>

                  <p style={{ color: "#8b5d75", marginTop: "10px" }}>
                    {servicio.info}
                  </p>

                  <p
                    style={{
                      color: "#d55d95",
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
                      background: "linear-gradient(90deg, #f59ac2 0%, #e97fb0 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "16px",
                      padding: "13px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(233, 127, 176, 0.28)",
                    }}
                  >
                    Comprar
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