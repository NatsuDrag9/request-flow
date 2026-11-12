---
name: cloudcrane-qr
description: Automatically generates scannable QR codes and mobile install cards for live CloudCrane deployment URLs (*.cloudcrane.ai). Use after every build, publish_app, or update_app to enable instant physical phone testing.
---

# CloudCrane QR Code Generator Skill

This skill converts any live CloudCrane deployment URL (ending in `.cloudcrane.ai`) into a scannable QR code image (PNG, SVG) and a rich inline Generative UI install card.

## When to Use
- **After every `publish_app` or `update_app`**: Automatically generate and display the QR code for the returned `installUrl`.
- **On user request**: Whenever the user asks for a QR code, mobile link, or install card for a CloudCrane app.

## How to Execute

Run the bundled Python script, passing the live URL, output directory (typically `<appDataDir>/brain/<conversation-id>/` or `./dist/`), and the app name:

```bash
python3 .agents/skills/cloudcrane-qr/scripts/generate_qr.py "<cloudcrane_url>" "<output_directory>" "<app_name>"
```

### Example
```bash
python3 .agents/skills/cloudcrane-qr/scripts/generate_qr.py "https://requestflow-ar6egsirx1.cloudcrane.ai/" "<Artifact_Directory>" "RequestFlow"
```

## Outputs Produced
1. **`install_qr.png`**: High-resolution, crisp PNG image with 100% Reed-Solomon error correction integrity and high contrast for mobile camera scanning.
2. **`install_qr.svg`**: Pure scalable vector graphic with zero external dependencies.
3. **`install_card.html`**: Self-contained Tailwind-styled card designed for inline embedding.

## Presenting to the User
After running the script, present both the interactive card and the direct image link in your response:

```markdown
<agent-embed src="file:///<output_dir>/install_card.html"></agent-embed>

![QR Code](file:///<output_dir>/install_qr.png)
```
