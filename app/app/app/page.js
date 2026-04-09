export default function Home() {
  const servicios = [
    { nombre: "Netflix Perfil", precio: "80 pesos" },
    { nombre: "Spotify a cuenta propia el mes", precio: "65 pesos" },
    { nombre: "Disney+ Perfil", precio: "65 pesos" },
    { nombre: "Canva Pro 1 Mes", precio: "20 pesos" },
    { nombre: "Canva Pro 1 Año", precio: "50 pesos" },
    { nombre: "Capcut 1 Mes", precio: "40 pesos" },
    { nombre: "Capcut Anual", precio: "350 pesos" },
  ];

  return (
    <main style={{ background: "black", color: "white", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ fontSize: "32px", color: "red" }}>COSMICTEAM</h1>
      <p>1 crédito = 1 peso</p>

      <h2 style={{ marginTop: "30px" }}>Servicios</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {servicios.map((s) => (
          <div key={s.nombre} style={{ border: "1px solid red", padding: "15px", borderRadius: "10px" }}>
            <h3>{s.nombre}</h3>
            <p>{s.precio}</p>
            <button style={{ background: "red", color: "white", padding: "10px", border: "none" }}>
              Comprar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}