import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Check, Upload, Sparkles } from "lucide-react";
import genieMascot from "@/assets/genie-mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerGenie — Your AI-powered job match assistant" },
      { name: "description", content: "Upload your resume and let CareerJeenie magically find your best job matches from any company careers page." },
      { property: "og:title", content: "CareerGenie" },
      { property: "og:description", content: "Your AI-powered job match assistant." },
    ],
  }),
  component: Index,
});

type Status = "idle" | "loading" | "success" | "error";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip data:...;base64, prefix
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Index() {
  const [jobRole, setJobRole] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [responseMessage, setResponseMessage] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jobRole || !resume) return;
    setStatus("loading");
    try {
      const base64 = await fileToBase64(resume);
      const res = await fetch("https://theerthajayadev02.app.n8n.cloud/webhook/231bec3f-eedc-4446-af7e-80a0561d6f3e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_role: jobRole,
          resume_file: base64,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const text = await res.text();
      let display = text;
      try {
        const json = JSON.parse(text);
        display =
          json.message ??
          json.response ??
          json.requestId ??
          json.request_id ??
          json.id ??
          JSON.stringify(json, null, 2);
      } catch {
        // not JSON, keep raw text
      }
      setResponseMessage(display?.toString().trim() || "");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: "var(--gradient-cosmic)" }}
    >
      {/* ambient glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

      <div className="relative w-full max-w-xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center drop-shadow-[0_0_35px_oklch(0.82_0.16_85_/_0.55)]">
            <img
              src={genieMascot}
              alt="CareerGenie mascot — a genie in a formal suit holding a magic lamp"
              width={1024}
              height={1024}
              className="h-40 w-40 object-contain"
            />
          </div>
          <h1 className="bg-clip-text text-5xl font-bold tracking-tight text-transparent" style={{ backgroundImage: "var(--gradient-genie)" }}>
            ✨ CareerGenie
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Your AI-powered job match assistant
          </p>
        </header>

        <div
          className="rounded-2xl border border-border bg-card p-8 backdrop-blur-xl"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                Target job role
              </label>
              <input
                id="role"
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Business Analyst"
                className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Resume (PDF)</label>
              <label
                htmlFor="resume"
                className="group flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-input/20 px-4 py-5 text-sm text-muted-foreground transition hover:border-primary hover:bg-input/40 hover:text-foreground"
              >
                <Upload className="h-5 w-5" />
                <span className="truncate">
                  {resume ? resume.name : "Upload Resume"}
                </span>
                <input
                  id="resume"
                  type="file"
                  accept="application/pdf"
                  required
                  className="sr-only"
                  onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-4 text-base font-semibold text-primary-foreground transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
              style={{
                background: "var(--gradient-genie)",
                boxShadow: "0 10px 40px oklch(0.82 0.16 85 / 0.45)",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  CareerGenie is working its magic...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Find My Matches
                </>
              )}
            </button>

            {status === "success" && (
              <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
                <Check className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1">
                  <p>Done! Your matches have been added to your Google Sheet.</p>
                  {responseMessage && (
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-success/10 p-2 text-xs text-success/90">
                      {responseMessage}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Three wishes? We grant just one — the perfect job.
        </p>
      </div>
    </main>
  );
}
