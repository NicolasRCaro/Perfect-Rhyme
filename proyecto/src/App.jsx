import React, { useState } from "react";

export default function App() {
  const [palabra, setPalabra] = useState("");
  const [idioma, setIdioma] = useState("es");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [rimas, setRimas] = useState([]);
  const [oraciones, setOraciones] = useState([]);
  const [versosRap, setVersosRap] = useState([]);
  const [cargando, setCargando] = useState(false);

  const handleBuscar = async () => {
    if (!palabra.trim()) {
      setRimas([]);
      setOraciones([]);
      setVersosRap([]);
      return;
    }

    setCargando(true);

    try {
      if (idioma === "en") {
        const endpoint = new URL("https://api.datamuse.com/words");
        endpoint.searchParams.set("rel_rhy", palabra.toLowerCase());
        endpoint.searchParams.set("max", "10");

        const res = await fetch(endpoint.toString());
        const data = await res.json();
        const listaRimas = data.map((item) => item.word);

        setRimas(listaRimas);
        generarOracionesIngles(palabra, listaRimas);
        setVersosRap([]); // reset versos rap
      } else {
        const localDic = [
          "casa","tasa","masa","pasa","abraza","raza","basa","gasa","brasa","asa",
          "cancion","emocion","pasion","corazon","ilusion","razon","nacion","vision","mision","ocasion",
          "camino","destino","vecino","vino","divino","fino","marino","latino","cristalino","argentino",
          "amor","dolor","color","calor","temor","rumor","clamor","ardor","vigor","valor",
          "vida","herida","salida","comida","perdida","medida","caida","subida","movida","extendida",
          "luz","cruz","azul","baul","salud","virtud","actitud","juventud","multitud","inquietud",
          "mente","puente","presente","ausente","diferente","inteligente","valiente","potente","urgente",
          "mar","amar","soñar","cantar","bailar","volar","llorar","pensar","crear","mirar",
          "sol","farol","control","rol","alcohol","caracol","español","girasol","portal","señal",
          "libro","tibio","sabio","labio","previo","obvio","propio","odio","medio","remedio",
          "flor","motor","doctor","actor","factor","sector","protector","director","inspector"
        ];

        const norm = (t) =>
          t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const base = norm(palabra);
        const terminacion = base.slice(-3);

        const resultados = localDic.filter((p) => {
          const pNorm = norm(p);
          return pNorm !== base && pNorm.endsWith(terminacion);
        });

        setRimas(resultados);
        setOraciones([]);
        setVersosRap([]);
      }
    } catch (err) {
      console.error(err);
      setRimas([]);
      setOraciones([]);
      setVersosRap([]);
    } finally {
      setCargando(false);
    }
  };

  const generarOracionesIngles = (baseWord, listaRimas) => {
    if (!listaRimas.length) return;
    const frases = listaRimas.slice(0, 3).map((rima) => {
      return `I feel the ${baseWord}, it shines so ${rima}.`;
    });
    setOraciones(frases);
  };

  // 🔥 Genera versos estilo rap
  const generarVersosRap = () => {
    if (!palabra || !rimas.length) return;

    const versos = rimas.slice(0, 5).map((rima) => {
      const inicio = [
        `Yo, I got the ${palabra}`,
        `Check the ${palabra}`,
        `Listen, ${palabra} in the house`,
        `Dropping ${palabra} like a beat`
      ];
      const fin = [
        `feels so ${rima}`,
        `making rhymes with ${rima}`,
        `on the streets like ${rima}`,
        `flowing smooth with ${rima}`
      ];

      const linea =
        inicio[Math.floor(Math.random() * inicio.length)] +
        ", " +
        fin[Math.floor(Math.random() * fin.length)] +
        "!";
      return linea;
    });

    setVersosRap((prev) => [...prev, ...versos]);
  };

  const styles = getStyles(modoOscuro);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Perfect Rhyme</h1>

        <input
          type="text"
          placeholder={idioma === "es" ? "Escribe una palabra..." : "Type a word..."}
          value={palabra}
          onChange={(e) => setPalabra(e.target.value)}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
        />

        <div style={styles.row}>
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            style={styles.select}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <button onClick={handleBuscar} style={styles.button}>
          {idioma === "es" ? "Buscar Rimas" : "Find Rhymes"}
        </button>

        <button
          onClick={() => setModoOscuro(!modoOscuro)}
          style={styles.toggle}
        >
          {modoOscuro
            ? idioma === "es" ? "Modo Claro" : "Light Mode"
            : idioma === "es" ? "Modo Oscuro" : "Dark Mode"}
        </button>

        <div style={styles.resultados}>
          {cargando ? (
            <p style={styles.noResult}>
              {idioma === "es" ? "Cargando..." : "Loading..."}
            </p>
          ) : (
            <>
              {rimas.map((r, i) => (
                <div key={i} style={styles.rima}>{r}</div>
              ))}

              {idioma === "en" && oraciones.length > 0 && (
                <div style={styles.sentencesBox}>
                  <h3>Suggested Sentences:</h3>
                  {oraciones.map((o, i) => (
                    <p key={i} style={styles.sentence}>{o}</p>
                  ))}
                </div>
              )}

              {idioma === "en" && rimas.length > 0 && (
                <button onClick={generarVersosRap} style={styles.rapButton}>
                  Generate More Lines
                </button>
              )}

              {versosRap.length > 0 && (
                <div style={styles.sentencesBox}>
                  <h3>Rap Lines:</h3>
                  {versosRap.map((v, i) => (
                    <p key={i} style={styles.sentence}>{v}</p>
                  ))}
                </div>
              )}

              {!rimas.length && palabra && (
                <p style={styles.noResult}>
                  {idioma === "es" ? "No se encontraron rimas" : "No rhymes found"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getStyles(modoOscuro) {
  return {
    container: {
      minHeight: "100vh",
      background: modoOscuro
        ? "linear-gradient(135deg,#1e1e2f,#121212)"
        : "linear-gradient(135deg,#667eea,#764ba2)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif"
    },
    card: {
      backgroundColor: modoOscuro ? "#1f1f1f" : "white",
      color: modoOscuro ? "white" : "#333",
      padding: "30px",
      borderRadius: "15px",
      width: "400px",
      textAlign: "center"
    },
    title: { marginBottom: "15px" },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      marginBottom: "10px"
    },
    row: {
      marginBottom: "10px"
    },
    select: {
      width: "100%",
      padding: "8px",
      borderRadius: "8px",
      border: "none"
    },
    button: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#667eea",
      color: "white",
      marginBottom: "8px",
      cursor: "pointer"
    },
    toggle: {
      width: "100%",
      padding: "8px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: modoOscuro ? "#444" : "#ddd",
      cursor: "pointer",
      marginBottom: "12px"
    },
    resultados: { marginTop: "10px" },
    rima: {
      padding: "8px",
      borderRadius: "6px",
      margin: "4px 0",
      backgroundColor: modoOscuro ? "#333" : "#f3f4f6"
    },
    sentencesBox: {
      marginTop: "15px",
      padding: "10px",
      backgroundColor: modoOscuro ? "#2a2a2a" : "#eef1ff",
      borderRadius: "8px"
    },
    sentence: {
      fontSize: "14px",
      margin: "5px 0"
    },
    rapButton: {
      padding: "10px",
      marginTop: "10px",
      borderRadius: "8px",
      backgroundColor: "#ff4d4f",
      color: "#fff",
      border: "none",
      cursor: "pointer"
    },
    noResult: { opacity: 0.7 }
  };
}