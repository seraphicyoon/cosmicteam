import "./globals.css";

export const metadata = {
  title: "COSMICTEAM",
  description: "Tienda de servicios digitales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}