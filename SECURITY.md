# Security Policy ⚡

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: `security@your-domain.com`
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Response Time**: We aim to respond within 48 hours
- **Updates**: We'll keep you informed of our progress
- **Resolution**: Critical vulnerabilities will be patched ASAP
- **Credit**: We'll credit you in the release notes (unless you prefer anonymity)

## Security Best Practices

When deploying Ignition, follow these security best practices:

### Environment Variables

- Never commit `.env` files to version control
- Use a secret manager (HashiCorp Vault, AWS Secrets Manager, etc.)
- Rotate credentials regularly

### Deployer Wallet

- Use a dedicated hot wallet with minimal balance
- Keep the majority of funds in a cold/hardware wallet
- Monitor wallet activity for unauthorized transactions

### X (Twitter) Credentials

- Use a dedicated account for the scraper
- Enable 2FA on the account
- Rotate cookies/credentials regularly
- Consider using app-specific passwords if available

### Database

- Use strong, unique passwords
- Enable SSL/TLS for connections
- Restrict network access (VPC, firewall rules)
- Enable automatic backups
- Encrypt data at rest

### Infrastructure

- Keep all dependencies updated
- Use container scanning for Docker images
- Enable audit logging
- Set up alerting for anomalies
- Use non-root users in containers

### Network

- Use HTTPS for all external communications
- Keep the API behind a reverse proxy
- Implement rate limiting
- Use firewall rules to restrict access

## Known Limitations

### Scraper Stability

The X scraper relies on web scraping, which:
- May break when X changes their frontend
- Requires valid session cookies
- Is subject to rate limiting

### Transaction Finality

Solana transactions may:
- Fail due to network congestion
- Require multiple confirmation attempts
- Be affected by RPC node reliability

### Metadata Storage

Token metadata on IPFS:
- Is publicly accessible
- Cannot be modified after creation
- Depends on pump.fun's IPFS infrastructure

## Updates

This security policy may be updated as the project evolves. Check back regularly for the latest recommendations.

---

Thank you for helping keep Ignition secure! ⚡
