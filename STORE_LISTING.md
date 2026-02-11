# ForReal - Chrome Web Store Listing

## Name
ForReal

## Category
Productivity / News & Weather

## Summary (132 characters max)
Real-time AI fact-checking for X (Twitter). Verify claims with trusted sources instantly.

## Description

**ForReal makes accurate information just as accessible as misinformation.**

In an era where false claims spread faster than facts, ForReal brings instant verification to your timeline. With one click, analyze any tweet using advanced AI and trusted news sources.

### What ForReal Does

- **Instant Fact-Checking**: Click "Verify" on any tweet to check claims in seconds
- **Trusted Sources**: Cross-references multiple reputable news outlets and fact-checkers
- **AI-Powered Analysis**: Uses Google Gemini to synthesize evidence and provide clear verdicts
- **Context Matters**: Highlights bias, missing context, and misleading framing

### How It Works

1. Browse X (Twitter) normally
2. Click the "Verify" button that appears on tweets
3. ForReal searches trusted sources (Reuters, AP News, fact-checkers, etc.)
4. Get an instant verdict: True, False, Misleading, or Unverifiable
5. See source citations for every claim

### Free Tier

- 25 fact-checks per day
- Full access to verification features
- No account required

### Why ForReal?

Misinformation thrives because it's fast and easy. ForReal makes truth just as fast and just as easy. No more opening multiple tabs, searching for sources, or wondering if a claim is real. Get the facts in the time it takes to read a tweet.

### Privacy

ForReal respects your privacy:
- No personal data collection
- Anonymous usage tracking only
- Tweet text sent to backend for analysis only
- No data stored long-term

---

**Built for critical thinkers who want facts, not noise.**

## Keywords (separated by commas)

fact-check, twitter, x, misinformation, fake news, ai, verification, truth, news, claims, sources

## Support URL

https://github.com/yourusername/ForReal/issues

## Privacy Policy URL

https://jcub05.github.io/ForReal/privacy-policy.html

---

## Chrome Web Store Submission - Privacy Practices Tab

### Single Purpose Description

ForReal provides real-time fact-checking for X (Twitter) posts. Users click "Verify" on any tweet to instantly check claims against trusted news sources using AI-powered analysis.

### Permission Justifications

#### activeTab Permission

ForReal requires the `activeTab` permission to access the content of the currently active X (Twitter) tab when users click the "Verify" button. This allows the extension to extract tweet text and metadata from the active page to send for fact-checking analysis. Without this permission, the extension cannot read the tweet content that users want to verify.

#### scripting Permission

The `scripting` permission is essential for ForReal to inject the user interface elements (Verify buttons and fact-check results overlay) into X (Twitter) pages. This permission allows the extension to dynamically add interactive elements to tweets and display verification results directly on the page. All injected code is included in the extension package and executes locally in the user's browser.

#### contextMenus Permission

ForReal uses the `contextMenus` permission to provide users with a convenient right-click "Verify with ForReal" option on tweets. This creates an alternative way to initiate fact-checking beyond the inline Verify button, improving user experience and accessibility. The context menu only appears on X (Twitter) pages.

#### storage Permission

The `storage` permission allows ForReal to store two pieces of data locally in the user's browser:
1. An anonymous user ID (randomly generated UUID) for quota tracking
2. Daily fact-check usage count to enforce the 25-check-per-day free tier limit

No personal information, browsing history, or tweet content is stored. All stored data remains local to the user's device and is never transmitted to third parties.

#### Host Permission Justification

ForReal requires host permissions (`<all_urls>`) to inject the Verify button and display fact-check results on X (Twitter) pages, regardless of which subdomain or path users are browsing (x.com, twitter.com, mobile.x.com, etc.). The extension only activates and displays UI elements on social media sites where users view potentially misleading content. Host permissions enable the content scripts to run on these pages and provide the core fact-checking functionality.

#### Remote Code Usage

**Yes, ForReal uses remote code.**

ForReal sends tweet content to a secure backend API hosted at https://forreal-backend.example.com for fact-checking analysis. The backend performs three functions:

1. **Web Search**: Queries trusted news sources, fact-checkers, and authoritative databases for information related to the tweet's claims
2. **AI Analysis**: Uses Google Gemini API to synthesize search results and generate a verdict (True, False, Misleading, or Unverifiable)
3. **Rate Limiting**: Enforces the 25-checks-per-day quota using the anonymous user ID

The remote backend is necessary because:
- Fact-checking requires access to real-time news databases and search engines not available in the browser
- AI analysis using Google Gemini API requires server-side API authentication
- Rate limiting must be enforced server-side to prevent abuse

All extension code (JavaScript, HTML, CSS) is included in the extension package. Only tweet text and the anonymous user ID are sent to the backend. No remote JavaScript is loaded or executed—the extension simply makes API calls to the backend and displays the returned results.

### Language

English (United States)

### Category

Productivity

---

## Manual Steps Required

Before submitting, you must complete these steps in the Chrome Web Store Developer Dashboard:

1. **Account Tab**: 
   - Enter your contact email
   - Verify the email address

2. **Privacy Practices Tab**:
   - Copy-paste the justifications above into the corresponding fields
   - Select "Yes, I am using Remote code" and paste the remote code justification
   - Certify data usage compliance

3. **Store Listing Tab**:
   - Select Language: English (United States)
   - Select Category: Productivity
   - Upload icon image (128x128)
   - Verify screenshots are uploaded

4. **Save Draft** after completing all fields
