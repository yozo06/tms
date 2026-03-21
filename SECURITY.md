# Security Policy

## Supported Versions

Currently only the `main` branch is actively supported with security updates. We recommend always running the latest code from the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| v0.1.x  | :white_check_mark: |
| < v0.1  | :x:                |

## Reporting a Vulnerability

Please **DO NOT report security vulnerabilities via public GitHub issues.**

If you believe you have found a security vulnerability in WildArc, please report it privately:

1. **Email:** Details regarding the vulnerability to yogeshmzope@gmail.com
2. Provide a clear description of the issue and steps to reproduce.
3. Allow us up to 48 hours to acknowledge your report.

We will work with you to understand the problem, propose a fix, and coordinate the public disclosure once the patch is released.

### In Scope
- Cross-Site Scripting (XSS)
- SQL Injection
- Authentication bypass
- Authorization bypass (e.g., employee accessing owner data)
- Insecure direct object references (IDOR)
- Significant data leaks

### Out of Scope
- Denial of Service (DoS) attacks requiring massive resources
- Issues in third-party services (e.g., Supabase infrastructure itself)
- Best-practice recommendations that don't pose a direct security threat

Thank you for helping keep WildArc safe for all farmers and contributors!
