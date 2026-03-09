"use client";
import { useState } from "react";
import { Window } from "@/components/retro/Window";
import { RetroButton } from "@/components/retro/Button";
import { RetroTextArea } from "@/components/retro/TextArea";
import { RetroDialog } from "@/components/retro/Dialog";

const SAMPLE = `Jane Doe | jane@email.com | github.com/janedoe

SUMMARY
Full-stack software engineer with 3 years of experience building scalable web applications.

EXPERIENCE
Software Engineer — Acme Corp (2022–Present)
- Built React dashboards serving 50K+ daily active users
- Reduced API latency by 40% through Redis caching
- Led migration from monolith to microservices on AWS

EDUCATION
BSc Computer Science — State University, 2021

SKILLS
React, TypeScript, Node.js, PostgreSQL, Redis, AWS, Docker`;

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "pdf">("text");
  const [dialog, setDialog] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== "application/pdf") {
      setDialog(true);
      return;
    }
    setPdfFile(f);
  };

  const isReady = inputMode === "pdf" ? !!pdfFile : resumeText.trim().length > 50;

  return (
    <main
      className="min-h-screen scanlines"
      style={{
        background: "#008080",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E\")",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 gap-1 z-40">
        <RetroButton className="flex items-center gap-1 font-bold">
          🪟 Start
        </RetroButton>
        <div className="h-6 w-px bg-[#808080] mx-1" />
        <div className="border-2 border-[#808080] border-r-white border-b-white bg-[#c0c0c0] px-3 py-0.5 text-xs font-bold">
          💼 JobHunter Pro 95
        </div>
        <div className="ml-auto border border-[#808080] bg-white px-2 text-xs flex items-center">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-4 right-4 flex flex-col gap-4">
        {["📄 Resume", "🌐 Jobs", "✉️ Letters", "🗑️ Recycle Bin"].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1 cursor-pointer group w-16">
            <div className="text-3xl">{item.split(" ")[0]}</div>
            <span className="text-white text-[10px] text-center leading-tight group-hover:bg-[#000080] px-1">
              {item.split(" ").slice(1).join(" ")}
            </span>
          </div>
        ))}
      </div>

      {/* Main Window */}
      <div className="flex flex-col items-center justify-center min-h-screen pb-10 px-4">
        <Window title="JobHunter Pro 95 — Resume Input" icon="💼" className="w-full max-w-xl">

          {/* Menu bar */}
          <div className="flex gap-4 border-b border-[#808080] pb-1 mb-3 -mx-2 px-2">
            {["File", "Edit", "View", "Agents", "Help"].map((m) => (
              <button key={m} className="text-xs hover:bg-[#000080] hover:text-white px-1 py-0.5">
                {m}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex mb-3">
            {[["text", "📝 Paste Text"], ["pdf", "📎 Upload PDF"]].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode as "text" | "pdf")}
                className={`text-xs px-4 py-1 border border-b-0 -mb-px relative z-10
                  ${inputMode === mode
                    ? "bg-[#c0c0c0] border-[#808080] border-r-white"
                    : "bg-[#a0a0a0] border-[#808080] text-[#555] z-0"
                  }`}
              >
                {label}
              </button>
            ))}
            <div className="flex-1 border-b border-[#808080]" />
          </div>

          {/* Input */}
          {inputMode === "text" ? (
            <>
              <RetroTextArea
                label="Paste your resume below:"
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={"Jane Doe\nSoftware Engineer\n\nEXPERIENCE\n..."}
                className="w-full"
              />
              <button
                onClick={() => setResumeText(SAMPLE)}
                className="text-[10px] text-[#000080] underline mt-1 cursor-pointer bg-transparent border-none"
              >
                Load sample resume
              </button>
            </>
          ) : (
            <div
              onClick={() => document.getElementById("pdf-input")?.click()}
              className="border-2 border-[#808080] border-r-white border-b-white bg-white min-h-[180px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50"
            >
              <span className="text-5xl">{pdfFile ? "📄" : "📁"}</span>
              <span className="text-xs text-center px-4">
                {pdfFile ? pdfFile.name : "Click to browse for your resume PDF"}
              </span>
              {pdfFile && <span className="text-xs text-green-700 font-bold">✓ File loaded</span>}
              <input id="pdf-input" type="file" accept=".pdf" onChange={handleFile} className="hidden" />
            </div>
          )}

          {/* Status + Buttons */}
          <div className="border-t border-[#808080] mt-3 pt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#555]">
              {isReady ? "✓ Ready to analyze" : "Waiting for resume..."}
            </span>
            <span className="text-[10px] text-[#555]">{resumeText.length} chars</span>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <RetroButton onClick={() => { setResumeText(""); setPdfFile(null); }}>
              Clear
            </RetroButton>
            <RetroButton
              disabled={!isReady}
              className="bg-[#000080] text-white border-[#6666aa] border-r-[#00003a] border-b-[#00003a] disabled:opacity-40"
            >
              Analyze Resume →
            </RetroButton>
          </div>
        </Window>
      </div>

      <RetroDialog
        show={dialog}
        title="File Error"
        message="Only PDF files are supported. Please select a valid .pdf file."
        icon="❌"
        onOk={() => setDialog(false)}
      />
    </main>
  );
}
