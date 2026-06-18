"""Local worker for render_jobs stored in Supabase."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

try:
    from dotenv import load_dotenv
    from requests import request
except ImportError:
    print("Missing dependencies. Install with: python -m pip install requests python-dotenv")
    sys.exit(1)

ROOT_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=ROOT_DIR / ".env")
load_dotenv(dotenv_path=ROOT_DIR / "env.env", override=False)

for env_path in [ROOT_DIR / ".env", ROOT_DIR / "env.env"]:
    if not env_path.exists():
        continue
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value

SUPABASE_URL = (
    os.environ.get("SUPABASE_URL")
    or os.environ.get("VITE_SUPABASE_URL")
    or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
)
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("VITE_SUPABASE_ANON_KEY")
    or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY")
)
OUTPUT_DIR = Path(os.environ.get("CLIP_WORKER_OUTPUT_DIR", "~/Videos/clipes")).expanduser()
POLL_SECONDS = int(os.environ.get("CLIP_WORKER_POLL_SECONDS", "5"))
LOCK_TIMEOUT_SECONDS = int(os.environ.get("CLIP_WORKER_LOCK_TIMEOUT_SECONDS", "1800"))
WORKER_ID = os.environ.get("CLIP_WORKER_ID", f"local-worker-{os.getpid()}")
YOUTUBE_AUTO_PUBLISH = os.environ.get("YOUTUBE_AUTO_PUBLISH", "false").lower() in ("1", "true", "yes", "on")
YOUTUBE_CLIENT_ID = os.environ.get("YOUTUBE_CLIENT_ID")
YOUTUBE_CLIENT_SECRET = os.environ.get("YOUTUBE_CLIENT_SECRET")
YOUTUBE_REFRESH_TOKEN = os.environ.get("YOUTUBE_REFRESH_TOKEN")
YOUTUBE_PRIVACY_STATUS = os.environ.get("YOUTUBE_PRIVACY_STATUS", "private")
APPLY_ANTI_BLOCK = os.environ.get("APPLY_ANTI_BLOCK", "true").lower() in ("1", "true", "yes", "on")

if not YOUTUBE_REFRESH_TOKEN:
    print("[YOUTUBE] AVISO: YOUTUBE_REFRESH_TOKEN está vazio. O upload automático não funcionará até ser preenchido no env.env ou .env.")
VIDEO_VERTICAL_STYLE = os.environ.get("VIDEO_VERTICAL_STYLE", "blurred").lower()
FFMPEG_PRESET = os.environ.get("FFMPEG_PRESET", "veryfast")
FFMPEG_THREADS = int(os.environ.get("FFMPEG_THREADS", "4"))
FFMPEG_SCALE_WIDTH = int(os.environ.get("FFMPEG_SCALE_WIDTH", "720"))
FFMPEG_SCALE_HEIGHT = int(os.environ.get("FFMPEG_SCALE_HEIGHT", "1280"))
FFMPEG_CRF = int(os.environ.get("FFMPEG_CRF", "28"))


if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY in environment.")
    sys.exit(1)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

JOB_TABLE = "render_jobs"


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def fetch_pending_job() -> dict | None:
    # First, check for rendering jobs (pending)
    url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?select=*&status=eq.pending&order=created_at.asc&limit=1"
    response = request("GET", url, headers=HEADERS)
    response.raise_for_status()
    data = response.json()
    if data:
        return data[0]
    
    # Then check for YouTube publish requests (published_requested)
    url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?select=*&status=eq.published_requested&order=created_at.asc&limit=1"
    response = request("GET", url, headers=HEADERS)
    response.raise_for_status()
    data = response.json()
    return data[0] if data else None


def fetch_pending_jobs(limit: int = 3) -> list[dict]:
    # Fetch up to `limit` pending jobs ordered by creation time
    url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?select=*&status=eq.pending&order=created_at.asc&limit={limit}"
    response = request("GET", url, headers=HEADERS)
    response.raise_for_status()
    data = response.json() or []
    if data:
        return data

    # If no pending rendering jobs, try published_requested
    url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?select=*&status=eq.published_requested&order=created_at.asc&limit={limit}"
    response = request("GET", url, headers=HEADERS)
    response.raise_for_status()
    data = response.json() or []
    return data


def claim_job(job_id: str, current_status: str) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?id=eq.{job_id}&status=eq.{current_status}"
    body = {
        "status": "in_progress",
        "worker_id": WORKER_ID,
        "locked_at": utc_now_iso(),
    }
    response = request("PATCH", url, headers=HEADERS, data=json.dumps(body))
    response.raise_for_status()
    return response.json() != []


def update_job(job_id: str, updates: dict) -> None:
    url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?id=eq.{job_id}"
    response = request("PATCH", url, headers=HEADERS, data=json.dumps(updates))
    response.raise_for_status()


def recover_stale_jobs() -> None:
    try:
        url = f"{SUPABASE_URL}/rest/v1/{JOB_TABLE}?select=id,status,locked_at,output_path,clip_items,instructions&status=eq.in_progress&order=locked_at.asc&limit=20"
        response = request("GET", url, headers=HEADERS)
        response.raise_for_status()
        jobs = response.json() or []
    except Exception as exc:
        print(f"Não foi possível verificar locks antigos: {exc}")
        return

    for job in jobs:
        locked_at = job.get("locked_at")
        if not locked_at:
            continue
        try:
            lock_dt = datetime.fromisoformat(locked_at.replace("Z", "+00:00"))
        except Exception:
            continue

        age_seconds = (datetime.now(UTC) - lock_dt).total_seconds()
        if age_seconds < LOCK_TIMEOUT_SECONDS:
            continue

        target_status = "pending"
        output_path = str(job.get("output_path") or "")
        clip_items = job.get("clip_items") or []
        if "YouTube:" in output_path or any(clip.get("youtube_url") for clip in clip_items if isinstance(clip, dict)):
            target_status = "published_requested"

        print(f"Reenfileirando job travado {job['id']} (lock antigo de {age_seconds:.0f}s) -> {target_status}")
        update_job(job["id"], {
            "status": target_status,
            "worker_id": None,
            "locked_at": None,
            "error_message": f"Job reprocessado após ficar {int(age_seconds)}s em progresso sem conclusão.",
            "updated_at": utc_now_iso(),
        })


def get_missing_youtube_config(custom_refresh_token: str | None = None) -> list[str]:
    missing: list[str] = []
    if not YOUTUBE_AUTO_PUBLISH and not custom_refresh_token:
        missing.append("YOUTUBE_AUTO_PUBLISH=true")
    if not YOUTUBE_CLIENT_ID:
        missing.append("YOUTUBE_CLIENT_ID")
    if not YOUTUBE_CLIENT_SECRET:
        missing.append("YOUTUBE_CLIENT_SECRET")
    if not YOUTUBE_REFRESH_TOKEN and not custom_refresh_token:
        missing.append("YOUTUBE_REFRESH_TOKEN")
    return missing


def get_youtube_service(custom_refresh_token: str | None = None):
    if not YOUTUBE_AUTO_PUBLISH and not custom_refresh_token:
        return None
    
    refresh_token = custom_refresh_token or YOUTUBE_REFRESH_TOKEN
    if not all([YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, refresh_token]):
        return None

    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        client_id=YOUTUBE_CLIENT_ID,
        client_secret=YOUTUBE_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("youtube", "v3", credentials=credentials)


def extract_youtube_id(video_url: str | None) -> str | None:
    if not video_url:
        return None

    patterns = [
        r"(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, video_url)
        if match:
            return match.group(1)
    return None


def get_clip_thumbnail_source(clip: dict, job: dict | None = None) -> tuple[str | None, bytes | None]:
    for key in ("thumbnailDataUrl", "thumbnail_data_url", "thumbnailUrl", "thumbnail_url"):
        value = clip.get(key) if isinstance(clip, dict) else None
        if isinstance(value, str) and value.strip():
            print(f"[DEBUG] Custom thumbnail found in clip field '{key}'. length={len(value)}")
            return value.strip(), None

    video_url = None
    if isinstance(job, dict):
        for key in ("video_url", "videoUrl", "source_url", "sourceUrl"):
            value = job.get(key)
            if isinstance(value, str) and value.strip():
                video_url = value.strip()
                break

    if not video_url and isinstance(clip, dict):
        for key in ("video_url", "videoUrl", "source_url", "sourceUrl"):
            value = clip.get(key)
            if isinstance(value, str) and value.strip():
                video_url = value.strip()
                break

    if video_url:
        yt_id = extract_youtube_id(video_url)
        if yt_id:
            for url in [
                f"https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg",
                f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg",
                f"https://img.youtube.com/vi/{yt_id}/sddefault.jpg",
            ]:
                try:
                    response = request("GET", url, timeout=15)
                    if response.ok and response.content:
                        print(f"[DEBUG] Usando thumbnail oficial do YouTube para {yt_id}: {url}")
                        return url, response.content
                except Exception as exc:
                    print(f"Falha ao baixar thumbnail oficial do vídeo {yt_id}: {exc}")

    print("[DEBUG] Nenhuma thumbnail customizada descoberta; fallback para thumbnail oficial do YouTube falhou.")
    return None, None


def upload_thumbnail_to_youtube(service, video_id: str, thumbnail_source: str | None = None, thumbnail_bytes: bytes | None = None) -> None:
    import base64, tempfile, os, time
    tmp_path = None

    try:
        if thumbnail_bytes is not None:
            img_bytes = thumbnail_bytes
            ext = "jpg"
        elif thumbnail_source and isinstance(thumbnail_source, str):
            if thumbnail_source.startswith("http"):
                # Download via HTTP
                print(f"Baixando thumbnail remota do Supabase Storage: {thumbnail_source}")
                from requests import request
                resp = request("GET", thumbnail_source)
                resp.raise_for_status()
                img_bytes = resp.content
                ext = "jpg" if "jpg" in thumbnail_source or "jpeg" in thumbnail_source else "png"
            elif "," in thumbnail_source:
                header, encoded = thumbnail_source.split(",", 1)
                img_bytes = base64.b64decode(encoded)
                ext = "jpg" if "jpeg" in header or "jpg" in header else "png"
            else:
                print("Thumbnail format not recognized (neither HTTP URL nor base64).")
                return
        else:
            print("Thumbnail source is empty or invalid.")
            return

        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as f:
            f.write(img_bytes)
            tmp_path = f.name

        # Aguarda 5 segundos para o YouTube registrar o vídeo recém-criado
        time.sleep(5)

        from googleapiclient.http import MediaFileUpload
        success = False
        for attempt in range(3):
            try:
                service.thumbnails().set(
                    videoId=video_id,
                    media_body=MediaFileUpload(tmp_path, mimetype=f"image/{ext}")
                ).execute()
                print(f"Thumbnail enviada com sucesso para o video_id: {video_id} (tentativa {attempt + 1})")
                success = True
                break
            except Exception as api_err:
                err_msg = str(api_err).lower()
                print(f"Erro na tentativa {attempt + 1} de enviar thumbnail: {api_err}")

                # Erro comum: canal sem verificação de celular para custom thumbnails
                if "unauthenticated" in err_msg or "permission" in err_msg or "forbidden" in err_msg or "not enabled" in err_msg or "403" in err_msg:
                    print("\n[AVISO CRÍTICO] O upload de thumbnails falhou com erro de permissão.")
                    print("Certifique-se de que o seu canal do YouTube possui a verificação de número de telefone habilitada.")
                    print("Acesse: https://www.youtube.com/verify para verificar a sua conta e liberar miniaturas personalizadas.\n")
                    raise RuntimeError(
                        f"Falha na configuração de thumbnails do YouTube: {api_err}"
                    ) from api_err

                if attempt < 2:
                    print("Aguardando mais 5 segundos antes de tentar novamente...")
                    time.sleep(5)
                else:
                    print(f"Falha definitiva ao enviar thumbnail para o video {video_id}")

        if not success:
            raise RuntimeError(f"Não foi possível enviar a thumbnail customizada para o vídeo {video_id} após múltiplas tentativas.")

    except Exception as e:
        print(f"Erro geral ao processar upload da thumbnail para o video {video_id}: {e}")
        raise
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)



def build_safe_youtube_title(clip: dict | None, job: dict | None = None) -> str:
    def sanitize_text(text: str) -> str:
        if not text:
            return ""
        cleaned = text.replace("\ufffd", "").replace("\uFFFD", "")
        cleaned = re.sub(r"[\u200b-\u200d\u2060\ufeff]", "", cleaned)
        cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    candidates: list[str] = []
    if isinstance(clip, dict):
        candidates.extend([
            sanitize_text(clip.get("title") or ""),
            sanitize_text(clip.get("hookQuote") or ""),
        ])
    if isinstance(job, dict):
        candidates.append(sanitize_text(job.get("video_title") or ""))

    for candidate in candidates:
        cleaned = re.sub(r"\s+", " ", candidate or "").strip()
        if cleaned and re.search(r"[A-Za-z0-9\u00C0-\u024F]", cleaned):
            cleaned = re.sub(r"[^\w\s\-\.\,\(\)\[\]@]+", " ", cleaned)
            cleaned = re.sub(r"\s+", " ", cleaned).strip()
            if cleaned:
                return cleaned[:90]

    return "Clip viral"


def upload_clip_to_youtube(file_path: Path, clip: dict, job: dict | None = None) -> str:
    custom_refresh_token = None
    custom_privacy_status = YOUTUBE_PRIVACY_STATUS
    custom_hashtags: list[str] = []
    custom_tags: list[str] = []
    print(f"[YOUTUBE] Iniciando upload do arquivo: {file_path}")
    
    if job:
        instructions_str = job.get("instructions")
        if instructions_str and instructions_str.strip().startswith("{"):
            try:
                config = json.loads(instructions_str)
                if isinstance(config, dict):
                    custom_refresh_token = config.get("youtube_refresh_token")
                    custom_privacy_status = config.get("privacy_status", YOUTUBE_PRIVACY_STATUS)
                    
                    hashtags_raw = config.get("default_hashtags", "")
                    tags_raw = config.get("default_tags", "")
                    
                    if hashtags_raw:
                        custom_hashtags = [h.strip() for h in hashtags_raw.split(",") if h.strip()]
                    if tags_raw:
                        custom_tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
            except Exception as e:
                print("Error parsing job instructions JSON config:", e)

    service = get_youtube_service(custom_refresh_token)
    if service is None:
        missing_config = get_missing_youtube_config(custom_refresh_token)
        missing_text = ", ".join(missing_config)
        raise RuntimeError(f"YouTube auto-publish não está configurado. Faltando: {missing_text}")

    print(f"[YOUTUBE] Autenticado com sucesso para o canal do YouTube.")

    from googleapiclient.http import MediaFileUpload

    def sanitize_text(text: str) -> str:
        """Remove caracteres unicode inválidos (replacement char \ufffd) que causam erro 400 na API do YouTube."""
        if not text:
            return text
        cleaned = text.replace("\ufffd", "").replace("\uFFFD", "")
        cleaned = re.sub(r"[\u200b-\u200d\u2060\ufeff]", "", cleaned)
        cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    # 1. Optimize Title for CTR (Click-Through Rate)
    raw_title = build_safe_youtube_title(clip, job)

    triggers = clip.get("triggers") or []

    title = re.sub(r"\s+", " ", raw_title).strip()[:90]
    if not title.strip():
        title = "Clip viral"

    # 2. Build high-converting SEO Description
    hook = sanitize_text(clip.get("hookQuote") or "").strip()
    
    desc_lines = []
    if hook:
        desc_lines.append(f'"{hook.upper()}" 🚀')
        desc_lines.append("")
        
    desc_lines.append("📌 Inscreva-se no canal para não perder os próximos cortes virais!")
    desc_lines.append("🔔 Deixe seu like e ative as notificações para apoiar o canal.")
    desc_lines.append("")
    
    # Generate relevant hashtags based on triggers
    hashtags = ["#shorts", "#viral", "#corte"]
    if custom_hashtags:
        hashtags.extend(custom_hashtags)
    else:
        for t in triggers:
            if t == "humor":
                hashtags.extend(["#humor", "#engraçado", "#comedia"])
            elif t == "controversy":
                hashtags.extend(["#polemica", "#debate", "#reflexao"])
            elif t == "emotional":
                hashtags.extend(["#motivacao", "#inspiracao", "#superacao"])
            elif t == "cliffhanger":
                hashtags.extend(["#curiosidade", "#suspense", "#fatos"])
            
    desc_lines.append(" ".join(list(set(hashtags))))
    description = sanitize_text("\n".join(desc_lines).strip())[:5000]

    # 3. Optimize tags for SEO searchability
    tags_list = [sanitize_text(t).strip() for t in triggers if t] + ["cortes", "viral", "shorts", "retencao", "hookhustle"]
    if custom_tags:
        tags_list.extend([sanitize_text(t).strip() for t in custom_tags if t])
    tags = [t for t in list(set(tags_list)) if t][:50]

    print(f"  -> Titulo final: {title!r}")
    print(f"[YOUTUBE] Body title payload: {title}")

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": "22",
        },
        "status": {
            "privacyStatus": custom_privacy_status,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(str(file_path), chunksize=-1, resumable=True, mimetype="video/mp4")
    request = service.videos().insert(part="snippet,status", body=body, media_body=media)
    try:
        response = request.execute()
    except Exception as api_exc:
        error_text = str(api_exc)
        print(f"[YOUTUBE] Falha na API do YouTube: {error_text}")
        if "auth" in error_text.lower() or "unauthorized" in error_text.lower() or "invalid_grant" in error_text.lower():
            raise RuntimeError(f"Falha de autenticação do YouTube: {error_text}") from api_exc
        if "forbidden" in error_text.lower() or "permission" in error_text.lower() or "403" in error_text.lower():
            raise RuntimeError(f"Permissão negada pelo YouTube: {error_text}") from api_exc
        raise RuntimeError(f"Erro ao enviar vídeo ao YouTube: {error_text}") from api_exc
    
    video_id = response['id']
    thumbnail_source, thumbnail_bytes = get_clip_thumbnail_source(clip, job)
    if thumbnail_source or thumbnail_bytes:
        print(f"Processando thumbnail para o video_id: {video_id}...")
        if thumbnail_source and thumbnail_source.startswith("http") and not thumbnail_source.startswith("data:"):
            print(f"Usando thumbnail recebida no job: {thumbnail_source}")
        elif thumbnail_bytes:
            print("Usando thumbnail oficial do vídeo como fallback para o upload no YouTube.")
        else:
            print("Usando thumbnail recebida no job para o upload no YouTube.")
        upload_thumbnail_to_youtube(service, video_id, thumbnail_source, thumbnail_bytes)
    else:
        print(f"Nenhuma thumbnail válida encontrada para o clipe {clip.get('title', 'sem título')}; pulando upload de miniatura.")
        
    return f"https://www.youtube.com/watch?v={video_id}"




def sanitize_filename(text: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in "-_ ." else "_" for ch in text)
    return safe.strip().replace(" ", "_")[:120] or "clip"


def parse_timestamp(ts: str) -> str:
    parts = [int(p) for p in ts.split(":") if p.isdigit()]
    if len(parts) == 3:
        return f"{parts[0]:02d}:{parts[1]:02d}:{parts[2]:02d}"
    if len(parts) == 2:
        return f"00:{parts[0]:02d}:{parts[1]:02d}"
    return f"00:00:{parts[0]:02d}" if parts else "00:00:00"


def run_command(command: list[str]) -> None:
    print("$", " ".join(command))
    subprocess.run(command, check=True)


def download_video(video_url: str, destination: Path) -> Path:
    output_file = destination / "source_video.%(ext)s"
    run_command(["yt-dlp", "-f", "mp4", "-o", str(output_file), video_url])
    matches = list(destination.glob("source_video.*"))
    if not matches:
        raise RuntimeError("Não foi possível baixar o arquivo de vídeo.")
    return matches[0]


def render_clip(source_path: Path, clip: dict, output_dir: Path) -> Path:
    start = parse_timestamp(clip["startTimestamp"])
    end = parse_timestamp(clip["endTimestamp"])
    title = sanitize_filename(clip.get("title", "clip"))
    output_file = output_dir / f"{title}_{start.replace(':', '-')}_{end.replace(':', '-')}.mp4"

    cmd = [
        "ffmpeg",
        "-y",
        "-threads",
        str(FFMPEG_THREADS),
        "-ss",
        start,
        "-to",
        end,
        "-i",
        str(source_path),
    ]

    # Build video filtergraph
    if VIDEO_VERTICAL_STYLE == "blurred":
        # Use a lighter, faster vertical crop with a subtle blur so the render stays quick.
        v_filter = (
            f"[0:v]scale={FFMPEG_SCALE_WIDTH}:{FFMPEG_SCALE_HEIGHT}:force_original_aspect_ratio=increase,crop={FFMPEG_SCALE_WIDTH}:{FFMPEG_SCALE_HEIGHT},boxblur=6:1[bg];"
            f"[0:v]scale={FFMPEG_SCALE_WIDTH}:-2[fg];"
            "[bg][fg]overlay=(W-w)/2:(H-h)/2"
        )
        if APPLY_ANTI_BLOCK:
            v_filter += ",setpts=PTS/1.01,eq=contrast=1.01:brightness=0.005"
        v_filter += "[v]"
        cmd.extend(["-filter_complex", v_filter, "-map", "[v]", "-map", "0:a"])
    else:
        # Traditional black padding style with a lighter resolution target.
        v_filter = (
            f"scale='if(gt(a,9/16),{FFMPEG_SCALE_WIDTH},-2)':'if(gt(a,9/16),-2,{FFMPEG_SCALE_HEIGHT})',"
            f"pad={FFMPEG_SCALE_WIDTH}:{FFMPEG_SCALE_HEIGHT}:(ow-iw)/2:(oh-ih)/2:black"
        )
        if APPLY_ANTI_BLOCK:
            v_filter += ",setpts=PTS/1.01,eq=contrast=1.01:brightness=0.005"
        cmd.extend(["-vf", v_filter])

    # Build audio filters and metadata stripping
    if APPLY_ANTI_BLOCK:
        cmd.extend([
            "-af", "atempo=1.01",
            "-map_metadata", "-1"
        ])

    cmd.extend([
        "-c:v", "libx264",
        "-preset", FFMPEG_PRESET,
        "-crf", str(FFMPEG_CRF),
        "-c:a", "aac",
        "-b:a", "128k",
        str(output_file),
    ])

    run_command(cmd)
    return output_file



def publish_tiktok_flow(files_to_publish: list[Path], clip_items: list[dict], tiktok_config: dict, job_id: str, clip_index: int | None = None) -> None:
    import webbrowser
    
    print("\nOpening TikTok Creator Studio upload page...")
    webbrowser.open("https://www.tiktok.com/creator-center/upload?from=upload")
    
    # Build a nice caption text with hashtags to copy to clipboard
    caption_lines = []
    clips_to_process = [clip_items[clip_index]] if (clip_index is not None and clip_index < len(clip_items)) else clip_items
    
    for i, clip in enumerate(clips_to_process):
        idx = clip_index if clip_index is not None else i
        hook = (clip.get("hookQuote") or "").strip()
        title = (clip.get("title") or "").strip()
        
        # Combine hashtags
        tags = ["#shorts", "#tiktok", "#viral"]
        custom_hashtags_str = tiktok_config.get("default_hashtags", "")
        if custom_hashtags_str:
            tags.extend([h.strip() for h in custom_hashtags_str.split(",") if h.strip()])
        unique_tags = list(set(tags))
        
        caption = f"{title}\n\n\"{hook}\"\n\n{' '.join(unique_tags)}"
        caption_lines.append(caption)
        
        # Print caption to terminal
        print(f"\n[LEGENDAS DO CLIPE {idx+1}] (A primeira foi copiada automaticamente):")
        print(caption)
        print("-" * 45)
        
    # Copy the first clip's caption to clipboard
    if caption_lines:
        first_caption = caption_lines[0].strip()
        try:
            # Copy via Windows clip command
            process = subprocess.Popen('clip', stdin=subprocess.PIPE, shell=True)
            process.communicate(input=first_caption.encode('utf-8'))
            print("Legenda do clipe copiada para a area de transferencia!")
        except Exception as clip_err:
            print("Failed to copy to clipboard:", clip_err)

    # Open the file's folder and select the file
    if files_to_publish:
        file_idx = clip_index if (clip_index is not None and clip_index < len(files_to_publish)) else 0
        if file_idx is not None and file_idx < len(files_to_publish):
            first_file = files_to_publish[file_idx]
            if first_file and first_file.exists():
                try:
                    print(f"Revealing file in Explorer: {first_file}")
                    subprocess.run(["explorer.exe", "/select,", str(first_file)])
                except Exception as explorer_err:
                    print("Failed to open Explorer:", explorer_err)

    # Update clip_items
    tiktok_profile_name = tiktok_config.get('tiktok_profile_name', 'TikTok')
    if clip_index is not None and clip_index < len(clip_items):
        clip_items[clip_index]["tiktok_profile"] = tiktok_profile_name
    else:
        for clip in clip_items:
            clip["tiktok_profile"] = tiktok_profile_name

    # Update job to completed status with a message showing it was sent to TikTok
    original_paths = " | ".join(str(f) for f in files_to_publish if f)
    new_output = f"{original_paths} | TikTok: {tiktok_profile_name} (Aguardando upload no Creator Studio. Legenda copiada!)"
    
    update_job(job_id, {
        "status": "completed",
        "output_path": new_output,
        "completed_at": utc_now_iso(),
        "error_message": None,
        "clip_items": clip_items,
    })
    print(f"TikTok publish flow for job {job_id} handled successfully.\n")


def process_render_job(job: dict) -> None:
    """Process a rendering job (status: pending)."""
    job_id = job["id"]
    print(f"Processing render job: {job_id}")
    clip_items = job.get("clip_items") or []
    rendered_files = []

    try:
        workspace = OUTPUT_DIR / job_id
        workspace.mkdir(parents=True, exist_ok=True)

        update_job(job_id, {"output_path": "Progress: Baixando vídeo original do YouTube..."})
        video_file = download_video(job["video_url"], workspace)

        for i, clip in enumerate(clip_items):
            progress_text = f"Progress: Renderizando clipe {i+1} de {len(clip_items)}..."
            print(progress_text)
            update_job(job_id, {"output_path": progress_text})

            rendered = render_clip(video_file, clip, OUTPUT_DIR)
            clip["local_path"] = str(rendered)
            rendered_files.append(rendered)

        instructions_str = job.get("instructions")
        is_tiktok = False
        tiktok_config = {}
        if instructions_str and instructions_str.strip().startswith("{"):
            try:
                config = json.loads(instructions_str)
                if isinstance(config, dict) and config.get("target_platform") == "tiktok":
                    is_tiktok = True
                    tiktok_config = config
            except Exception:
                pass

        if is_tiktok:
            publish_tiktok_flow(rendered_files, clip_items, tiktok_config, job_id)
            print(f"Render & TikTok publish job {job_id} completed.")
            return

        youtube_links = []
        is_youtube = False
        custom_refresh_token = None

        if instructions_str and instructions_str.strip().startswith("{"):
            try:
                config = json.loads(instructions_str)
                if isinstance(config, dict):
                    target_platform = config.get("target_platform")
                    if target_platform in ("tiktok", "local"):
                        is_youtube = False
                    else:
                        custom_refresh_token = config.get("youtube_refresh_token")
                        is_youtube = True
            except Exception:
                pass
        elif YOUTUBE_AUTO_PUBLISH:
            is_youtube = True

        if is_youtube or custom_refresh_token:
            upload_errors = []
            for i, rendered in enumerate(rendered_files):
                try:
                    upload_progress = f"Progress: Enviando clipe {i+1} de {len(rendered_files)} para o YouTube..."
                    print(upload_progress)
                    update_job(job_id, {"output_path": upload_progress})

                    clip = clip_items[i]
                    youtube_url = upload_clip_to_youtube(rendered, clip, job)
                    clip["youtube_url"] = youtube_url
                    youtube_links.append(youtube_url)
                    print(f"Published to YouTube: {youtube_url}")
                except Exception as upload_exc:
                    error_text = f"Falha no upload do clipe {i+1}: {upload_exc}"
                    print(error_text)
                    upload_errors.append(error_text)

            if upload_errors:
                raise RuntimeError(" | ".join(upload_errors))

        rendered_files_strs = [str(f) for f in rendered_files]
        original_paths = " | ".join(rendered_files_strs) if rendered_files_strs else str(OUTPUT_DIR)

        all_yt_links = [clip["youtube_url"] for clip in clip_items if clip.get("youtube_url")]
        output_paths = original_paths
        if all_yt_links:
            output_paths = f"{original_paths} | YouTube: {' | '.join(all_yt_links)}"

        all_yt_links = [clip["youtube_url"] for clip in clip_items if clip.get("youtube_url")]
        if is_youtube and not all_yt_links:
            raise RuntimeError("Nenhum vídeo foi publicado no YouTube. O worker finalizou sem gerar links de publicação.")

        update_job(job_id, {
            "status": "done",
            "output_path": output_paths,
            "completed_at": utc_now_iso(),
            "error_message": None,
            "clip_items": clip_items,
        })
        print(f"Render job {job_id} completed. Files: {len(rendered_files)}")
    except Exception as exc:
        update_job(job_id, {
            "status": "failed",
            "output_path": f"Erro: {exc}",
            "completed_at": utc_now_iso(),
            "error_message": str(exc),
            "clip_items": clip_items,
        })
        print(f"Render job {job_id} failed: {exc}")


def process_publish_job(job: dict) -> None:
    """Process a publish request job (status: published_requested)."""
    job_id = job["id"]
    print(f"Processing publish request: {job_id}")

    instructions_str = job.get("instructions")
    is_tiktok = False
    tiktok_config = {}
    custom_refresh_token = None
    clip_index = None

    if instructions_str and instructions_str.strip().startswith("{"):
        try:
            config = json.loads(instructions_str)
            if isinstance(config, dict):
                clip_index = config.get("clip_index")
                if config.get("target_platform") == "tiktok":
                    is_tiktok = True
                    tiktok_config = config
                else:
                    custom_refresh_token = config.get("youtube_refresh_token")
        except Exception as e:
            print("Error parsing instructions JSON:", e)

    clip_items = job.get("clip_items") or []

    # Get the output files to publish (try clip_items local paths first, fallback to output_path)
    files_to_publish = []
    for clip in clip_items:
        local_path_str = clip.get("local_path")
        if local_path_str:
            files_to_publish.append(Path(local_path_str))
        else:
            files_to_publish.append(None)

    # Fallback to output_path parsing if no local_paths found
    if not any(files_to_publish):
        files_to_publish = []
        output_path = job.get("output_path", "")
        for part in output_path.split(" | "):
            part_str = part.strip()
            if not part_str.startswith("YouTube:") and not part_str.startswith("Progress:") and not part_str.startswith("TikTok:") and part_str:
                files_to_publish.append(Path(part_str))

    if is_tiktok:
        publish_tiktok_flow(files_to_publish, clip_items, tiktok_config, job_id, clip_index)
        return

    # Otherwise it's YouTube
    missing_config = get_missing_youtube_config(custom_refresh_token)
    if missing_config:
        missing_text = ", ".join(missing_config)
        raise RuntimeError(
            f"Publicacao no YouTube nao configurada neste worker. Ajuste: {missing_text}"
        )

    youtube_links = []
    original_paths = " | ".join(str(f) for f in files_to_publish if f)

    for i, file_path in enumerate(files_to_publish):
        if clip_index is not None and i != clip_index:
            continue

        if file_path and file_path.exists() and i < len(clip_items):
            try:
                upload_progress = f"Progress: Enviando clipe {i+1} de {len(files_to_publish)} para o YouTube..."
                print(upload_progress)
                update_job(job_id, {"output_path": f"{original_paths} | {upload_progress}"})
                
                clip = clip_items[i]
                youtube_url = upload_clip_to_youtube(file_path, clip, job)
                clip["youtube_url"] = youtube_url
                youtube_links.append(youtube_url)
                print(f"Published to YouTube: {youtube_url}")
            except Exception as upload_exc:
                print(f"YouTube upload failed for {file_path}: {upload_exc}")
                raise

    # Reconstruct output_path YouTube links from all clip_items that have a youtube_url
    all_yt_links = [clip["youtube_url"] for clip in clip_items if clip.get("youtube_url")]
    if not all_yt_links:
        raise RuntimeError("Nenhum vídeo foi publicado no YouTube. Nenhum link de vídeo foi retornado pela API.")

    new_output = original_paths
    if all_yt_links:
        new_output = f"{original_paths} | YouTube: {' | '.join(all_yt_links)}"

    update_job(job_id, {
        "status": "completed",
        "output_path": new_output,
        "completed_at": utc_now_iso(),
        "error_message": None,
        "clip_items": clip_items,
    })
    print(f"Publish job {job_id} completed. YouTube links: {len(youtube_links)}")



def run_worker() -> None:
    print(f"Local render worker started. Polling every {POLL_SECONDS}s.")
    concurrency = int(os.environ.get("CLIP_WORKER_CONCURRENCY", "1"))
    import threading

    def _process_job_safe(job: dict) -> None:
        job_id = job.get("id")
        current_status = job.get("status")
        try:
            if current_status == "pending":
                process_render_job(job)
            elif current_status == "published_requested":
                process_publish_job(job)
            else:
                print(f"Unknown job status: {current_status}")
        except Exception as exc:
            print(f"Worker job error ({job_id}):", exc)
            try:
                update_job(job_id, {
                    "status": "failed",
                    "error_message": str(exc),
                    "completed_at": utc_now_iso(),
                })
            except Exception as inner:
                print("Could not mark job as failed:", inner)

    while True:
        try:
            recover_stale_jobs()

            if concurrency <= 1:
                job = fetch_pending_job()
                if not job:
                    print("No pending jobs. Waiting...")
                    time.sleep(POLL_SECONDS)
                    continue

                job_id = job["id"]
                current_status = job["status"]
                print(f"Found {current_status} job: {job_id}")

                if not claim_job(job_id, current_status):
                    print("Job already processed by another worker. Continuing...")
                    continue

                _process_job_safe(job)
                continue

            # concurrency > 1: fetch multiple jobs and process in parallel threads
            jobs = fetch_pending_jobs(limit=concurrency)
            if not jobs:
                print("No pending jobs. Waiting...")
                time.sleep(POLL_SECONDS)
                continue

            threads: list[threading.Thread] = []
            for job in jobs:
                job_id = job.get("id")
                current_status = job.get("status")
                if not job_id:
                    continue
                if not claim_job(job_id, current_status):
                    print(f"Job {job_id} already claimed by another worker.")
                    continue

                print(f"Claimed job {job_id} (status={current_status}) - processing in background thread")
                t = threading.Thread(target=_process_job_safe, args=(job,), daemon=True)
                t.start()
                threads.append(t)

            # Don't block here — continue polling; background threads handle processing.
            time.sleep(POLL_SECONDS)

        except Exception as exc:
            print("Worker error:", exc)
            time.sleep(POLL_SECONDS)


def ensure_single_instance(port: int = 59888) -> None:
    """Ensure that only one instance of the worker is running on this machine."""
    import socket
    global _lock_socket
    try:
        _lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # Bind to localhost to hold the lock without exposing external port
        _lock_socket.bind(("127.0.0.1", port))
    except socket.error:
        print(f"\n[ERRO] Outra instancia do worker.py ja esta rodando nesta maquina.")
        print("Use PARAR_TRABALHO.bat se quiser parar o worker ativo antes de iniciar outro.\n")
        sys.exit(0)


if __name__ == "__main__":
    ensure_single_instance()
    run_worker()

