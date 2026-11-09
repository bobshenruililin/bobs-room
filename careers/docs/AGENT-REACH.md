# Xiaohongshu social-post connection

Status on 9 November 2026: **not connected**. No social posts were imported.

The requested upstream skill and Xiaohongshu implementation were inspected at Panniantong/Agent-Reach commit `c70ae6da5d39bc90e09ad2ae0575ccc89f31e284` (version 1.6.1). It supports read-only note searches, note text and loaded comments through OpenCLI. Images/video content is not covered by the note text result. A network-restricted installation attempt failed at DNS resolution of the official GitHub release URL. This is a local setup failure, not evidence of no jobs or a platform login requirement.

The official installation guide is https://github.com/Panniantong/Agent-Reach/blob/c70ae6da5d39bc90e09ad2ae0575ccc89f31e284/docs/install.md . Use its GitHub release, not the unrelated PyPI package with the same name. After a network-enabled install and setup, add the Xiaohongshu channel, inspect its status and use the declared search/read actions. If a login is required, the account owner completes it.

Initial search scope: 香港 AI 实习; 深圳 产品实习; 寒假实习; 日常实习 AI; 医疗健康 实习. Start with ten results per query, respecting the tool’s search interval and platform responses. Read the full note before extraction. Deduplicate by note ID. Preserve the original post link and publication time, record collection time separately, and mark recruiter/company identity, commitment, eligibility and application route as unresolved until checked. Imported social posts belong in a review queue, not the verified job collection.

Stop on login, CAPTCHA, rate-limit or platform-block responses; do not change accounts or backends to work around them. Keep cookies, session data and private messages out of this public repository.
