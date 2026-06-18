#!/usr/bin/env python3
import re
import base64
import sys

# Path to the cached tool output
file_path = r'c:\Users\user\AppData\Roaming\Code\User\workspaceStorage\0f44f9aa51bdc7ea6b649b36646cbfd5\GitHub.copilot-chat\chat-session-resources\6b5a96eb-3a01-4891-b0b8-3149c37a9c82\toolu_bdrk_01GMk5SwMzAAshu4bevhoQ8G__vscode-1781231402262\content.txt'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Find all data URLs
    matches = re.findall(r'data:image/png;base64,([A-Za-z0-9+/=]+)', content)
    
    print(f"Found {len(matches)} thumbnails")
    
    # Save each as PNG
    for idx, base64_str in enumerate(matches[:5], 1):
        try:
            png_data = base64.b64decode(base64_str)
            filename = f'thumbnail_clip_{idx}.png'
            with open(filename, 'wb') as out:
                out.write(png_data)
            print(f'✓ Saved clip {idx}: {filename} ({len(png_data)} bytes)')
        except Exception as e:
            print(f'✗ Error saving clip {idx}: {e}')
            
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
