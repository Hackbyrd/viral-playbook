# Viral Video Ideas — Claude Skill

A brainstorming and packaging engine built on **The Viral Video Playbook by Jonathan Chen**.
Generates video ideas as *format + subject + title + thumbnail + hook* — never bare topics.

## Install — Claude Code (desktop, CLI, or web)

Unzip into your skills folder:

- **Personal** (available in every project): `~/.claude/skills/viral-video-ideas/`
- **Project** (shared with a repo/team): `<project>/.claude/skills/viral-video-ideas/`

Then start a new session. Invoke with `/viral-video-ideas`, or just ask for video ideas
and it triggers automatically.

## Install — Claude.ai

Settings → Capabilities → Skills → Upload skill, and select this .zip.

## Use with ChatGPT, Gemini, or any other assistant

Open `references/PORTABLE-PROMPT.md` and paste its contents into the chat, a custom GPT's
instructions, or a system prompt. It is self-contained and needs no files.

## What's inside

| File | Purpose |
|---|---|
| `SKILL.md` | The workflow, output format, and rules |
| `references/formats.md` | The 50 repeatable formats, categorised |
| `references/packaging.md` | Titles, thumbnails, hooks, triggers, retention, metrics |
| `references/PORTABLE-PROMPT.md` | Self-contained prompt for other AI tools |

## What it does

- Generates 8–12 ideas, each with a format, title, thumbnail concept, hook, and effort/ceiling rating
- Kills weak ideas before showing them, then ranks the survivors and recommends one
- Critiques and rewrites an idea you already have
- Diagnoses why a video underperformed (packaging vs. hook vs. pacing vs. ceiling)
- Builds content calendars around recurring formats rather than one-off topics

Enforced throughout: the title and thumbnail must never say the same thing — they are two
halves of one curiosity gap.
