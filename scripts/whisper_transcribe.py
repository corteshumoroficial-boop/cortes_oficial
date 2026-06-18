#!/usr/bin/env python3
"""
Transcrição local usando faster-whisper + yt-dlp.
Uso: python whisper_transcribe.py <youtube_url_ou_video_id>
Saída: JSON para stdout com { segments: [{offset, text}] } ou { error: "..." }
IMPORTANTE: Todo output de debug/progresso vai para STDERR, apenas JSON vai para STDOUT.
"""

import sys
import json
import os
import subprocess

def eprint(*args, **kwargs):
    """Print para stderr (não contamina o JSON do stdout)."""
    print(*args, file=sys.stderr, **kwargs)

def find_ytdlp():
    """Tenta encontrar o executável yt-dlp."""
    import shutil
    # Tentar no PATH primeiro
    found = shutil.which("yt-dlp")
    if found:
        return found
    # Tentar caminhos comuns no Windows
    candidates = [
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Python", "Python314", "Scripts", "yt-dlp.exe"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Python", "Python313", "Scripts", "yt-dlp.exe"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Python", "Python312", "Scripts", "yt-dlp.exe"),
        r"C:\Python314\Scripts\yt-dlp.exe",
        r"C:\Python313\Scripts\yt-dlp.exe",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    return "yt-dlp"  # fallback — tentar mesmo assim

def download_audio(url: str, output_path: str, ytdlp_cmd: str) -> bool:
    """Baixa o áudio do vídeo usando yt-dlp."""
    try:
        eprint(f"⬇️  Baixando áudio de: {url}")
        result = subprocess.run(
            [
                ytdlp_cmd,
                "-f", "bestaudio/best",
                "--extract-audio",
                "--audio-format", "mp3",
                "--audio-quality", "5",
                "-o", output_path,
                "--no-playlist",
                "--quiet",
                url,
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            eprint(f"⚠️  yt-dlp stderr: {result.stderr[:500]}")
        return os.path.exists(output_path)
    except Exception as e:
        eprint(f"⚠️  Erro ao chamar yt-dlp: {e}")
        return False

def transcribe(audio_path: str) -> list:
    """Transcreve o áudio usando faster-whisper."""
    from faster_whisper import WhisperModel
    
    eprint("🤖 Carregando modelo Whisper tiny (CPU)...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    
    eprint("🎙️  Transcrevendo áudio...")
    segments, info = model.transcribe(audio_path, beam_size=5)
    
    result = []
    for segment in segments:
        result.append({
            "offset": int(segment.start * 1000),
            "text": segment.text.strip()
        })
        eprint(f"   [{segment.start:.1f}s] {segment.text.strip()[:60]}")
    
    eprint(f"✅ {len(result)} segmentos transcritos.")
    return result

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Uso: python whisper_transcribe.py <youtube_url>"}))
        sys.exit(1)
    
    url = sys.argv[1]
    if not url.startswith("http"):
        url = f"https://www.youtube.com/watch?v={url}"
    
    # Extrair video ID para nomear o arquivo
    video_id = "audio"
    if "v=" in url:
        video_id = url.split("v=")[-1].split("&")[0]
    elif "youtu.be/" in url:
        video_id = url.split("youtu.be/")[-1].split("?")[0]
    
    # Criar pasta temp
    temp_dir = os.path.join(os.getcwd(), ".temp-captions")
    os.makedirs(temp_dir, exist_ok=True)
    
    audio_path = os.path.join(temp_dir, f"audio_{video_id}.mp3")
    ytdlp_cmd = find_ytdlp()
    eprint(f"🔧 Usando yt-dlp: {ytdlp_cmd}")
    
    try:
        # 1. Baixar áudio
        success = download_audio(url, audio_path, ytdlp_cmd)
        if not success:
            print(json.dumps({"error": "Falha ao baixar o áudio. Verifique se yt-dlp e ffmpeg estão instalados."}))
            sys.exit(1)
        
        file_size_mb = os.path.getsize(audio_path) / 1024 / 1024
        eprint(f"📁 Áudio baixado: {file_size_mb:.1f}MB")
        
        # 2. Transcrever
        segments = transcribe(audio_path)
        
        if not segments:
            print(json.dumps({"error": "Whisper não retornou nenhum segmento. O vídeo pode não ter fala."}))
            sys.exit(1)
        
        # Única saída para stdout: o JSON com os resultados
        print(json.dumps({"segments": segments}))
        
    except ImportError:
        print(json.dumps({
            "error": "faster-whisper não está instalado. Execute: python -m pip install faster-whisper"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    finally:
        # Limpar arquivo de áudio
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception:
            pass

if __name__ == "__main__":
    main()
