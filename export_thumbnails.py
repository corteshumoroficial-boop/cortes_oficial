#!/usr/bin/env python3
import subprocess
import sys
import json
import base64
import time

# We'll extract each base64 from the browser and save

# Define the base64 data for each clip (we'll get this from browser console)
print("Extracting thumbnails from browser...")

# Use playwright to export data
import asyncio
from pathlib import Path

# Since we can't directly access window variables from Python,
# we'll create a temporary HTML file that the browser can download data from

html_content = '''<!DOCTYPE html>
<html>
<head><title>Export Thumbnails</title></head>
<body>
<script>
// This will be executed in the browser console to export thumbnails
const allData = [];
for (let i = 1; i <= 5; i++) {
  const varName = 'capturedClip' + i;
  const data = window[varName];
  if (data) {
    allData.push({
      clip: i,
      base64: data.replace('data:image/png;base64,', '')
    });
  }
}

// Log as JSON
console.log(JSON.stringify(allData));

// Or download as files
allData.forEach(item => {
  const binaryString = atop(item.base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], {type: 'image/png'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thumbnail_clip_${item.clip}.png`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
});
</script>
</body>
</html>
'''

print("HTML snippet ready")
print("The thumbnails will need to be extracted via CDP console")
