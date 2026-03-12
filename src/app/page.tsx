"use client";
import { useState, useRef } from "react";
import { Window } from "@/components/retro/Window";
import { RetroButton } from "@/components/retro/Button";
import { RetroTextArea } from "@/components/retro/TextArea";
import { RetroDialog } from "@/components/retro/Dialog";

type Stage = "idle" | "parsing" | "searching" | "done";

type Profile = {
  name: string;
  email: string;
  title: string;
  skills: string[];
  experience_years: number;
  highlights: string[];
  education: string;
  search_queries: string[];
};

type Job = {
  title: string;
  company: string;
  location: string;
  match: number;
  tags: string[];
  snippet: string;
  why_match: string;
  posted: string;
};

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
  const [stage, setStage] = useState<Stage>("idle");
  const [resumeText, setResumeText] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [letters, setLetters] = useState<Record<number, string>>({});
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const [expandedLetter, setExpandedLetter] = useState<number | null>(null);
  const [dialog, setDialog] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });
  const [log, setLog] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLog((p) => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setTimeout(() => logRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  };

  const reset = () => {
    setStage("idle");
    setProfile(null);
    setJobs([]);
    setLetters({});
    setLog([]);
    setGeneratingIdx(null);
    setExpandedLetter(null);
  };

  const run = async () => {
    if (resumeText.trim().length < 50 || stage !== "idle") return;
    setLog([]);
    setProfile(null);
    setJobs([]);
    setLetters({});

    // ── AGENT 1: PARSE ──
    setStage("parsing");
    addLog("Agent 1 (Resume Parser) starting...");

    try {
      const res1 = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });
      const data1 = await res1.json();
      if (!data1.success) throw new Error(data1.error);
      setProfile(data1.profile);
      addLog(`✓ Parser done. Found: ${data1.profile.name}, ${data1.profile.skills?.length} skills detected.`);

      // ── AGENT 2: SEARCH ──
      setStage("searching");
      addLog("Agent 2 (Job Scout) searching for matching positions...");

      const res2 = await fetch("/api/find-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: data1.profile }),
      });
      const data2 = await res2.json();
      if (!data2.success) throw new Error(data2.error);
      setJobs(data2.jobs);
      addLog(`✓ Scout found ${data2.jobs.length} matching positions.`);
      addLog(`Click "Draft Letter" on any job to run Agent 3.`);
      setStage("done");
    } catch (e: unknown) {
      addLog(`ERROR: ${e instanceof Error ? e.message : "Unknown error"}`);
      setDialog({ show: true, msg: `Something went wrong: ${e instanceof Error ? e.message : "Unknown error"}` });
      setStage("idle");
    }
  };

  const generateLetter = async (job: Job, idx: number) => {
    if (!profile || generatingIdx !== null) return;
    setGeneratingIdx(idx);
    addLog(`Agent 3 (Cover Letter Writer) drafting letter for ${job.company}...`);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, job }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLetters((p) => ({ ...p, [idx]: data.letter }));
      setExpandedLetter(idx);
      addLog(`✓ Cover letter for ${job.company} complete.`);
    } catch (e: unknown) {
      addLog(`ERROR: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setGeneratingIdx(null);
    }
  };

  const copy = (idx: number) => {
    navigator.clipboard.writeText(letters[idx]);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const isReady = resumeText.trim().length > 50;
  const isRunning = stage === "parsing" || stage === "searching";

  return (
    <main
      className="min-h-screen scanlines pb-10"
      style={{
        background: "#008080",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E\")",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 gap-1 z-40">
        <RetroButton className="font-bold">🪟 Start</RetroButton>
        <div className="h-6 w-px bg-[#808080] mx-1" />
        <div className="border-2 border-[#808080] border-r-white border-b-white bg-[#c0c0c0] px-3 py-0.5 text-xs font-bold">
          💼 JobHunter Pro 95
        </div>
        {profile && (
          <div className="border-2 border-[#808080] border-r-white border-b-white px-2 text-xs">
            👤 {profile.name}
          </div>
        )}
        <div className="ml-auto border border-[#808080] bg-white px-2 text-xs">
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

      <div className="max-w-3xl mx-auto px-4 pt-6 flex flex-col gap-4">

        {/* Header */}
        <div className="border-2 border-white border-r-[#808080] border-b-[#808080] bg-[#c0c0c0] p-3 flex items-center gap-3">
          <span className="text-4xl">💼</span>
          <div>
            <div className="text-lg font-bold">JobHunter Pro 95</div>
            <div className="text-[10px] text-[#555]">
              3-Agent AI System: Parse Resume → Scout Jobs → Draft Cover Letters
            </div>
          </div>
          <div className="ml-auto flex gap-1">
            <div className="w-3 h-3 bg-red-500 border border-[#808080]" />
            <div className="w-3 h-3 bg-yellow-400 border border-[#808080]" />
            <div className="w-3 h-3 bg-green-500 border border-[#808080]" />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {[
            { label: "1. Parse Resume", active: ["parsing", "searching", "done"].includes(stage) },
            { label: "2. Scout Jobs", active: ["searching", "done"].includes(stage) },
            { label: "3. Draft Letters", active: Object.keys(letters).length > 0 },
          ].map(({ label, active }) => (
            <div
              key={label}
              className={`flex-1 border-2 p-2 text-xs font-bold text-center transition-all
                ${active
                  ? "border-[#000080] bg-[#000080] text-white"
                  : "border-[#808080] border-r-white border-b-white bg-[#c0c0c0] text-[#888]"
                }`}
            >
              {active && stage !== "done" ? "⟳ " : active ? "✓ " : "○ "}{label}
            </div>
          ))}
        </div>

        {/* Resume Input */}
        {stage === "idle" && (
          <Window title="resume_input.txt — Notepad" icon="📄">
            <div className="flex gap-4 border-b border-[#808080] pb-1 mb-3 -mx-2 px-2">
              {["File", "Edit", "View", "Help"].map((m) => (
                <button key={m} className="text-xs hover:bg-[#000080] hover:text-white px-1 py-0.5">
                  {m}
                </button>
              ))}
            </div>

            <RetroTextArea
              label="Paste your resume below:"
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder={"Jane Doe | jane@email.com\n\nSUMMARY\nSoftware engineer with X years...\n\nEXPERIENCE\n...\n\nSKILLS\n..."}
              className="w-full"
            />

            <div className="flex items-center justify-between mt-1">
              <button
                onClick={() => setResumeText(SAMPLE)}
                className="text-[10px] text-[#000080] underline cursor-pointer bg-transparent border-none"
              >
                Load sample resume
              </button>
              <span className="text-[10px] text-[#555]">{resumeText.length} chars</span>
            </div>

            <div className="border-t border-[#808080] mt-3 pt-2 flex items-center justify-between">
              <span className="text-[10px] text-[#555]">
                {isReady ? "✓ Ready to analyze" : "Paste your resume to continue..."}
              </span>
              <div className="flex gap-2">
                <RetroButton onClick={() => setResumeText("")}>Clear</RetroButton>
                <RetroButton
                  onClick={run}
                  disabled={!isReady}
                  className="bg-[#000080] text-white border-[#6666aa] border-r-[#00003a] border-b-[#00003a] disabled:opacity-40"
                >
                  Analyze Resume →
                </RetroButton>
              </div>
            </div>
          </Window>
        )}

        {/* Progress window */}
        {isRunning && (
          <Window
            title={stage === "parsing" ? "Agent 1 — Resume Parser" : "Agent 2 — Job Scout"}
            icon={stage === "parsing" ? "🔬" : "🌐"}
          >
            <div className="flex flex-col gap-3">
              <p className="text-xs">
                {stage === "parsing"
                  ? "Reading and extracting structured data from your resume..."
                  : "Searching for matching job positions..."}
              </p>
              <div className="h-5 border-2 border-[#808080] border-r-white border-b-white bg-white overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    backgroundImage: "repeating-linear-gradient(90deg, #000080 0px, #000080 15px, #5555aa 15px, #5555aa 20px)",
                    backgroundSize: "200% 100%",
                    animation: "slide 0.8s linear infinite",
                    width: "70%",
                  }}
                />
              </div>
              <p className="text-[10px] text-[#555]">Please wait. Do not turn off your computer.</p>
            </div>
          </Window>
        )}

        {/* Profile card */}
        {profile && (
          <Window title={`${profile.name} — Candidate Profile`} icon="👤">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-sm font-bold">{profile.name}</div>
                <div className="text-xs text-[#000080] mb-2">
                  {profile.title} · {profile.experience_years} years exp
                </div>
                <div className="text-[10px] font-bold mb-1">SKILLS:</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {profile.skills?.slice(0, 12).map((s) => (
                    <span key={s} className="border border-[#808080] bg-white px-1 text-[10px]">{s}</span>
                  ))}
                </div>
                <div className="text-[10px] font-bold">KEY HIGHLIGHTS:</div>
                {profile.highlights?.map((h, i) => (
                  <div key={i} className="text-[10px] text-[#333]">→ {h}</div>
                ))}
              </div>
              <RetroButton onClick={reset} className="text-[10px] h-fit">
                Start Over
              </RetroButton>
            </div>
          </Window>
        )}

        {/* Jobs list */}
        {jobs.length > 0 && (
          <Window title={`job_results.txt — ${jobs.length} Positions Found`} icon="🌐">
            <div className="flex flex-col gap-2">
              {jobs.map((job, i) => (
                <div
                  key={i}
                  className={`border-2 p-2 transition-all
                    ${letters[i]
                      ? "border-green-600 bg-green-50"
                      : "border-[#808080] border-r-white border-b-white"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="border border-[#808080] bg-[#000080] text-white text-[10px] px-1">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-bold">{job.title}</span>
                        <span className="text-[10px] text-[#555]">@ {job.company}</span>
                        <span className="ml-auto border border-[#000080] text-[#000080] text-[10px] px-1 whitespace-nowrap">
                          {job.match}% match
                        </span>
                      </div>
                      <div className="text-[10px] text-[#555] mb-1">
                        📍 {job.location} · 🕒 {job.posted}
                      </div>
                      <div className="flex gap-1 flex-wrap mb-1">
                        {job.tags?.map((t) => (
                          <span key={t} className="border border-[#808080] bg-[#e0e0e0] px-1 text-[9px]">{t}</span>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#333] leading-relaxed">{job.snippet}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <RetroButton
                        onClick={() => generateLetter(job, i)}
                        disabled={!!letters[i] || generatingIdx !== null}
                        className="text-[10px] whitespace-nowrap"
                      >
                        {letters[i] ? "✓ Drafted" : generatingIdx === i ? "Writing..." : "Draft Letter"}
                      </RetroButton>
                      {letters[i] && (
                        <RetroButton
                          onClick={() => setExpandedLetter(expandedLetter === i ? null : i)}
                          className="text-[10px]"
                        >
                          {expandedLetter === i ? "Hide" : "View"}
                        </RetroButton>
                      )}
                    </div>
                  </div>

                  {/* Cover letter */}
                  {expandedLetter === i && letters[i] && (
                    <div className="mt-2 border-t border-[#808080] pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#000080]">
                          📄 cover_letter_{job.company.replace(/\s/g, "_").toLowerCase()}.txt
                        </span>
                        <RetroButton onClick={() => copy(i)} className="text-[10px]">
                          {copiedIdx === i ? "✓ Copied!" : "📋 Copy"}
                        </RetroButton>
                      </div>
                      <div className="bg-white border-2 border-[#808080] border-r-white border-b-white p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-black max-h-64 overflow-y-auto">
                        {letters[i]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Window>
        )}

        {/* Agent log */}
        {log.length > 0 && (
          <Window title="agent_log.txt — System Monitor" icon="🖥️">
            <div
              ref={logRef}
              className="bg-black text-green-400 font-mono text-[10px] p-2 max-h-32 overflow-y-auto leading-relaxed border-2 border-[#808080] border-r-white border-b-white"
            >
              {log.map((l, i) => <div key={i}>{l}</div>)}
              <span className="animate-pulse">█</span>
            </div>
          </Window>
        )}

      </div>

      <RetroDialog
        show={dialog.show}
        title="System Error"
        message={dialog.msg}
        icon="❌"
        onOk={() => setDialog({ show: false, msg: "" })}
      />
    </main>
  );
}
