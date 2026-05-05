import { useState, useRef } from "react";

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama3-70b-8192";

const PLANS = [
  { id: "monthly", label: "Mensal", price: "99 MZN", sub: "/mês", popular: false },
  { id: "quarterly", label: "Trimestral", price: "160 MZN", sub: "/3 meses", popular: true },
];

const PAYMENT_METHODS = [
  { id: "mpesa", name: "M-Pesa", number: "852067655", color: "#E31837", icon: "📱" },
  { id: "emola", name: "e-Mola", number: "869740698", color: "#F7941D", icon: "💳" },
];

const SAMPLE_QUESTIONS = [
  { id: 1, topic: "Álgebra", q: "Resolva: 3x² - 12x + 9 = 0", difficulty: "Médio" },
  { id: 2, topic: "Cinemática", q: "Um carro parte do repouso com aceleração de 4 m/s². Qual a velocidade após 5 s?", difficulty: "Fácil" },
  { id: 3, topic: "Geometria", q: "Calcule a área de um triângulo com base 8 cm e altura 5 cm.", difficulty: "Fácil" },
  { id: 4, topic: "Dinâmica", q: "Uma força de 20 N age sobre um corpo de 4 kg. Calcule a aceleração.", difficulty: "Médio" },
  { id: 5, topic: "Trigonometria", q: "Se sen(θ) = 0.6, calcule cos(θ) e tan(θ).", difficulty: "Difícil" },
];

const RANKING = [
  { pos: 1, name: "Amina Salimo", score: 980, solved: 47 },
  { pos: 2, name: "Carlos Machava", score: 865, solved: 41 },
  { pos: 3, name: "Fátima Nhantumbo", score: 812, solved: 38 },
  { pos: 4, name: "João Mondlane", score: 740, solved: 35 },
  { pos: 5, name: "Sofia Bila", score: 695, solved: 31 },
  { pos: 6, name: "Tiago Cossa", score: 620, solved: 28 },
];

async function solveWithGroq(problem, topic) {
  const prompt = `És um professor de matemática e física para estudantes do ensino secundário de Moçambique.
Resolve este problema passo a passo de forma didática e clara em português.
Responde APENAS em JSON válido, sem texto extra:
{
  "titulo": "nome do tipo de problema",
  "topico": "área (ex: Álgebra, Cinemática)",
  "passos": [
    {"numero": 1, "titulo": "nome do passo", "conteudo": "explicação detalhada", "formula": "fórmula se existir"}
  ],
  "resposta_final": "resposta concisa e clara",
  "dica": "dica motivacional para o aluno",
  "pontos": 10
}
Problema${topic ? ` de ${topic}` : ""}: ${problem}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { titulo: "Resolução", topico: topic || "Matemática", passos: [{ numero: 1, titulo: "Solução", conteudo: text, formula: "" }], resposta_final: "Ver solução acima", dica: "Continue a estudar! 💪", pontos: 5 };
  }
}

async function generateQuestion(topic) {
  const prompt = `Cria uma pergunta de ${topic} para estudantes do ensino secundário de Moçambique.
Responde APENAS em JSON válido sem texto extra:
{
  "pergunta": "texto da pergunta",
  "opcoes": ["A) opção1", "B) opção2", "C) opção3", "D) opção4"],
  "correta": "A",
  "explicacao": "explicação clara da resposta correcta"
}`;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 600 }),
  });
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { return null; }
}

const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    camera: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trophy: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="8 21 12 17 16 21"/><path d="M12 17V9"/><path d="M3 3h3v5a6 6 0 0 0 12 0V3h3"/></svg>,
    book: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    history: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5V16h4"/></svg>,
    home: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    star: <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    copy: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    close: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    send: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    lock: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    flash: <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    share: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  };
  return icons[name] || null;
};

const S = {
  app: { fontFamily: "'Nunito', sans-serif", maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0A0E1A", position: "relative", display: "flex", flexDirection: "column" },
  screen: { flex: 1, overflowY: "auto", paddingBottom: 80, scrollbarWidth: "none" },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,14,26,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", zIndex: 100, backdropFilter: "blur(20px)", padding: "8px 0 12px" },
  navBtn: (a) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", background: "none", border: "none", cursor: "pointer", color: a ? "#FF6B00" : "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: a ? 700 : 400, transition: "all 0.2s" }),
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, margin: "12px 16px" },
  btnPrimary: { background: "linear-gradient(135deg,#FF6B00,#FF8C00)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", width: "100%", boxShadow: "0 4px 20px rgba(255,107,0,0.35)", transition: "all 0.2s" },
  btnGhost: { background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 8, borderRadius: 10 },
  input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 16px", color: "#fff", fontSize: 15, width: "100%", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" },
  label: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6, display: "block" },
  h1: { color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 },
  h2: { color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 },
  p: { color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, margin: 0 },
  badge: (color) => ({ background: color || "rgba(255,107,0,0.15)", color: color ? "#fff" : "#FF6B00", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }),
};

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 32 }}>
      <div style={{ width: 48, height: 48, border: "3px solid rgba(255,107,0,0.2)", borderTop: "3px solid #FF6B00", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ ...S.p, color: "#FF6B00", fontWeight: 600 }}>A resolver exercício...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function SolutionView({ result, onClose }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = result.passos?.map(p => `Passo ${p.numero}: ${p.titulo}\n${p.conteudo}`).join("\n\n") + `\n\nResposta: ${result.resposta_final}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: "ResolveMZ", text: `Exercício de ${result.topico}\nResposta: ${result.resposta_final}\n\nResolvido com ResolveMZ 🇲🇿` });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A0E1A", zIndex: 200, overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#1565C0 0%,#0D47A1 60%,#FF6B00 100%)", padding: "20px 20px 28px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onClose} style={S.btnGhost}><Icon name="close" size={22} color="#fff" /></button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCopy} style={S.btnGhost}>{copied ? <Icon name="check" size={20} color="#4CAF50" /> : <Icon name="copy" size={20} color="#fff" />}</button>
            <button onClick={handleShare} style={S.btnGhost}><Icon name="share" size={20} color="#fff" /></button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <span style={{ ...S.badge("rgba(255,255,255,0.2)"), color: "#fff", fontSize: 12 }}>{result.topico}</span>
          <h2 style={{ ...S.h2, marginTop: 8, fontSize: 22 }}>{result.titulo}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Icon name="star" size={14} color="#FFD700" />
            <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 700 }}>+{result.pontos || 10} pontos!</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 16px 100px" }}>
        <span style={S.label}>📝 Resolução passo a passo</span>
        {result.passos?.map((step, i) => (
          <div key={i} style={{ ...S.card, margin: "10px 0", borderLeft: "3px solid #FF6B00" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#FF6B00,#FF8C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{step.numero}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#FF6B00", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{step.titulo}</p>
                <p style={{ ...S.p, fontSize: 14, lineHeight: 1.7 }}>{step.conteudo}</p>
                {step.formula && <div style={{ marginTop: 10, background: "rgba(21,101,192,0.2)", border: "1px solid rgba(21,101,192,0.3)", borderRadius: 10, padding: "8px 12px", fontFamily: "monospace", fontSize: 15, color: "#90CAF9" }}>{step.formula}</div>}
              </div>
            </div>
          </div>
        ))}
        <div style={{ background: "linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,140,0,0.1))", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 18, padding: 20, margin: "16px 0", textAlign: "center" }}>
          <p style={{ color: "#FF8C00", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>✅ RESPOSTA FINAL</p>
          <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{result.resposta_final}</p>
        </div>
        {result.dica && <div style={{ background: "rgba(21,101,192,0.12)", border: "1px solid rgba(21,101,192,0.25)", borderRadius: 14, padding: 16 }}><p style={{ color: "#90CAF9", fontSize: 13, lineHeight: 1.6 }}>💡 <strong>Dica:</strong> {result.dica}</p></div>}
        <button onClick={onClose} style={{ ...S.btnPrimary, marginTop: 20 }}><Icon name="flash" size={18} color="#fff" />Resolver outro exercício</button>
      </div>
    </div>
  );
}

function HomeScreen({ user, isPremium, onSolve }) {
  const [problem, setProblem] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("text");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const topics = ["Álgebra", "Geometria", "Trigonometria", "Cálculo", "Cinemática", "Dinâmica", "Energia", "Óptica"];

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!problem.trim() && !imagePreview) { setError("Escreve um problema ou tira uma foto!"); return; }
    setError(""); setLoading(true);
    try {
      const res = await solveWithGroq(problem.trim() || "Exercício da imagem", topic);
      setResult(res); onSolve?.(res);
    } catch { setError("Erro ao resolver. Verifica a tua ligação à internet."); }
    setLoading(false);
  };

  if (result) return <SolutionView result={result} onClose={() => setResult(null)} />;

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#0D47A1 0%,#1565C0 50%,rgba(255,107,0,0.15) 100%)", padding: "28px 20px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Olá, {user?.name?.split(" ")[0] || "Estudante"} 👋</p>
            <h1 style={{ ...S.h1, fontSize: 28 }}>Resolve<span style={{ color: "#FF6B00" }}>MZ</span> 🇲🇿</h1>
          </div>
          <div style={{ background: isPremium ? "rgba(255,215,0,0.15)" : "rgba(255,107,0,0.15)", border: `1px solid ${isPremium ? "rgba(255,215,0,0.3)" : "rgba(255,107,0,0.3)"}`, borderRadius: 10, padding: "6px 12px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: isPremium ? "#FFD700" : "#FF6B00", margin: 0 }}>{isPremium ? "✨ PREMIUM" : "🆓 GRÁTIS"}</p>
          </div>
        </div>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.25)", borderRadius: 14, padding: 4, gap: 4 }}>
          {[{ id: "text", icon: "edit", label: "Escrever Problema" }, { id: "photo", icon: "camera", label: "Tirar Foto" }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", background: mode === m.id ? "#FF6B00" : "transparent", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}>
              <Icon name={m.icon} size={16} color="#fff" />{m.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {mode === "photo" && (
          <div style={{ marginBottom: 12 }}>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} style={{ display: "none" }} capture="environment" />
            {imagePreview ? (
              <div style={{ position: "relative" }}>
                <img src={imagePreview} alt="Exercício" style={{ width: "100%", borderRadius: 16, maxHeight: 220, objectFit: "cover", border: "2px solid rgba(255,107,0,0.3)" }} />
                <button onClick={() => setImagePreview(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}><Icon name="close" size={16} color="#fff" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", background: "rgba(255,107,0,0.08)", border: "2px dashed rgba(255,107,0,0.3)", borderRadius: 18, padding: 36, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#FF6B00,#FF8C00)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="camera" size={30} color="#fff" /></div>
                <p style={{ color: "#FF6B00", fontWeight: 700, fontSize: 16, margin: 0 }}>Fotografar exercício</p>
                <p style={{ ...S.p, fontSize: 12 }}>Toca para abrir a câmera ou galeria</p>
              </button>
            )}
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <span style={S.label}>{mode === "photo" ? "Detalhe adicional (opcional)" : "Escreve o problema"}</span>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder={mode === "photo" ? "Ex: É sobre equações do 2º grau..." : "Ex: Resolva a equação 2x² - 8x + 6 = 0..."} rows={mode === "photo" ? 2 : 4} style={S.input} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={S.label}>Tema (opcional)</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {topics.map(t => (
              <button key={t} onClick={() => setTopic(topic === t ? "" : t)} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${topic === t ? "#FF6B00" : "rgba(255,255,255,0.1)"}`, background: topic === t ? "rgba(255,107,0,0.15)" : "transparent", color: topic === t ? "#FF6B00" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{t}</button>
            ))}
          </div>
        </div>
        {error && <p style={{ color: "#EF5350", fontSize: 13, marginBottom: 12, textAlign: "center" }}>⚠️ {error}</p>}
        <button onClick={handleSolve} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? "A resolver..." : <><Icon name="flash" size={18} color="#fff" />Resolver Agora</>}
        </button>
        {loading && <Spinner />}
      </div>
      <div style={{ padding: "20px 16px 0" }}>
        <p style={{ ...S.label, marginBottom: 12 }}>⚡ Exemplos rápidos</p>
        {SAMPLE_QUESTIONS.map(q => (
          <button key={q.id} onClick={() => { setProblem(q.q); setTopic(q.topic); setMode("text"); }} style={{ ...S.card, margin: "8px 0", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(21,101,192,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
              {q.topic === "Álgebra" ? "📐" : q.topic === "Cinemática" ? "🚀" : q.topic === "Geometria" ? "📏" : q.topic === "Dinâmica" ? "⚡" : "📊"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <span style={S.badge()}>{q.topic}</span>
                <span style={{ ...S.badge("rgba(255,255,255,0.08)"), color: "rgba(255,255,255,0.4)" }}>{q.difficulty}</span>
              </div>
              <p style={{ ...S.p, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{q.q}</p>
            </div>
            <Icon name="send" size={16} color="rgba(255,107,0,0.5)" />
          </button>
        ))}
      </div>
    </div>
  );
}

function RankingScreen() {
  return (
    <div>
      <div style={{ background: "linear-gradient(180deg,rgba(21,101,192,0.3) 0%,transparent 100%)", padding: "20px 20px 16px" }}>
        <h1 style={S.h1}>🏆 Ranking</h1>
        <p style={{ ...S.p, marginTop: 4 }}>Melhores alunos de Moçambique</p>
      </div>
      <div style={{ margin: "0 16px 8px", background: "linear-gradient(135deg,rgba(21,101,192,0.2),rgba(255,107,0,0.1))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12 }}>
          {[RANKING[1], RANKING[0], RANKING[2]].map((r, i) => {
            const heights = [70, 100, 50];
            const medals = ["🥈", "👑", "🥉"];
            const colors = ["rgba(192,192,192,0.2)", "rgba(255,215,0,0.15)", "rgba(205,127,50,0.15)"];
            const textColors = ["#C0C0C0", "#FFD700", "#CD7F32"];
            return (
              <div key={r.pos} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: i === 1 ? 36 : 28, marginBottom: 4 }}>{medals[i]}</div>
                <div style={{ background: colors[i], borderRadius: "14px 14px 0 0", padding: "12px 8px 8px", height: heights[i], display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <p style={{ color: textColors[i], fontSize: 12, fontWeight: 800, margin: 0 }}>{r.name.split(" ")[0]}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, margin: 0 }}>{r.score} pts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {RANKING.map((r, i) => (
          <div key={r.pos} style={{ ...S.card, margin: "8px 0", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: i < 3 ? ["rgba(255,215,0,0.15)", "rgba(192,192,192,0.15)", "rgba(205,127,50,0.15)"][i] : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 18 : 14, fontWeight: 800, color: i < 3 ? ["#FFD700", "#C0C0C0", "#CD7F32"][i] : "rgba(255,255,255,0.3)" }}>
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : r.pos}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{r.name}</p>
              <p style={{ ...S.p, fontSize: 12, marginTop: 2 }}>{r.solved} exercícios</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#FF6B00", fontWeight: 800, fontSize: 16, margin: 0 }}>{r.score}</p>
              <p style={{ ...S.p, fontSize: 10 }}>pontos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningScreen() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const topics = [
    { id: "Álgebra", icon: "📐" }, { id: "Geometria", icon: "📏" },
    { id: "Cinemática", icon: "🚀" }, { id: "Dinâmica", icon: "⚡" },
    { id: "Trigonometria", icon: "📊" }, { id: "Energia", icon: "🔋" },
  ];
  const startQuestion = async (topic) => {
    setSelectedTopic(topic); setLoading(true); setSelected(null); setShowResult(false); setCurrentQ(null);
    try { const q = await generateQuestion(topic); setCurrentQ(q); } catch { setCurrentQ(null); }
    setLoading(false);
  };
  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt); setShowResult(true);
    setScore(s => ({ correct: s.correct + (opt.startsWith(currentQ.correta) ? 1 : 0), total: s.total + 1 }));
  };
  return (
    <div>
      <div style={{ background: "linear-gradient(180deg,rgba(21,101,192,0.3) 0%,transparent 100%)", padding: "20px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h1 style={S.h1}>📚 Aprendizado</h1><p style={{ ...S.p, marginTop: 4 }}>Pratique e suba no ranking</p></div>
        <div style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 12, padding: "8px 12px", textAlign: "center" }}>
          <p style={{ color: "#FF6B00", fontSize: 18, fontWeight: 800, margin: 0 }}>{score.correct}/{score.total}</p>
          <p style={{ ...S.p, fontSize: 10 }}>acertos</p>
        </div>
      </div>
      {!selectedTopic ? (
        <div style={{ padding: "0 16px" }}>
          <p style={{ ...S.p, paddingBottom: 16 }}>Escolhe um tema:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {topics.map(t => (
              <button key={t.id} onClick={() => startQuestion(t.id)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "20px 16px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{t.id}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setSelectedTopic(null); setCurrentQ(null); }} style={{ ...S.btnGhost, fontSize: 14, color: "#FF6B00", fontWeight: 700 }}>← Voltar</button>
            <span style={S.badge()}>{selectedTopic}</span>
          </div>
          {loading && <Spinner />}
          {!loading && currentQ && (
            <div>
              <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(21,101,192,0.15),rgba(255,107,0,0.08))", border: "1px solid rgba(21,101,192,0.25)" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>❓ PERGUNTA</p>
                <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{currentQ.pergunta}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {currentQ.opcoes?.map((opt, i) => {
                  const isCorrect = opt.startsWith(currentQ.correta);
                  const isSelected = selected === opt;
                  let bg = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.08)", color = "#fff";
                  if (showResult && isCorrect) { bg = "rgba(76,175,80,0.15)"; border = "rgba(76,175,80,0.4)"; color = "#81C784"; }
                  else if (showResult && isSelected) { bg = "rgba(244,67,54,0.15)"; border = "rgba(244,67,54,0.4)"; color = "#EF9A9A"; }
                  return (
                    <button key={i} onClick={() => handleAnswer(opt)} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 16px", color, fontWeight: 600, fontSize: 14, cursor: selected ? "default" : "pointer", textAlign: "left", transition: "all 0.2s" }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {showResult && (
                <div>
                  <div style={{ marginTop: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14 }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>💡 EXPLICAÇÃO</p>
                    <p style={{ ...S.p, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{currentQ.explicacao}</p>
                  </div>
                  <button onClick={() => startQuestion(selectedTopic)} style={{ ...S.btnPrimary, marginTop: 12 }}>Próxima pergunta →</button>
                </div>
              )}
            </div>
          )}
          {!loading && !currentQ && (
            <div style={{ textAlign: "center", padding: 32 }}>
              <p style={{ ...S.p, color: "#EF5350" }}>Erro ao gerar pergunta.</p>
              <button onClick={() => startQuestion(selectedTopic)} style={{ ...S.btnPrimary, marginTop: 12 }}>Tentar novamente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryScreen({ history }) {
  return (
    <div>
      <div style={{ background: "linear-gradient(180deg,rgba(21,101,192,0.3) 0%,transparent 100%)", padding: "20px 20px 16px" }}>
        <h1 style={S.h1}>📋 Histórico</h1>
        <p style={{ ...S.p, marginTop: 4 }}>{history.length} exercícios resolvidos</p>
      </div>
      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>Ainda sem histórico</p>
          <p style={{ ...S.p, fontSize: 13, marginTop: 8 }}>Resolve exercícios para ver aqui</p>
        </div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          {history.map((h, i) => (
            <div key={i} style={{ ...S.card, margin: "8px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={S.badge()}>{h.topico}</span>
                <span style={{ ...S.p, fontSize: 11 }}>{h.time}</span>
              </div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "6px 0 4px" }}>{h.titulo}</p>
              <p style={{ ...S.p, fontSize: 12 }}>✅ {h.resposta_final}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionScreen({ onClose, onActivate }) {
  const [plan, setPlan] = useState("quarterly");
  const [payMethod, setPayMethod] = useState(null);
  const [paidClicked, setPaidClicked] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A0E1A", zIndex: 300, overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#1565C0 0%,#0D47A1 60%,#FF6B00 100%)", padding: "40px 20px 48px", textAlign: "center", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, ...S.btnGhost }}><Icon name="close" size={22} color="rgba(255,255,255,0.7)" /></button>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✨</div>
        <h1 style={{ ...S.h1, fontSize: 28 }}>ResolveMZ <span style={{ color: "#FFD700" }}>Premium</span></h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 8 }}>Exercícios ilimitados para os teus estudos!</p>
      </div>
      <div style={{ padding: "24px 16px" }}>
        {["✅ Exercícios ilimitados", "✅ Passo a passo detalhado", "✅ Física + Matemática", "✅ Histórico completo", "✅ Ranking de melhores alunos"].map(f => (
          <p key={f} style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{f}</p>
        ))}
        <p style={{ ...S.label, marginTop: 20, marginBottom: 10 }}>Escolhe o plano</p>
        {PLANS.map(p => (
          <div key={p.id} onClick={() => setPlan(p.id)} style={{ border: `2px solid ${plan === p.id ? "#FF6B00" : "rgba(255,255,255,0.1)"}`, background: plan === p.id ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.03)", borderRadius: 16, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${plan === p.id ? "#FF6B00" : "rgba(255,255,255,0.2)"}`, background: plan === p.id ? "#FF6B00" : "transparent" }} />
              <p style={{ color: "#fff", fontWeight: 700, margin: 0 }}>{p.label}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#FF6B00", fontWeight: 800, fontSize: 18, margin: 0 }}>{p.price}</p>
              <p style={{ ...S.p, fontSize: 11 }}>{p.sub}</p>
            </div>
          </div>
        ))}
        <p style={{ ...S.label, marginTop: 20, marginBottom: 10 }}>Método de pagamento</p>
        {PAYMENT_METHODS.map(pm => (
          <div key={pm.id} onClick={() => setPayMethod(pm.id)} style={{ border: `2px solid ${payMethod === pm.id ? pm.color : "rgba(255,255,255,0.1)"}`, background: payMethod === pm.id ? `${pm.color}18` : "rgba(255,255,255,0.03)", borderRadius: 16, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{pm.icon}</span>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, margin: 0 }}>{pm.name}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>Enviar para: <strong style={{ color: "#fff" }}>{pm.number}</strong></p>
            </div>
            {payMethod === pm.id && <div style={{ marginLeft: "auto" }}><Icon name="check" size={18} color={pm.color} /></div>}
          </div>
        ))}
        {payMethod && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
              📋 <strong>Como pagar:</strong><br />
              1. Abre o {PAYMENT_METHODS.find(p => p.id === payMethod)?.name}<br />
              2. Transfere <strong>{PLANS.find(p => p.id === plan)?.price}</strong> para <strong>{PAYMENT_METHODS.find(p => p.id === payMethod)?.number}</strong><br />
              3. Guarda o comprovativo<br />
              4. Clica em <strong>"Já paguei"</strong> abaixo
            </p>
          </div>
        )}
        <button onClick={() => { setPaidClicked(true); setTimeout(() => { onActivate?.(); onClose?.(); }, 2000); }} disabled={!payMethod || paidClicked} style={{ ...S.btnPrimary, opacity: !payMethod ? 0.5 : 1, background: paidClicked ? "rgba(76,175,80,0.8)" : undefined }}>
          {paidClicked ? <><Icon name="check" size={18} color="#fff" />A verificar pagamento...</> : <><Icon name="lock" size={18} color="#fff" />Já paguei — Ativar Premium</>}
        </button>
        <p style={{ ...S.p, textAlign: "center", fontSize: 12, marginTop: 16 }}>2 dias grátis para novos utilizadores 🇲🇿</p>
      </div>
    </div>
  );
}

function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const steps = [
    { icon: "🇲🇿", title: "Bem-vindo ao ResolveMZ", sub: "O app de matemática e física feito para estudantes moçambicanos." },
    { icon: "📸", title: "Fotografa ou escreve", sub: "Tira foto do exercício ou escreve o problema. A IA resolve tudo!" },
    { icon: "⚡", title: "Passo a passo detalhado", sub: "Entende cada etapa com explicações simples e claras em português." },
  ];
  const isLast = step === steps.length - 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "linear-gradient(160deg,#0D47A1 0%,#0A0E1A 60%,#1a0800 100%)", padding: "48px 24px 32px", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 28 }}>{steps[step].icon}</div>
        <h1 style={{ ...S.h1, fontSize: 30, marginBottom: 14 }}>{steps[step].title}</h1>
        <p style={{ ...S.p, fontSize: 16, maxWidth: 280 }}>{steps[step].sub}</p>
        {isLast && (
          <div style={{ width: "100%", marginTop: 32 }}>
            <span style={S.label}>O teu nome</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Amina Salimo" style={{ ...S.input }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 6, height: 6, borderRadius: 3, background: i === step ? "#FF6B00" : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />)}
      </div>
      <button onClick={() => { if (isLast) onDone({ name: name || "Estudante" }); else setStep(s => s + 1); }} style={S.btnPrimary}>
        {isLast ? "Começar a estudar 🚀" : "Continuar"}
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("onboarding");
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [history, setHistory] = useState([]);
  const tabs = [
    { id: "home", label: "Início", icon: "home" },
    { id: "learn", label: "Aprender", icon: "book" },
    { id: "ranking", label: "Ranking", icon: "trophy" },
    { id: "history", label: "Histórico", icon: "history" },
  ];
  if (screen === "onboarding") return <OnboardingScreen onDone={(u) => { setUser(u); setScreen("app"); }} />;
  return (
    <div style={S.app}>
      <div style={S.screen}>
        {tab === "home" && <HomeScreen user={user} isPremium={isPremium} onSolve={(res) => setHistory(h => [{ ...res, time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }) }, ...h])} />}
        {tab === "learn" && <LearningScreen />}
        {tab === "ranking" && <RankingScreen />}
        {tab === "history" && <HistoryScreen history={history} />}
      </div>
      <nav style={S.nav}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={S.navBtn(tab === t.id)}>
            <Icon name={t.icon} size={22} color={tab === t.id ? "#FF6B00" : "rgba(255,255,255,0.35)"} />
            {t.label}
          </button>
        ))}
        <button onClick={() => setShowSub(true)} style={S.navBtn(false)}>
          <Icon name="star" size={22} color="rgba(255,215,0,0.7)" />
          <span style={{ color: "rgba(255,215,0,0.7)" }}>Premium</span>
        </button>
      </nav>
      {showSub && <SubscriptionScreen onClose={() => setShowSub(false)} onActivate={() => setIsPremium(true)} />}
      <style>{`* { -webkit-tap-highlight-color: transparent; } button:active { opacity: 0.85; transform: scale(0.97); } textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
    </div>
  );
}
