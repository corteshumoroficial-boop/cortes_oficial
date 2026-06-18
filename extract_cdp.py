#!/usr/bin/env python3
"""
Extract thumbnail PNG files from browser window data
This script reads base64 data from browser variables and saves as PNG files
"""
import sys
import json

# This script will be called from Playwright context
# Expected environment: window.capturedClip1 through window.capturedClip5

extraction_code = """
const clips = [];
for (let i = 1; i <= 5; i++) {
  const varName = 'capturedClip' + i;
  const data = window[varName];
  if (data) {
    const base64 = data.replace('data:image/png;base64,', '');
    clips.push({
      clip: i,
      base64: base64
    });
  }
}
return clips;
"""

print(extraction_code)
print("\n# Usage: This code should be executed in Playwright context to export thumbnails")
print("# Each clip will be available as a base64 string that can be decoded to PNG")
