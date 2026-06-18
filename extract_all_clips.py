#!/usr/bin/env python3
import re
import base64

# Read all three files with captured data
files = [
    r'c:\Users\user\AppData\Roaming\Code\User\workspaceStorage\0f44f9aa51bdc7ea6b649b36646cbfd5\GitHub.copilot-chat\chat-session-resources\6b5a96eb-3a01-4891-b0b8-3149c37a9c82\toolu_bdrk_018nByimzUvRHWqo3dmJZ36C__vscode-1781231402317\content.txt',
    r'c:\Users\user\AppData\Roaming\Code\User\workspaceStorage\0f44f9aa51bdc7ea6b649b36646cbfd5\GitHub.copilot-chat\chat-session-resources\6b5a96eb-3a01-4891-b0b8-3149c37a9c82\toolu_bdrk_011TWJZVEaaoYQYNdUHpmc3A__vscode-1781231402331\content.txt'
]

all_matches = []

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Find all base64 image data - looking for both "data" and "dataUrl" patterns
        matches = re.findall(r'data:image/png;base64,([A-Za-z0-9+/=]{100,})', content)
        all_matches.extend(matches)
        print(f"Found {len(matches)} matches in {file_path}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

print(f"\nTotal unique image data found: {len(all_matches)}")

# Save each as PNG (deduplicate by size)
seen_sizes = set()
saved_count = 0

for idx, base64_str in enumerate(all_matches):
    if len(base64_str) in seen_sizes:
        continue  # Skip duplicates
    
    seen_sizes.add(len(base64_str))
    
    try:
        png_data = base64.b64decode(base64_str)
        filename = f'thumbnail_clip_{saved_count + 1}.png'
        with open(filename, 'wb') as out:
            out.write(png_data)
        print(f'✓ Saved {filename} ({len(png_data)} bytes)')
        saved_count += 1
        
        if saved_count >= 5:
            break
    except Exception as e:
        print(f'✗ Error: {e}')

print(f"\n✓ Successfully saved {saved_count} thumbnail PNG files")
