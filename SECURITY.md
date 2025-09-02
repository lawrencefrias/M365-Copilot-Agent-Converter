# Security Policy

The security of **M365-Copilot-Agent-Converter** and its users is a top priority.  
Please follow the guidance below to report vulnerabilities responsibly and help us keep the project safe.

---

## Supported Versions

We support security fixes for the actively maintained code line(s) only.

| Version / Branch | Supported          |
| ---------------- | ------------------ |
| `main` (rolling) | ✅                  |
| Latest release   | ✅                  |
| Older releases   | ❌                  |

> Note: If no release has been published yet, consider `main` as the supported version.

---

## Reporting a Vulnerability

**Please do not open public issues or discuss suspected vulnerabilities publicly.**

### Preferred: Private report via GitHub
If available, use **_Report a vulnerability_** from this repository’s **Security** tab to privately disclose details to the maintainers. This keeps sensitive information out of public view and lets us coordinate a fix.  
Path: **Repository → Security → Reporting → Report a vulnerability**

### Alternative: Email
If private reporting is not enabled, please email the maintainer:

- **Email:** 4064822+lawrencefrias@users.noreply.github.com

### What to include
- A concise description of the issue and potential impact
- Steps to reproduce (proof-of-concept), affected files/paths, and environment
- Version/commit (`main` SHA or release tag)
- Any relevant logs or screenshots (sanitize secrets)

---

## Response & Disclosure Process

We aim to:
- **Acknowledge** receipt within **2 business days**
- **Triage & assess severity** within **7 days**
- **Provide a fix/mitigation** or a plan for one within **30–90 days**, depending on severity and complexity

If confirmed, we will:
1. Develop and test a fix privately.
2. Prepare a security advisory (and request a CVE when appropriate).
3. **Publish the fix and advisory** with upgrade/mitigation guidance and, unless you request otherwise, **credit the reporter**.

---

## Scope

**In scope**
- Vulnerabilities in this repository’s code, configuration, build scripts, or release artifacts
- Secrets accidentally committed to this repo

**Out of scope**
- Social engineering or physical attacks
- Findings that only impact **third‑party services** (e.g., Microsoft 365 products, Azure services) without a bug in this repo  
  → For Microsoft services, please report via **MSRC** (Microsoft Security Response Center).
- Best‑practice suggestions without a demonstrable security impact

---

## Safe Harbor

We support **good‑faith** security research and will not pursue legal action against researchers complying with this policy, acting within scope, and avoiding privacy violations, data destruction, or service degradation. If you’re unsure about a specific activity, contact us first.

---

## Thank You

Responsible disclosure helps protect the community. We appreciate your time and effort in keeping this project secure.
