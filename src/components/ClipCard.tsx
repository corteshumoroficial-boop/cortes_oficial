import { useState } from "react";
import { Copy, Check, ChevronDown, Play, Paintbrush, ThumbsUp, ThumbsDown, Edit2, X as XIcon } from "lucide-react";
import type { ViralClip } from "@/lib/clips.functions";
import { saveClipFeedback } from "@/lib/clips.functions";
import { useServerFn } from "@tanstack/react-start";
import { ThumbnailCanvas, type ThumbnailConfig, getDefaultConfig } from "./ThumbnailCanvas";
import { ThumbnailEditorModal } from "./ThumbnailEditorModal";
import { toast } from "sonner";

const TRIGGER_LABELS: Record<string, string> = {
  hook: "The Hook",
  cliffhanger: "Cliffhanger",
  high_value: "High Value",
  controversy: "Controversy",
  emotional: "Emotional",
  humor: "Humor",
};

interface Props {
  clip: ViralClip;
  index: number;
  onPlay?: (clip: ViralClip) => void;
  thumbnailConfig?: ThumbnailConfig;
  onThumbnailSave?: (dataUrl: string, config: ThumbnailConfig) => void;
  youtubeThumbnailDataUrl?: string | null;
  preRenderedDataUrl?: string | null;
  onClipEdit?: (index: number, updatedClip: ViralClip) => void;
}

export function ClipCard({ clip, index, onPlay, thumbnailConfig, onThumbnailSave, youtubeThumbnailDataUrl, preRenderedDataUrl, onClipEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // States for dynamic feedback & inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(clip.title);
  const [tempHook, setTempHook] = useState(clip.hookQuote);
  const [rating, setRating] = useState<number | null>(null);

  const saveFeedback = useServerFn(saveClipFeedback);

  const handleSaveEdit = async () => {
    if (!tempTitle.trim() || !tempHook.trim()) {
      toast.error("O título e o gancho não podem ser vazios.");
      return;
    }

    if (onClipEdit) {
      onClipEdit(index, {
        ...clip,
        title: tempTitle.trim(),
        hookQuote: tempHook.trim(),
      });
    }

    setIsEditing(false);
    toast.success("Corte atualizado e salvo!");

    try {
      const res = await saveFeedback({
        data: {
          transcriptExcerpt: clip.transcriptExcerpt,
          originalTitle: clip.title,
          approvedTitle: tempTitle.trim(),
          originalHook: clip.hookQuote,
          approvedHook: tempHook.trim(),
          rating: 1,
        }
      });
      if (res.success) {
        setRating(1);
        toast.success("A IA aprendeu com a sua correção! 🧠");
      }
    } catch (err) {
      console.warn("Erro ao salvar feedback da correção:", err);
    }
  };

  const handleRating = async (newRating: number) => {
    const ratingValue = rating === newRating ? null : newRating;
    
    if (ratingValue === null) {
      setRating(null);
      return;
    }

    try {
      const res = await saveFeedback({
        data: {
          transcriptExcerpt: clip.transcriptExcerpt,
          originalTitle: clip.title,
          approvedTitle: clip.title,
          originalHook: clip.hookQuote,
          approvedHook: clip.hookQuote,
          rating: ratingValue,
        }
      });

      if (res.success) {
        setRating(ratingValue);
        if (ratingValue === 1) {
          toast.success("Feedback positivo enviado! A IA priorizará esse padrão. 🧠");
        } else {
          toast.success("Feedback negativo enviado! A IA evitará esse padrão.");
        }
      } else {
        toast.error(`Falha ao registrar feedback: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`Erro ao comunicar com o servidor: ${err.message || err}`);
    }
  };

  const isTop = index === 0;
  const scoreColor = clip.score >= 90 ? "border-primary" : clip.score >= 75 ? "border-primary/60" : "border-border";

  // Always use default config with viral effects
  const effectiveConfig = thumbnailConfig || getDefaultConfig(clip);

  const copyAll = () => {
    const text = `${clip.title}
${clip.startTimestamp} → ${clip.endTimestamp} (${clip.durationSeconds}s)

HOOK: ${clip.hookQuote}

JUSTIFICATIVA: ${clip.justification}

LEGENDAS: ${clip.captionStyle}
B-ROLL: ${clip.brollSuggestion}

TRECHO: "${clip.transcriptExcerpt}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="group bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 animate-entry flex flex-col"
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`size-16 rounded-full border-4 ${scoreColor} grid place-items-center shrink-0`}>
          <span className="font-display text-2xl leading-none">{clip.score}</span>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Timestamp</div>
          <div className="font-mono text-sm text-primary">
            {clip.startTimestamp} → {clip.endTimestamp}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-1">
            {clip.durationSeconds}s
          </div>
        </div>
      </div>

      {/* Miniatura da Thumbnail */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-5 bg-zinc-950 border border-zinc-855/20 flex items-center justify-center">
        {(() => {
          const hasBeenEdited = !!thumbnailConfig;
          const displayPreRendered = !!preRenderedDataUrl && !hasBeenEdited;
          return (
            <ThumbnailCanvas
              clip={clip}
              config={effectiveConfig}
              onExport={displayPreRendered ? undefined : (dataUrl) => {
                if (onThumbnailSave) {
                  onThumbnailSave(dataUrl, effectiveConfig);
                }
              }}
              width={400}
              youtubeThumbnailDataUrl={displayPreRendered ? preRenderedDataUrl : youtubeThumbnailDataUrl}
              isPreRendered={displayPreRendered}
            />
          );
        })()}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
          <button
            onClick={() => setShowEditor(true)}
            className="bg-white text-zinc-950 hover:bg-white/90 text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-black/20"
          >
            <Paintbrush className="size-3.5" />
            Editar Thumbnail
          </button>
        </div>
      </div>

      {/* 🧠 Painel de Feedback e Edição para Treinamento da IA */}
      <div className="flex items-center justify-between gap-2 mb-4 bg-black/30 border border-border/40 rounded-xl p-2.5 backdrop-blur-sm">
        <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Ensinar IA:</span>
        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={() => handleRating(1)}
            title="Curtir e ensinar padrão para a IA"
            className={`p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center border cursor-pointer ${
              rating === 1
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                : "bg-surface border-border/30 hover:border-emerald-500/50 hover:text-emerald-400 text-muted-foreground"
            }`}
          >
            <ThumbsUp className="size-4" />
          </button>

          {/* Dislike */}
          <button
            onClick={() => handleRating(-1)}
            title="Rejeitar e ensinar IA a evitar"
            className={`p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center border cursor-pointer ${
              rating === -1
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-surface border-border/30 hover:border-rose-500/50 hover:text-rose-400 text-muted-foreground"
            }`}
          >
            <ThumbsDown className="size-4" />
          </button>

          <div className="h-4 w-px bg-border/40 mx-1" />

          {/* Edit Button */}
          <button
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
              } else {
                setTempTitle(clip.title);
                setTempHook(clip.hookQuote);
                setIsEditing(true);
              }
            }}
            title="Editar textos do clipe"
            className={`p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center border cursor-pointer ${
              isEditing
                ? "bg-primary/20 border-primary text-primary"
                : "bg-surface border-border/30 hover:border-primary/50 hover:text-primary text-muted-foreground"
            }`}
          >
            <Edit2 className="size-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-3 space-y-1">
          <label className="text-[9px] font-mono uppercase tracking-widest text-primary block">Título do Clipe</label>
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            className="w-full bg-black/60 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="Digite o título do corte..."
          />
        </div>
      ) : (
        <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
          {isTop && <span className="text-primary mr-1">★</span>}
          {clip.title}
        </h3>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {clip.triggers.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider"
          >
            {TRIGGER_LABELS[t] ?? t}
          </span>
        ))}
      </div>

      {isEditing ? (
        <div className="mb-4 space-y-3">
          <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-primary block mb-1">Gancho / Frase Falada (Hook)</label>
            <textarea
              value={tempHook}
              onChange={(e) => setTempHook(e.target.value)}
              rows={2}
              className="w-full bg-black/60 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors font-mono italic"
              placeholder="Frase exata falada no início do clipe..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="size-3.5" /> Salvar e Ensinar IA
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <XIcon className="size-3.5" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4 italic font-mono bg-black/40 p-3 rounded line-clamp-3">
          "{clip.hookQuote}"
        </p>
      )}

      {onPlay && (
        <button
          onClick={() => onPlay(clip)}
          className="mb-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          <Play className="size-3 fill-current" />
          Reproduzir clipe
        </button>
      )}


      <div className="space-y-3 mb-4">
        <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
          Viral Justification
        </div>
        <p className="text-xs leading-relaxed opacity-80">{clip.justification}</p>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-auto flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-primary hover:text-primary/80 transition-colors pt-3 border-t border-border"
      >
        <ChevronDown className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Recolher direção" : "Direção visual"}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 text-xs animate-entry">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
              Legendas dinâmicas
            </div>
            <p className="opacity-80 leading-relaxed">{clip.captionStyle}</p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
              B-Roll / Emojis
            </div>
            <p className="opacity-80 leading-relaxed">{clip.brollSuggestion}</p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
              Trecho da transcrição
            </div>
            <p className="opacity-70 italic font-mono leading-relaxed bg-black/40 p-3 rounded">
              {clip.transcriptExcerpt}
            </p>
          </div>
          <button
            onClick={copyAll}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-display text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copiado" : "Copiar briefing"}
          </button>
        </div>
      )}

      <ThumbnailEditorModal
        clip={clip}
        initialConfig={thumbnailConfig}
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={(dataUrl, config) => {
          if (onThumbnailSave) {
            onThumbnailSave(dataUrl, config);
          }
          setShowEditor(false);
        }}
        youtubeThumbnailDataUrl={youtubeThumbnailDataUrl}
      />

    </div>
  );
}
