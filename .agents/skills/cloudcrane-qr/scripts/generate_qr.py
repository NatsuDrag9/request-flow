#!/usr/bin/env python3
"""
CloudCrane QR Code Generator
Converts any live CloudCrane deployment URL (*.cloudcrane.ai) into:
1. A crisp, high-resolution PNG image
2. A scalable SVG vector graphic
3. An embeddable Generative UI install card (HTML)
"""

import sys
import os
import re
from PIL import Image, ImageDraw

def generate_qr(url, output_dir, app_name="CloudCrane App"):
    url = url.strip()
    if not re.search(r'\.cloudcrane\.ai', url):
        print(f"Warning: '{url}' does not appear to be a .cloudcrane.ai URL, but proceeding anyway.")

    data = url.encode('utf-8')
    data_len = len(data)

    if data_len <= 53:
        version = 3
        total_cw, data_cw, ec_cw = 70, 55, 15
        align_pos = [22]
    elif data_len <= 78:
        version = 4
        total_cw, data_cw, ec_cw = 100, 80, 20
        align_pos = [26]
    elif data_len <= 106:
        version = 5
        total_cw, data_cw, ec_cw = 134, 108, 26
        align_pos = [30]
    else:
        raise ValueError(f"URL length ({data_len} bytes) exceeds maximum supported (106 bytes).")

    size = 17 + 4 * version

    # 1. Bitstream encoding
    bits = []
    def put_bits(val, length):
        for i in range(length - 1, -1, -1):
            bits.append((val >> i) & 1)

    put_bits(0b0100, 4)  # Byte mode
    put_bits(data_len, 8)  # Character count
    for b in data:
        put_bits(b, 8)

    rem = data_cw * 8 - len(bits)
    put_bits(0, min(4, rem))  # Terminator

    if len(bits) % 8 != 0:
        put_bits(0, 8 - (len(bits) % 8))

    pads = [0xEC, 0x11]
    p_idx = 0
    while len(bits) < data_cw * 8:
        put_bits(pads[p_idx], 8)
        p_idx = 1 - p_idx

    data_codewords = []
    for i in range(0, len(bits), 8):
        val = 0
        for j in range(8):
            val = (val << 1) | bits[i + j]
        data_codewords.append(val)

    # 2. Reed-Solomon Error Correction
    EXP = [0] * 512
    LOG = [0] * 256
    x = 1
    for i in range(255):
        EXP[i] = x
        EXP[i + 255] = x
        LOG[x] = i
        x = (x << 1) ^ (0x11d if (x & 0x80) else 0)

    def gf_mul(a, b):
        if a == 0 or b == 0: return 0
        return EXP[LOG[a] + LOG[b]]

    gen = [1]
    for i in range(ec_cw):
        p = EXP[i]
        next_g = [0] * (len(gen) + 1)
        for j, c in enumerate(gen):
            next_g[j] ^= gf_mul(c, p)
            next_g[j + 1] ^= c
        gen = next_g

    g_rev = gen[::-1]
    ec = [0] * ec_cw
    for byte in data_codewords:
        factor = byte ^ ec[0]
        ec = ec[1:] + [0]
        if factor != 0:
            for j in range(ec_cw):
                ec[j] ^= gf_mul(g_rev[j + 1], factor)

    all_codewords = data_codewords + ec
    final_bits = []
    for cw in all_codewords:
        for i in range(7, -1, -1):
            final_bits.append((cw >> i) & 1)

    # 3. Matrix & Function patterns
    matrix = [[0] * size for _ in range(size)]
    is_fn = [[False] * size for _ in range(size)]

    def set_fn(r, c, v):
        matrix[r][c] = v
        is_fn[r][c] = True

    def place_finder(top_r, left_c):
        for r in range(-1, 8):
            for c in range(-1, 8):
                nr, nc = top_r + r, left_c + c
                if 0 <= nr < size and 0 <= nc < size:
                    is_fn[nr][nc] = True
                    if 0 <= r <= 6 and 0 <= c <= 6:
                        if r in (0, 6) or c in (0, 6) or (2 <= r <= 4 and 2 <= c <= 4):
                            matrix[nr][nc] = 1
                        else:
                            matrix[nr][nc] = 0
                    else:
                        matrix[nr][nc] = 0

    place_finder(0, 0)
    place_finder(0, size - 7)
    place_finder(size - 7, 0)

    for ar in align_pos:
        for ac in align_pos:
            if is_fn[ar][ac]: continue
            for r in range(-2, 3):
                for c in range(-2, 3):
                    nr, nc = ar + r, ac + c
                    is_fn[nr][nc] = True
                    if abs(r) == 2 or abs(c) == 2 or (r == 0 and c == 0):
                        matrix[nr][nc] = 1
                    else:
                        matrix[nr][nc] = 0

    for i in range(size):
        if not is_fn[6][i]: set_fn(6, i, 1 if i % 2 == 0 else 0)
        if not is_fn[i][6]: set_fn(i, 6, 1 if i % 2 == 0 else 0)

    set_fn(4 * version + 9, 8, 1)

    for i in range(9):
        set_fn(8, i, 0)
        set_fn(i, 8, 0)
    for i in range(size - 8, size):
        set_fn(8, i, 0)
    for i in range(size - 7, size):
        set_fn(i, 8, 0)

    b_idx = 0
    right = size - 1
    up = True
    while right > 0:
        if right == 6: right -= 1
        vert_range = range(size - 1, -1, -1) if up else range(size)
        for r in vert_range:
            for c in (right, right - 1):
                if not is_fn[r][c]:
                    if b_idx < len(final_bits):
                        matrix[r][c] = final_bits[b_idx]
                        b_idx += 1
                    else:
                        matrix[r][c] = 0
        up = not up
        right -= 2

    # 4. Mask Evaluation
    def get_mask_bit(mask_idx, r, c):
        if mask_idx == 0: return (r + c) % 2 == 0
        if mask_idx == 1: return r % 2 == 0
        if mask_idx == 2: return c % 3 == 0
        if mask_idx == 3: return (r + c) % 3 == 0
        if mask_idx == 4: return (r // 2 + c // 3) % 2 == 0
        if mask_idx == 5: return ((r * c) % 2 + (r * c) % 3) == 0
        if mask_idx == 6: return (((r * c) % 2 + (r * c) % 3) % 2) == 0
        if mask_idx == 7: return (((r + c) % 2 + (r * c) % 3) % 2) == 0
        return False

    def compute_penalty(mat):
        penalty = 0
        for r in range(size):
            run_color, run_len = mat[r][0], 1
            for c in range(1, size):
                if mat[r][c] == run_color: run_len += 1
                else:
                    if run_len >= 5: penalty += 3 + (run_len - 5)
                    run_color, run_len = mat[r][c], 1
            if run_len >= 5: penalty += 3 + (run_len - 5)

        for c in range(size):
            run_color, run_len = mat[0][c], 1
            for r in range(1, size):
                if mat[r][c] == run_color: run_len += 1
                else:
                    if run_len >= 5: penalty += 3 + (run_len - 5)
                    run_color, run_len = mat[r][c], 1
            if run_len >= 5: penalty += 3 + (run_len - 5)

        for r in range(size - 1):
            for c in range(size - 1):
                if mat[r][c] == mat[r+1][c] == mat[r][c+1] == mat[r+1][c+1]:
                    penalty += 3

        pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]
        pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1]
        for r in range(size):
            for c in range(size - 10):
                sub = [mat[r][c + k] for k in range(11)]
                if sub == pat1 or sub == pat2: penalty += 40
        for c in range(size):
            for r in range(size - 10):
                sub = [mat[r + k][c] for k in range(11)]
                if sub == pat1 or sub == pat2: penalty += 40

        total_modules = size * size
        dark_modules = sum(mat[r][c] for r in range(size) for c in range(size))
        percent = (dark_modules * 100) // total_modules
        penalty += (abs(percent - 50) // 5) * 10
        return penalty

    best_mask = 0
    best_penalty = 1e9
    best_mat = None

    for m in range(8):
        test_mat = [row[:] for row in matrix]
        for r in range(size):
            for c in range(size):
                if not is_fn[r][c]:
                    if get_mask_bit(m, r, c): test_mat[r][c] ^= 1
        pen = compute_penalty(test_mat)
        if pen < best_penalty:
            best_penalty = pen
            best_mask = m
            best_mat = test_mat

    # Format bits (Level L = 01)
    fmt_data = (0b01 << 3) | best_mask
    d = fmt_data << 10
    g = 0x537
    for i in range(4, -1, -1):
        if (d >> (i + 10)) & 1: d ^= (g << i)
    fmt_val = ((fmt_data << 10) | d) ^ 0x5412

    def get_fmt_bit(bit_num):
        return (fmt_val >> bit_num) & 1

    coords_tl = [
        (8, 0), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 7), (8, 8),
        (7, 8), (5, 8), (4, 8), (3, 8), (2, 8), (1, 8), (0, 8)
    ]
    for idx, (r, c) in enumerate(coords_tl):
        best_mat[r][c] = get_fmt_bit(14 - idx)

    for bit in range(7):
        best_mat[size - 1 - bit][8] = get_fmt_bit(bit)
    for bit in range(8):
        best_mat[8][size - 8 + bit] = get_fmt_bit(7 + bit)

    os.makedirs(output_dir, exist_ok=True)
    out_svg = os.path.join(output_dir, "install_qr.svg")
    out_png = os.path.join(output_dir, "install_qr.png")
    out_html = os.path.join(output_dir, "install_card.html")

    # Render SVG
    scale = 8
    border = 4
    total_dim = (size + border * 2) * scale
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_dim} {total_dim}" width="{total_dim}" height="{total_dim}">',
        f'<rect width="{total_dim}" height="{total_dim}" fill="#ffffff" rx="16"/>',
        f'<path fill="#0f7a5c" d="'
    ]
    path_cmds = []
    for r in range(size):
        for c in range(size):
            if best_mat[r][c] == 1:
                x = (c + border) * scale
                y = (r + border) * scale
                path_cmds.append(f"M{x},{y}h{scale}v{scale}h-{scale}z")
    svg_lines.append("".join(path_cmds) + '"/>')
    svg_lines.append('</svg>')

    with open(out_svg, 'w') as f:
        f.write("\n".join(svg_lines))

    # Render PNG
    mod_size = 12
    b = 4
    img_size = (size + b * 2) * mod_size
    img = Image.new('RGB', (img_size, img_size), '#ffffff')
    draw = ImageDraw.Draw(img)
    for r in range(size):
        for c in range(size):
            if best_mat[r][c] == 1:
                x0 = (c + b) * mod_size
                y0 = (r + b) * mod_size
                draw.rectangle([x0, y0, x0 + mod_size - 1, y0 + mod_size - 1], fill='#0f7a5c')
    img.save(out_png)

    # Render Generative UI HTML Card
    clean_host = re.sub(r'^https?://', '', url).rstrip('/')
    html_card = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-4 flex justify-center">
  <div class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-6 shadow-md max-w-sm w-full flex flex-col items-center text-center">
    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
      <svg class="w-6 h-6 stroke-emerald-600" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    </div>
    
    <h2 class="text-[var(--foreground)] font-bold text-xl">{app_name}</h2>
    <p class="text-[var(--muted-foreground)] text-xs mt-1 mb-4">Scan with your phone camera to open and install</p>

    <div class="bg-white p-3 rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center">
      <img src="install_qr.png" alt="QR Code" class="w-56 h-56 block rounded-lg" />
    </div>

    <div class="mt-4 w-full">
      <a href="{url}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-emerald-600 hover:underline block truncate px-2 py-1 bg-[var(--background)] rounded-lg border border-[var(--border)]">
        {clean_host}
      </a>
      
      <div class="mt-3 text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-4">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.94-2.91-1 .04-2.17.67-2.86 1.48-.59.69-1.12 1.79-.98 2.85 1.11.09 2.22-.59 2.9-1.42z"/></svg>
          Share &rarr; Add to Home Screen
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.414 13.8533 8.136 12 8.136c-1.8533 0-3.5902.278-5.1368.8137L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/></svg>
          Chrome &rarr; Install
        </span>
      </div>
    </div>
  </div>
</body>
</html>
"""
    with open(out_html, 'w') as f:
        f.write(html_card)

    print(f"SUCCESS: Generated QR code and install card for {url}")
    print(f"PNG: {out_png}")
    print(f"SVG: {out_svg}")
    print(f"HTML Card: {out_html}")
    return out_png, out_svg, out_html

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generate_qr.py <url> [output_dir] [app_name]")
        sys.exit(1)
    target_url = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "."
    name = sys.argv[3] if len(sys.argv) > 3 else "CloudCrane App"
    generate_qr(target_url, out_dir, name)
