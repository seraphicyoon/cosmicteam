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