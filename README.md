# Cat v. Canary Guild — website

A self-hostable, static Guild website with no paid website-builder dependencies. Hosted via GitHub Pages when enabled under Settings → Pages → Deploy from a branch → main / (root). The existing cvcguild.com domain remains untouched until launch.

## Pre-launch checklist

- Check photograph publication permissions, photographer credit and watermark placement. Photos were copied from the Guild's curated **Fundraising Film - Polished Photos** Google Drive folder. They are original JPG masters (not the smaller WebP files in the earlier local prototype); optimize for loading before public launch.
- Confirm Benevity nonprofit donation URL, Venmo QR code, and any official donation routes. Do not invent payment destinations.
- Verify all 2027 event dates and participation before claiming exact Guild appearances.
- Test keyboard, touch, mobile, links, image pop-ups and all Easter eggs.
- Enable GitHub Pages; preview the repository site before pointing the domain here.
- Change only A/AAAA/CNAME as required for website DNS; preserve existing MX, SPF, DKIM, DMARC and verification records. Verify HTTPS and both www/root URLs before canceling Squarespace site subscription.
- Domain registration and website hosting are distinct. Do not cancel the domain registration when canceling Squarespace hosting.

## Structure

`index.html` contains markup, CSS and JS. `photos/*.jpg` are real Guild photos. `crest.svg` and `mascots.svg` are local ornamental art. No build step is needed.
