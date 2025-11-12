# MyDresser Beta Tester Guide

**Welcome to the MyDresser Beta Program! 🎉**

Thank you for being an early adopter. Your feedback will help shape the future of MyDresser.

**Version:** 1.0.1-beta  
**Last Updated:** 2025-11-12

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [What to Test](#what-to-test)
3. [Known Issues](#known-issues)
4. [How to Report Bugs](#how-to-report-bugs)
5. [Feature Requests](#feature-requests)
6. [Privacy & Data](#privacy--data)
7. [Support](#support)
8. [FAQ](#faq)

---

## Getting Started

### System Requirements

**Supported Browsers:**
- ✅ Chrome 90+ (Recommended)
- ⚠️ Firefox, Safari, Edge (Experimental - please report any issues)

**Supported Devices:**
- ✅ Desktop (Windows, Mac, Linux)
- ⚠️ Mobile (iOS 15+, Android) - Under testing
- ⚠️ Tablet (iPad, Android tablets) - Under testing

### First Steps

1. **Create Your Account**
   - Visit MyDresser app URL
   - Click "Sign Up"
   - Use email/password (Google sign-in available)
   - Verify your email (check spam folder)

2. **Complete Your Profile**
   - Add display name
   - Set style preferences
   - Choose favorite colors
   - Set measurements (optional, for better outfit recommendations)

3. **Add Your First Items**
   - Go to "Wardrobe" or "Add" section
   - Upload photos or add manually
   - Categorize items (tops, bottoms, shoes, etc.)
   - Add colors and tags

4. **Try Key Features**
   - Generate daily outfit
   - Chat with AI style consultant
   - Browse MyMarket
   - Virtual try-on (upload a full-body photo)

---

## What to Test

### Priority 1: Core Features (Critical for Beta)

#### 1. Authentication & Account Management
- [ ] Sign up with email
- [ ] Log in
- [ ] Password reset
- [ ] Edit profile
- [ ] Log out and log back in
- [ ] Session persists after refresh

**What to look for:**
- Do you stay logged in after refreshing?
- Can you reset your password successfully?
- Does your profile save correctly?

---

#### 2. Wardrobe Management
- [ ] Add item manually
- [ ] Add item with photo upload
- [ ] Edit item details
- [ ] Delete item
- [ ] Search for items
- [ ] Filter by category/color
- [ ] Mark item as favorite
- [ ] View item details

**What to look for:**
- Do images upload successfully?
- Can you edit and delete items?
- Does search/filter work as expected?
- Are photos displayed correctly?

**Try uploading:**
- ✅ Small images (<1MB)
- ⚠️ Large images (2-4MB) - may be slow
- ⚠️ Very large images (>4MB) - known issue

---

#### 3. AI Features

**Daily Outfit Generator**
- [ ] Generate outfit
- [ ] Regenerate outfit
- [ ] Save outfit to favorites
- [ ] Share outfit
- [ ] Edit outfit items

**What to look for:**
- Does it create reasonable outfit combinations?
- Are outfits weather-appropriate?
- Can you save and share outfits?

**AI Style Chat**
- [ ] Send message to AI
- [ ] Receive response
- [ ] Attach images (optional)
- [ ] Get style advice
- [ ] Ask about wardrobe items

**What to look for:**
- Do messages stream correctly?
- Are responses helpful and relevant?
- Does the AI understand your wardrobe context?

**Virtual Try-On (VTO)**
- [ ] Upload full-body photo
- [ ] Generate VTO
- [ ] Regenerate VTO
- [ ] Try different outfits

**What to look for:**
- Does VTO work with your photo?
- Is the quality acceptable?
- Can you regenerate if needed?

**Known Limitations:**
- ⚠️ VTO quality varies with image complexity
- ⚠️ Works best with clear, full-body photos in good lighting
- ⚠️ May take 10-15 seconds to generate

---

#### 4. Shopping & Cart
- [ ] Browse MyMarket
- [ ] View item details
- [ ] Add item to cart
- [ ] Update cart quantity
- [ ] Remove from cart
- [ ] Checkout (simulation only - no real payments)
- [ ] View order history

**What to look for:**
- Does cart persist between sessions?
- Can you add/remove items?
- Does checkout flow work smoothly?

**Note:** Payments are simulated - no real transactions

---

### Priority 2: Advanced Features (Nice to Have)

#### 5. Social Features
- [ ] View social feed
- [ ] Like posts
- [ ] Comment on posts
- [ ] Share outfits
- [ ] Follow users
- [ ] View user profiles

#### 6. 2ndDresser Marketplace
- [ ] List item for sale
- [ ] Browse 2ndDresser
- [ ] Purchase pre-loved items
- [ ] Track sales

#### 7. Collections & Organization
- [ ] Create collection
- [ ] Add items to collection
- [ ] Edit collection
- [ ] Delete collection

---

## Known Issues

### Critical Issues (Being Fixed)
**None currently** - All critical bugs resolved!

### High Priority Issues

1. **Weather API Failures in Some Regions**
   - **Issue:** Some users see "Estimated Location" instead of actual weather
   - **Workaround:** Fallback weather data is used automatically
   - **Status:** Monitoring, will improve in Week 3

### Medium Priority Issues

2. **VTO Quality Varies**
   - **Issue:** Generated try-on images may not always look perfect
   - **Workaround:** Click "Regenerate" to try again
   - **Expected:** This is normal for AI-based systems

3. **Large Image Upload Timeouts**
   - **Issue:** Images over 4MB may timeout
   - **Workaround:** Compress images before uploading (use online tools)
   - **Fix:** Client-side compression coming in Week 3

### Low Priority Issues

4. **Chat Auto-Scroll**
   - **Issue:** Chat doesn't always scroll to latest message
   - **Workaround:** Scroll manually

5. **Loading Skeletons Missing**
   - **Issue:** Brief flash of empty content on some pages
   - **Impact:** Minor UX inconvenience

---

## How to Report Bugs

### Bug Report Template

When you find a bug, please include:

1. **What happened?** (Describe the issue)
2. **What did you expect?** (Expected behavior)
3. **How to reproduce?** (Steps to recreate)
4. **Screenshots/Videos** (If possible)
5. **Browser & Device** (Chrome on Windows, Safari on iPhone, etc.)
6. **Additional context** (Any error messages, unusual behavior)

### Example Bug Report

```
**Title:** Cart items disappear after logout

**What happened:**
Added 3 items to cart, logged out, logged back in. Cart was empty.

**Expected behavior:**
Cart items should persist after logout/login.

**Steps to reproduce:**
1. Add items to cart
2. Log out
3. Log back in
4. Check cart - items are gone

**Browser:** Chrome 120 on Windows 11
**Screenshots:** [attach screenshot]
```

### Where to Report

- **Email:** beta-support@mydresser.app
- **In-App:** Account Settings → Feedback Form
- **Priority:** Critical bugs responded to within 2 hours

### What Makes a Good Bug Report?

✅ **Good:**
- Clear description
- Steps to reproduce
- Screenshots/video
- Browser/device info

❌ **Not Helpful:**
- "It doesn't work"
- "Something is broken"
- No details or context

---

## Feature Requests

We'd love to hear your ideas!

### Feature Request Template

1. **What feature?** (Brief description)
2. **Why do you need it?** (Use case)
3. **How should it work?** (Your vision)
4. **Priority** (Critical, Nice to have, Future idea)

### Example Feature Request

```
**Feature:** Outfit calendar to plan weekly outfits

**Why:** I want to plan my outfits for the week in advance

**How it should work:**
- Calendar view showing 7 days
- Drag and drop outfits to specific days
- Save and edit planned outfits
- Get reminders for planned outfits

**Priority:** Nice to have
```

### Where to Submit

- **Email:** beta-support@mydresser.app
- **In-App:** Account Settings → Feature Request Form

---

## Privacy & Data

### What Data We Collect

- **Account Info:** Email, name, profile settings
- **Wardrobe Data:** Items, photos, metadata
- **Usage Data:** Pages visited, features used (anonymized)
- **AI Interactions:** Chat history, outfit preferences

### What We DON'T Collect

- ❌ Credit card information (no real payments in beta)
- ❌ Location tracking (only used for weather, not stored)
- ❌ Third-party tracking cookies

### Your Rights

- **Access:** Export all your data (Account → Settings → Data Export)
- **Deletion:** Delete account and all data (Account → Settings → Delete Account)
- **Correction:** Edit your profile and wardrobe anytime
- **Portability:** Download data in JSON format

### Data Security

- ✅ All data encrypted in transit (TLS 1.3)
- ✅ Data encrypted at rest (AES-256)
- ✅ Row-Level Security (RLS) on database
- ✅ Regular security audits

For full details, see: `SECURITY_BETA_DOCUMENTATION.md`

---

## Support

### Getting Help

**Beta Support Email:** beta-support@mydresser.app
- **Response Time:** < 24 hours (< 2 hours for critical issues)
- **Hours:** Monday-Friday, 9AM-6PM EST

**Security Issues:** security@mydresser.app
- **Response Time:** < 2 hours for critical issues

### Common Questions

**Q: Why can't I login?**
- Check email for verification link
- Try password reset
- Clear browser cache/cookies
- Try incognito/private mode

**Q: Why are my images not uploading?**
- Check file size (< 4MB recommended)
- Ensure JPEG, PNG, or WebP format
- Check internet connection
- Try a different image

**Q: Why is VTO not working?**
- Ensure full-body photo with good lighting
- Try a simpler outfit (2-3 items)
- Click "Regenerate" if first attempt fails
- Upload a clearer photo

**Q: Is my data safe?**
- Yes! See [Privacy & Data](#privacy--data) section
- All data encrypted and secure
- RLS policies prevent unauthorized access

---

## FAQ

### General

**Q: Is this the final version?**
A: No, this is beta. Features will evolve based on your feedback.

**Q: Will my beta data be deleted?**
A: No, your account and data will carry over to the public release.

**Q: Can I invite friends?**
A: Yes! Limited beta invites available (ask us for invite codes).

**Q: When will this be publicly available?**
A: Targeting 30-60 days after successful beta testing.

### Features

**Q: Why can't I make real purchases?**
A: Beta uses simulated payments. Real payments coming in v2.0.

**Q: Will Stripe be integrated?**
A: Yes, Stripe integration planned for Month 2 (post-beta).

**Q: Can I use this on my phone?**
A: Yes, but mobile is still under testing. Please report any mobile issues!

**Q: Can I install this as an app?**
A: Yes! MyDresser is a PWA (Progressive Web App). Use your browser's "Add to Home Screen" option.

### AI Features

**Q: How does the AI work?**
A: Uses Google Gemini via Lovable AI for style advice and outfit generation.

**Q: Can I train the AI on my style?**
A: The AI learns from your wardrobe and preferences automatically.

**Q: Why are VTO results sometimes weird?**
A: AI-based VTO is experimental. Quality improves with simpler outfits and better photos.

### Technical

**Q: What browsers are supported?**
A: Chrome is recommended. Firefox/Safari work but are less tested.

**Q: Why is it slow sometimes?**
A: Some AI features (VTO, chat) take 5-15 seconds to process.

**Q: Can I use this offline?**
A: Limited offline support via PWA. Some features require internet.

---

## Beta Tester Expectations

### What We Ask From You

1. **Test Regularly:** Use the app 2-3 times per week
2. **Report Issues:** Let us know what's broken or confusing
3. **Share Feedback:** Tell us what you love and what you'd change
4. **Be Patient:** This is beta - some rough edges expected
5. **Be Respectful:** Our team is small but dedicated

### What You Can Expect From Us

1. **Rapid Fixes:** Critical bugs fixed within 24-48 hours
2. **Weekly Updates:** New features and fixes every 1-2 weeks
3. **Listen to Feedback:** Your input shapes the product
4. **Communication:** Regular emails with updates and changes
5. **Appreciation:** Beta testers get lifetime perks (coming soon!)

---

## Changelog

### Week 1 (2025-11-12)
- ✅ All critical bugs fixed
- ✅ Security hardened (RLS policies, encryption)
- ✅ Performance optimized (code splitting, lazy loading)
- ✅ VTO improved (better error handling, fallbacks)

### Upcoming (Week 2-3)
- 🔄 Client-side image compression
- 🔄 Cross-browser improvements
- 🔄 Mobile app optimizations
- 🔄 Enhanced VTO quality

---

## Thank You!

Your participation in this beta program is invaluable. Every bug report, feature request, and piece of feedback helps us build a better product.

We're excited to have you on this journey with us!

**The MyDresser Team**

---

**Still have questions?**  
Email: beta-support@mydresser.app

**Want to see what's coming next?**  
Check: `BETA_LAUNCH_READINESS.md` (Post-Beta Roadmap section)

---

*This guide will be updated as the beta progresses. Last updated: 2025-11-12*
