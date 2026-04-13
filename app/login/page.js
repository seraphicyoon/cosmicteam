"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async () => {
    setMensaje("");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", usuario)
      .single();

    if (error || !data) {
      setMensaje("Usuario no encontrado.");
      return;
    }

    if (data.password !== password) {
      setMensaje("Contraseña incorrecta.");
      return;
    }

    localStorage.setItem("user_id", data.id);

    if (data.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/cuenta";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff8fc 0%, #ffeef7 45%, #fffaf3 100%)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #efb4d2 0%, #f5c4dd 100%)",
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "22px",
            boxShadow: "0 12px 28px rgba(233,145,184,0.20)",
            border: "1px solid #f2bcd6",
          }}
        >
          <h1
            style={{
              color: "#b84d82",
              margin: 0,
              fontSize: "26px",
              fontWeight: "bold",
            }}
          >
            COSMICTEAM 💖
          </h1>

          <p
            style={{
              color: "#8d6278",
              marginTop: "12px",
              marginBottom: "18px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Precios más baratos que el mercado 🚀
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid #f4c5db",
                boxShadow: "0 8px 20px rgba(233,145,184,0.10)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "#c5578b",
                  fontSize: "22px",
                }}
              >
                ChatGPT Pro
              </div>
              <div style={{ fontSize: "15px", color: "#8d6278", marginTop: "4px" }}>
                Precio real: ~350 MXN
              </div>
              <div
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  color: "#4c9a69",
                  fontSize: "17px",
                }}
              >
                Tu precio: 60 MXN 💸
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid #f4c5db",
                boxShadow: "0 8px 20px rgba(233,145,184,0.10)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "#c5578b",
                  fontSize: "22px",
                }}
              >
                Canva Pro (1 año)
              </div>
              <div style={{ fontSize: "15px", color: "#8d6278", marginTop: "4px" }}>
                Precio real: ~2000 MXN
              </div>
              <div
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  color: "#4c9a69",
                  fontSize: "17px",
                }}
              >
                Tu precio: 50 MXN 💸
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid #f4c5db",
                boxShadow: "0 8px 20px rgba(233,145,184,0.10)",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "#c5578b",
                  fontSize: "22px",
                }}
              >
                CapCut Pro (1 mes)
              </div>
              <div style={{ fontSize: "15px", color: "#8d6278", marginTop: "4px" }}>
                Precio real: ~170 MXN
              </div>
              <div
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  color: "#4c9a69",
                  fontSize: "17px",
                }}
              >
                Tu precio: 40 MXN 💸
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.55)",
              border: "1px solid #f4c5db",
              color: "#9a5f7d",
              fontWeight: "bold",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            Y mucho más... ✨
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#c5578b",
                fontSize: "32px",
              }}
            >
              ¿Por qué elegirnos?
            </h2>
            <p
              style={{
                marginTop: "10px",
                color: "#8d6278",
                fontSize: "16px",
              }}
            >
              Todo pensado para que compres fácil, rápido y con confianza.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
            }}
          >
            <div
              style={{
                minHeight: "220px",
                borderRadius: "24px",
                padding: "24px",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,241,247,0.96) 100%)",
                border: "1px solid #f2bfd6",
                boxShadow: "0 14px 28px rgba(233,145,184,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "-30px",
                  top: "-30px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "999px",
                  background: "rgba(233,138,179,0.12)",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  💬
                </div>
                <div
                  style={{
                    color: "#b84d82",
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Soporte rápido
                </div>
                <div
                  style={{
                    color: "#7f5b70",
                    lineHeight: 1.7,
                    fontSize: "16px",
                  }}
                >
                  Si tienes dudas o algún detalle con tu pedido, puedes hablar
                  directo por el chat del pedido y recibir atención más rápida.
                </div>
              </div>
            </div>

            <div
              style={{
                minHeight: "220px",
                borderRadius: "24px",
                padding: "24px",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,241,247,0.96) 100%)",
                border: "1px solid #f2bfd6",
                boxShadow: "0 14px 28px rgba(233,145,184,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "-30px",
                  bottom: "-30px",
                  width: "140px",
                  height: "140px",
                  borderRadius: "999px",
                  background: "rgba(196,87,139,0.10)",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  ⚡
                </div>
                <div
                  style={{
                    color: "#b84d82",
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Entrega sencilla
                </div>
                <div
                  style={{
                    color: "#7f5b70",
                    lineHeight: 1.7,
                    fontSize: "16px",
                  }}
                >
                  Tus instrucciones, accesos o mensajes importantes se entregan
                  dentro del pedido para que todo quede más ordenado y claro.
                </div>
              </div>
            </div>

            <div
              style={{
                minHeight: "220px",
                borderRadius: "24px",
                padding: "24px",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,241,247,0.96) 100%)",
                border: "1px solid #f2bfd6",
                boxShadow: "0 14px 28px rgba(233,145,184,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-35px",
                  top: "-35px",
                  width: "130px",
                  height: "130px",
                  borderRadius: "999px",
                  background: "rgba(76,154,105,0.10)",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  💸
                </div>
                <div
                  style={{
                    color: "#b84d82",
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Precios accesibles
                </div>
                <div
                  style={{
                    color: "#7f5b70",
                    lineHeight: 1.7,
                    fontSize: "16px",
                  }}
                >
                  Puedes conseguir servicios muy por debajo del precio normal,
                  sin complicarte y desde una sola cuenta.
                </div>
              </div>
            </div>

            <div
              style={{
                minHeight: "220px",
                borderRadius: "24px",
                padding: "24px",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,241,247,0.96) 100%)",
                border: "1px solid #f2bfd6",
                boxShadow: "0 14px 28px rgba(233,145,184,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "-20px",
                  top: "30px",
                  width: "110px",
                  height: "110px",
                  borderRadius: "24px",
                  transform: "rotate(20deg)",
                  background: "rgba(184,77,130,0.08)",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  📋
                </div>
                <div
                  style={{
                    color: "#b84d82",
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  Todo más ordenado
                </div>
                <div
                  style={{
                    color: "#7f5b70",
                    lineHeight: 1.7,
                    fontSize: "16px",
                  }}
                >
                  Revisa saldo, pedidos, estado, mensajes y entregas desde un
                  mismo lugar, sin andar buscando todo por separado.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "430px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.95)",
            borderRadius: "24px",
            padding: "30px",
            border: "1px solid #f4c5db",
            boxShadow: "0 14px 30px rgba(233,145,184,0.14)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#c5578b",
              margin: 0,
              fontSize: "24px",
            }}
          >
            COSMICTEAM
          </h2>

          <div
            style={{
              display: "flex",
              marginTop: "20px",
              marginBottom: "18px",
              background: "#f7edf2",
              borderRadius: "14px",
              padding: "4px",
            }}
          >
            <button
              onClick={() => setModo("login")}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                background: modo === "login" ? "#e98ab3" : "transparent",
                color: modo === "login" ? "white" : "#7f5b70",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => setModo("register")}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                background: modo === "register" ? "#e98ab3" : "transparent",
                color: modo === "register" ? "white" : "#7f5b70",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Registrarse
            </button>
          </div>

          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #f4c5db",
              marginBottom: "10px",
              boxSizing: "border-box",
              fontSize: "15px",
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #f4c5db",
              marginBottom: "14px",
              boxSizing: "border-box",
              fontSize: "15px",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(90deg, #eb93bb 0%, #de78a8 100%)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Entrar a mi cuenta
          </button>

          {mensaje ? (
            <p
              style={{
                marginTop: "12px",
                color: "#c5578b",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {mensaje}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}