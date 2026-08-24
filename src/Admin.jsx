import React, { useState } from "react";
import { supabase } from "./supabase";

export default function Admin() {
  const [result, setResult] = useState("");
  const [testing, setTesting] = useState(false);

  async function testSupabase() {
    setTesting(true);
    setResult("Testing Supabase connection...");

    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const publishableKey =
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const anonKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY;

      let output = "";

      output += "=== ENVIRONMENT TEST ===\n\n";

      output += `Supabase URL:
${url || "MISSING"}

`;

      output += `Publishable key:
${publishableKey ? "LOADED" : "MISSING"}

`;

      output += `Anon key:
${anonKey ? "LOADED" : "MISSING"}

`;

      output += "=== SUPABASE CLIENT TEST ===\n\n";

      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (error) {
        output += `Auth error:
${JSON.stringify(error, null, 2)}

`;
      } else {
        output += `Auth connection:
SUCCESS

`;

        output += `Session:
${data?.session ? "Logged in" : "No active session"}

`;
      }

      output += "=== DATABASE TEST ===\n\n";

      const {
        data: dbData,
        error: dbError,
      } = await supabase
        .from("site_content")
        .select("id, updated_at")
        .eq("id", "main")
        .maybeSingle();

      if (dbError) {
        output += `Database error:
${JSON.stringify(dbError, null, 2)}

`;
      } else {
        output += `Database connection:
SUCCESS

`;

        output += `Row found:
${dbData ? "YES" : "NO"}

`;

        if (dbData) {
          output += `Updated:
${dbData.updated_at}

`;
        }
      }

      output += "=== RESULT ===\n\n";

      if (
        !url ||
        (!publishableKey && !anonKey)
      ) {
        output +=
          "❌ Vercel environment variables are missing.";
      } else if (
        dbError &&
        dbError.message === "Failed to fetch"
      ) {
        output +=
          "❌ Browser cannot reach Supabase.";
      } else if (dbError) {
        output +=
          "⚠️ Supabase is reachable, but the database request failed.";
      } else {
        output +=
          "✅ Supabase connection is working.";
      }

      setResult(output);
    } catch (error) {
      setResult(
        `❌ JAVASCRIPT ERROR

${error?.stack || error?.message || error}`
      );
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06101b",
        color: "#fff",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1>Supabase Connection Test</h1>

        <p>
          This page is checking the connection between
          your Vercel website and Supabase.
        </p>

        <button
          onClick={testSupabase}
          disabled={testing}
          style={{
            padding: "14px 22px",
            border: "0",
            borderRadius: "8px",
            background: "#37c878",
            color: "#06101b",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {testing
            ? "Testing..."
            : "Test Supabase Connection"}
        </button>

        <pre
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "#0d1925",
            border: "1px solid #243442",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: "1.6",
          }}
        >
          {result ||
            "Click the button above to start the test."}
        </pre>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            marginTop: "20px",
            padding: "10px 16px",
            background: "transparent",
            color: "#fff",
            border: "1px solid #53606d",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back to Website
        </button>
      </div>
    </div>
  );
}
