import { useState } from "react";
import { Upload, Plus, Minus, ImagePlus, CheckCircle } from "lucide-react";
import { CATEGORIES } from "../data/recipes";

export function UploadRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Italian");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [time, setTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const [steps, setSteps] = useState([""]);
  const [submitted, setSubmitted] = useState(false);

  function addIngredient() { setIngredients(prev => [...prev, { name: "", amount: "" }]); }
  function removeIngredient(i: number) { setIngredients(prev => prev.filter((_, idx) => idx !== i)); }
  function updateIngredient(i: number, field: "name" | "amount", val: string) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  }

  function addStep() { setSteps(prev => [...prev, ""]); }
  function removeStep(i: number) { setSteps(prev => prev.filter((_, idx) => idx !== i)); }
  function updateStep(i: number, val: string) { setSteps(prev => prev.map((s, idx) => idx === i ? val : s)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
          <CheckCircle size={40} style={{ color: "var(--primary)" }} />
        </div>
        <div className="text-center">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--foreground)" }}>Recipe Submitted!</h2>
          <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem", lineHeight: 1.6 }}>
            Your recipe is under review. Once approved by our team, it will be visible to the community.
          </p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setIngredients([{ name: "", amount: "" }]); setSteps([""]); }}
          className="px-8 py-3 rounded-2xl"
          style={{ background: "var(--primary)", color: "white", fontWeight: 600 }}
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <div className="px-5 pt-5 pb-3">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>Share a Recipe</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Contribute to the community</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 pb-6 space-y-5" style={{ scrollbarWidth: "none" }}>
        {/* Photo upload */}
        <div
          className="w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-80"
          style={{ borderColor: "var(--primary)", background: "rgba(212,98,42,0.04)" }}
        >
          <ImagePlus size={28} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 500 }}>Add Recipe Photo</span>
          <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>JPG, PNG up to 10MB</span>
        </div>

        {/* Basic info */}
        <FormField label="Recipe Title">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Mom's Famous Lasagna"
            required
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.9rem" }}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What makes this recipe special?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
            style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.9rem" }}
          />
        </FormField>

        {/* Category + Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none"
              style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.9rem" }}
            >
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Difficulty">
            <div className="flex gap-1.5">
              {(["Easy", "Medium", "Hard"] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-3 rounded-xl transition-all"
                  style={{
                    background: difficulty === d ? "var(--primary)" : "var(--input-background)",
                    color: difficulty === d ? "white" : "var(--muted-foreground)",
                    fontSize: "0.78rem",
                    fontWeight: difficulty === d ? 600 : 400,
                    border: `1px solid ${difficulty === d ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Time + Servings */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={`Cook Time: ${time}m`}>
            <input
              type="range" min={5} max={120} step={5} value={time}
              onChange={e => setTime(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "var(--primary)" }}
            />
          </FormField>
          <FormField label={`Servings: ${servings}`}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setServings(s => Math.max(1, s - 1))} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
                <Minus size={14} />
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--foreground)", minWidth: "2rem", textAlign: "center" }}>{servings}</span>
              <button type="button" onClick={() => setServings(s => s + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
                <Plus size={14} />
              </button>
            </div>
          </FormField>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>Ingredients</p>
            <button type="button" onClick={addIngredient} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--muted)", color: "var(--foreground)", fontSize: "0.78rem", fontWeight: 600 }}>
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="space-y-2.5">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={ing.name}
                  onChange={e => updateIngredient(i, "name", e.target.value)}
                  placeholder="Ingredient"
                  className="flex-1 px-3 py-2.5 rounded-xl border outline-none"
                  style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.85rem" }}
                />
                <input
                  value={ing.amount}
                  onChange={e => updateIngredient(i, "amount", e.target.value)}
                  placeholder="Amount"
                  className="w-24 px-3 py-2.5 rounded-xl border outline-none"
                  style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.85rem" }}
                />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)} className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: "rgba(192,57,43,0.1)" }}>
                    <Minus size={13} style={{ color: "#C0392B" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>Steps</p>
            <button type="button" onClick={addStep} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--muted)", color: "var(--foreground)", fontSize: "0.78rem", fontWeight: 600 }}>
              <Plus size={13} /> Add Step
            </button>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-2" style={{ background: "var(--primary)", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
                  {i + 1}
                </div>
                <textarea
                  value={step}
                  onChange={e => updateStep(i, e.target.value)}
                  placeholder={`Step ${i + 1}...`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 rounded-xl border outline-none resize-none"
                  style={{ background: "var(--input-background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.85rem" }}
                />
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center mt-1" style={{ background: "rgba(192,57,43,0.1)" }}>
                    <Minus size={13} style={{ color: "#C0392B" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--primary)", color: "white", fontWeight: 600, fontSize: "1rem" }}
        >
          <Upload size={18} />
          Submit Recipe
        </button>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      {children}
    </div>
  );
}
