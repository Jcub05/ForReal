# ForReal Privacy Policy

**Last Updated:** February 10, 2026

## Overview

ForReal is a Chrome extension that provides real-time fact-checking for X (formerly Twitter) posts. This privacy policy explains what data we collect, how we use it, and your rights.

## Data Collection

### What We Collect

**Anonymous User ID:**
- A random UUID generated locally in your browser
- Used only for rate limiting (25 fact-checks per day)
- Stored in your browser's local storage
- Cannot be used to identify you personally

**Tweet Content:**
- Text from tweets you choose to fact-check
- Sent to our backend API for analysis
- Not stored permanently on our servers
- Processed temporarily to generate fact-check results

### What We Don't Collect

- Names, email addresses, or personal information
- Browsing history
- Twitter/X account information
- IP addresses (beyond temporary rate limiting)
- Location data
- Any data from tweets you don't fact-check

## How We Use Your Data

**Fact-Checking Service:**
- Tweet text is sent to Google Gemini AI for analysis
- Search queries sent to Brave Search API to find sources
- Results returned to you instantly
- No long-term storage of your queries

**Rate Limiting:**
- Anonymous user ID tracks your daily usage (25 fact-checks/day)
- Resets automatically at midnight UTC
- Prevents API abuse and manages costs

## Third-Party Services

ForReal uses the following third-party APIs:

1. **Google Gemini AI**
   - Purpose: Analyze claims and synthesize information
   - Data shared: Tweet text only
   - Privacy policy: [https://policies.google.com/privacy](https://policies.google.com/privacy)

2. **Brave Search API**
   - Purpose: Find credible sources for fact-checking
   - Data shared: Search queries derived from tweet content
   - Privacy policy: [https://brave.com/privacy/](https://brave.com/privacy/)

## Data Storage and Retention

- **Your browser:** Anonymous user ID stored in Chrome's local storage
- **Our servers:** No permanent data storage
- **Processing:** Tweet text processed in memory and discarded after response
- **Logs:** Minimal server logs kept for 7 days for debugging purposes

## Your Rights

**You have the right to:**
- Stop using ForReal at any time by uninstalling the extension
- Clear your anonymous user ID by clearing browser storage
- Request information about our data practices (contact below)

**Note:** Since we don't collect personally identifiable information, we cannot identify or delete data associated with specific individuals.

## Children's Privacy

ForReal does not knowingly collect data from users under 13. The extension is intended for general audiences.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.

## Security

- All API communications use HTTPS encryption
- No passwords or credentials stored
- Anonymous user IDs cannot be traced to individuals
- Backend hosted on secure Digital Ocean infrastructure

## Permissions Explained

ForReal requests the following Chrome permissions:

- **activeTab:** To read tweet text when you click the fact-check button
- **scripting:** To inject the fact-check button into X.com pages
- **contextMenus:** For right-click menu options (if enabled)
- **storage:** To save your anonymous user ID locally
- **host_permissions (*://*/\*):** To work on all X.com/Twitter.com URLs

## Contact

For questions about this privacy policy or ForReal's data practices:

- GitHub Issues: [Your GitHub Repo URL/issues]
- Email: [Your contact email]

## Open Source

ForReal is open source. You can review our code at: [Your GitHub Repo URL]

---

**Your privacy matters.** ForReal is designed with privacy as a priority—collecting only what's necessary to provide fact-checking services.
