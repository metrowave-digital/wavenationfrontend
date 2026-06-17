export type LegalSection = {
  heading: string
  body?: string[]
  bullets?: string[]
}

export type LegalPageContent = {
  slug: string
  title: string
  eyebrow: string
  description: string
  effectiveDate: string
  sections: LegalSection[]
}

export const legalConfig = {
  brandName: 'WaveNation',
  companyName: 'WaveNation Media',
  legalEntityName: 'MetroWave Media Group dba WaveNation Media',
  siteUrl: 'https://wavenation.online',
  supportEmail: 'legal@wavenation.online',
  privacyEmail: 'legal@wavenation.online',
  copyrightEmail: 'legal@wavenation.online',
  licensingEmail: 'legal@wavenation.online',
  accessibilityEmail: 'legal@wavenation.online',
  mailingAddress: '1027 McClardy Rd, Clarksville, TN 37042',
  jurisdiction: 'Tennessee, United States',
  minimumAccountAge: '18',
}

export const legalEffectiveDate = 'June 17, 2026'

export const privacyPolicy: LegalPageContent = {
  slug: '/privacy',
  title: 'Privacy Policy',
  eyebrow: 'Privacy & Data',
  description:
    'How WaveNation collects, uses, shares, protects, and manages personal information across our website, apps, radio, video, creator, subscription, and community experiences.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. Who We Are',
      body: [
        `${legalConfig.legalEntityName} operates ${legalConfig.brandName}, a digital media platform for radio, video, editorial content, creator tools, subscriptions, community features, and related services. This Privacy Policy explains how we handle personal information when you visit ${legalConfig.siteUrl}, use our apps, listen to streams, watch video content, create an account, subscribe, submit content, contact us, or interact with our services.`,
        'This policy is a launch-ready draft and should be reviewed by legal counsel before publication, especially as WaveNation adds additional apps, creators, advertising partners, payment processors, and monetization tools.',
      ],
    },
    {
      heading: '2. Information We Collect',
      body: [
        'We may collect information you provide directly, information collected automatically, and information from third-party services you choose to connect.',
      ],
      bullets: [
        'Account information, such as name, email address, username, profile photo, authentication identifiers, password/session data, preferences, subscription status, and account settings.',
        'Creator and contributor information, such as bio, social links, uploaded media, rights information, agreements, payout details, tax documentation where applicable, and communication history.',
        'Contact and support information, such as messages, requests, forms, email communications, feedback, reports, appeals, and legal notices.',
        'Usage information, such as pages viewed, streams played, videos watched, search queries, device type, browser type, IP address, referral URLs, approximate location, and interaction events.',
        'Payment and transaction information processed through third-party providers. We do not intentionally store full payment card numbers on our servers.',
        'Cookies, pixels, SDKs, local storage, and similar technologies used for security, personalization, analytics, advertising, and performance.',
      ],
    },
    {
      heading: '3. How We Use Information',
      bullets: [
        'Provide, operate, personalize, secure, and improve WaveNation services.',
        'Stream radio, video, podcast, playlist, live event, editorial, and creator content.',
        'Create and manage accounts, subscriptions, creator profiles, community features, and user preferences.',
        'Process payments, subscriptions, cancellations, refunds where applicable, creator monetization, tips, ad revenue share, pay-per-view, merchandise splits, and related records.',
        'Communicate with you about service updates, support requests, policy changes, promotions, legal notices, editorial opportunities, and creator opportunities.',
        'Analyze performance, audience behavior, content trends, advertising effectiveness, and product quality.',
        'Protect the platform from fraud, spam, abuse, security threats, copyright violations, rights disputes, and policy violations.',
        'Comply with legal obligations, enforce our terms, and protect the rights, safety, and property of WaveNation, creators, users, partners, and the public.',
      ],
    },
    {
      heading: '4. How We Share Information',
      body: [
        'We may share information with service providers, business partners, legal authorities, and other parties when necessary to operate the platform or comply with law. We do not sell personal information in the traditional sense. Some advertising or analytics tools may be considered sharing, targeted advertising, or cross-context behavioral advertising under certain privacy laws.',
      ],
      bullets: [
        'Service providers, such as hosting, analytics, authentication, email, payment, media storage, moderation, customer support, advertising, and security vendors.',
        'Advertising and sponsorship partners, where permitted, to measure campaign performance and deliver relevant ads, sponsorships, affiliate campaigns, or sponsored experiences.',
        'Creators or collaborators when you interact with creator pages, submit content, participate in events, request collaboration, purchase creator offerings, or use monetized creator features.',
        'Legal, safety, and compliance recipients when required by law or when necessary to protect rights, safety, users, creators, or the integrity of our services.',
        'Business transfer recipients if WaveNation is involved in a merger, acquisition, financing, reorganization, sale of assets, or similar transaction.',
      ],
    },
    {
      heading: '5. Cookies, Analytics, and Advertising',
      body: [
        'We use cookies and similar technologies for essential site functionality, account security, analytics, personalization, content recommendations, advertising, and performance measurement. More detail is available in our Cookie Policy.',
      ],
    },
    {
      heading: '6. User Content and Public Information',
      body: [
        'Content you post, upload, submit, or make public may be visible to other users and may be indexed, shared, embedded, excerpted, monetized, or promoted depending on the feature and any applicable creator agreement. Do not submit private information, confidential material, or content you do not have permission to share.',
      ],
    },
    {
      heading: '7. Data Retention',
      body: [
        'We keep information for as long as needed to provide services, comply with legal obligations, resolve disputes, enforce agreements, maintain security, preserve business records, and protect rights. Creator submissions, licensing records, payout records, tax records, DMCA notices, counter-notices, and moderation records may be retained longer for legal and rights-management reasons.',
      ],
    },
    {
      heading: '8. Your Choices and Rights',
      body: [
        'Depending on your location, you may have rights to access, correct, delete, restrict, export, or object to certain processing of personal information. You may also be able to opt out of certain targeted advertising or marketing communications.',
      ],
      bullets: [
        `To make a privacy request, contact ${legalConfig.privacyEmail}.`,
        'You can unsubscribe from marketing emails using the unsubscribe link in the message.',
        'You can control cookies through your browser settings and, when available, our cookie preference tools.',
        'You can request account deletion, but we may retain certain records where required or permitted by law.',
      ],
    },
    {
      heading: '9. Children and Minors',
      body: [
        `WaveNation accounts, subscriptions, creator uploads, monetization tools, community posting, and content-submission features are intended for users who are at least ${legalConfig.minimumAccountAge} years old. WaveNation is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn that we collected personal information from a child under 13 without required consent, we will take appropriate steps to delete it.`,
      ],
    },
    {
      heading: '10. Security',
      body: [
        'We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. No system is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      heading: '11. International Users',
      body: [
        'WaveNation is based in the United States and may process information in the United States and other countries where our service providers operate. By using the services, you understand that your information may be transferred to jurisdictions that may have different data protection rules than your location.',
      ],
    },
    {
      heading: '12. Contact Us',
      body: [
        `Privacy contact: ${legalConfig.privacyEmail}`,
        `Mailing address: ${legalConfig.mailingAddress}`,
      ],
    },
  ],
}

export const termsOfService: LegalPageContent = {
  slug: '/terms',
  title: 'Terms of Service',
  eyebrow: 'Platform Terms',
  description:
    'The rules for using WaveNation websites, apps, radio streams, video services, creator features, community tools, subscriptions, and related services.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. Agreement to These Terms',
      body: [
        `These Terms of Service govern your access to and use of ${legalConfig.brandName} services operated by ${legalConfig.legalEntityName}, including ${legalConfig.siteUrl}, our apps, radio streams, video services, articles, podcasts, creator tools, community spaces, subscriptions, events, merchandise, and other products. By using the services, you agree to these Terms.`,
        'If you are using the services on behalf of an organization, you represent that you have authority to bind that organization.',
      ],
    },
    {
      heading: '2. Eligibility and Accounts',
      bullets: [
        `You must be at least ${legalConfig.minimumAccountAge} years old to create an account, subscribe, submit content, use Creator Hub tools, participate in monetization, purchase paid services, or post in community features.`,
        'Some services may require an account, subscription, creator profile, verified identity, tax information, payment information, rights documentation, or additional written agreement.',
        'You are responsible for keeping your account credentials secure and for activity under your account.',
        'Do not impersonate another person, misrepresent your affiliation, or create accounts for abusive, deceptive, illegal, or unauthorized purposes.',
      ],
    },
    {
      heading: '3. Acceptable Use',
      body: [
        'You agree not to misuse WaveNation, interfere with the services, violate the rights of others, upload unlawful or harmful content, evade security controls, scrape the platform without permission, or use the services in a way that violates these Terms, our Community Guidelines, or applicable law.',
      ],
    },
    {
      heading: '4. Content Ownership and License to WaveNation',
      body: [
        'You retain ownership of content you submit, upload, or post if you own it. By submitting content to WaveNation, you grant WaveNation a worldwide, non-exclusive, royalty-free license to host, store, reproduce, display, perform, distribute, adapt, excerpt, promote, monetize where applicable, and make your content available in connection with the services, editorial features, social promotion, platform operations, and related marketing.',
        'For creator monetization, tips, revenue sharing, pay-per-view, subscription splits, merchandise splits, paid partnerships, licensing, exclusive distribution, or sponsored opportunities, additional written agreements may apply.',
      ],
    },
    {
      heading: '5. Music, Video, and Copyrighted Works',
      body: [
        'You may only upload or submit music, video, images, artwork, writing, samples, beats, stems, performances, trademarks, likenesses, or other content if you have the rights, licenses, releases, and permissions needed. WaveNation may remove content or disable access when we believe content violates rights, law, or platform policies.',
      ],
    },
    {
      heading: '6. Subscriptions, Payments, Creator Monetization, and Refunds',
      body: [
        'Paid features, WaveNation+ subscriptions, premium tiers, event access, memberships, merchandise, creator tools, tips, pay-per-view experiences, revenue-sharing features, and other paid services may be offered through WaveNation or third-party payment providers. Prices, billing cycles, cancellation rules, taxes, payout timing, platform fees, and refund terms will be disclosed at checkout, in the applicable offer, or in a separate creator agreement. Unless required by law or stated otherwise, fees may be non-refundable after access begins.',
      ],
    },
    {
      heading: '7. Editorial and Entertainment Content',
      body: [
        'WaveNation publishes news, commentary, reviews, interviews, entertainment, cultural content, and creator work. Some content may include opinion, sponsored content, affiliate links, AI-assisted production, or third-party material. We aim for accuracy and transparency but do not guarantee that every piece of content will be error-free or complete.',
      ],
    },
    {
      heading: '8. Third-Party Services',
      body: [
        'The services may link to or integrate third-party platforms, streaming tools, authentication providers, payment processors, analytics services, advertisers, social networks, and embedded content. WaveNation is not responsible for third-party services, content, policies, or practices.',
      ],
    },
    {
      heading: '9. Termination and Enforcement',
      body: [
        'We may suspend, restrict, remove content, remove monetization, withhold payouts where legally permitted, or terminate access if we believe you violated these Terms, our Community Guidelines, law, rights of others, or the safety and integrity of the platform. We may also take action to comply with legal requests or protect WaveNation, users, creators, partners, and the public.',
      ],
    },
    {
      heading: '10. Disclaimers',
      body: [
        'The services are provided as is and as available. To the maximum extent permitted by law, WaveNation disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, availability, accuracy, and uninterrupted operation.',
      ],
    },
    {
      heading: '11. Limitation of Liability',
      body: [
        'To the maximum extent permitted by law, WaveNation will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenues, data, goodwill, business opportunities, creator earnings, audience reach, sponsorship opportunities, or platform availability arising from your use of the services.',
      ],
    },
    {
      heading: '12. Governing Law and Dispute Terms',
      body: [
        `These Terms are governed by the laws of ${legalConfig.jurisdiction}, unless a different rule is required by applicable law. Add final dispute resolution, arbitration, venue, class action waiver, and small claims language after legal review.`,
      ],
    },
    {
      heading: '13. Contact',
      body: [`Legal/support contact: ${legalConfig.supportEmail}`, `Mailing address: ${legalConfig.mailingAddress}`],
    },
  ],
}

export const cookiePolicy: LegalPageContent = {
  slug: '/cookies',
  title: 'Cookie Policy',
  eyebrow: 'Cookies & Tracking',
  description:
    'How WaveNation uses cookies, pixels, local storage, SDKs, analytics tools, and advertising technologies.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. What Cookies Are',
      body: [
        'Cookies are small files placed on your device when you visit a website. Similar technologies include pixels, tags, SDKs, local storage, session storage, and device identifiers. These tools help websites work, remember preferences, measure performance, personalize experiences, and support advertising.',
      ],
    },
    {
      heading: '2. Types of Cookies We May Use',
      bullets: [
        'Essential cookies: required for security, authentication, navigation, account access, forms, checkout, subscriptions, and basic site operation.',
        'Performance and analytics cookies: help us understand audience behavior, page performance, stream engagement, content reach, campaign performance, and technical issues.',
        'Functional cookies: remember preferences such as region, player settings, theme, saved content, or display choices.',
        'Advertising and measurement cookies: help deliver, limit, measure, and improve ads, sponsorships, affiliate campaigns, and sponsored content.',
        'Media and embedded content cookies: may be set by video players, audio streams, social embeds, live chat, or third-party media services.',
      ],
    },
    {
      heading: '3. Why We Use Cookies',
      bullets: [
        'Keep WaveNation secure and functioning properly.',
        'Support login, subscriptions, creator tools, payments, and personalization.',
        'Measure audience engagement with articles, radio, video, podcasts, playlists, creators, and ads.',
        'Improve site speed, reliability, layout, accessibility, and user experience.',
        'Deliver relevant content, recommendations, promotions, and advertising where permitted.',
      ],
    },
    {
      heading: '4. Third-Party Cookies',
      body: [
        'Third-party services may set cookies when we use providers for analytics, advertising, payments, authentication, streaming, embedded media, social sharing, customer support, moderation, or security. Their use of cookies is governed by their own policies.',
      ],
    },
    {
      heading: '5. Your Choices',
      bullets: [
        'You can block or delete cookies through your browser settings.',
        'You can use browser privacy settings, device controls, or available opt-out tools to limit tracking.',
        'If a cookie banner or preference center is available, use it to manage optional cookies.',
        'Blocking cookies may affect login, playback, personalization, checkout, saved preferences, subscriptions, or other features.',
      ],
    },
    {
      heading: '6. Contact',
      body: [`Cookie/privacy contact: ${legalConfig.privacyEmail}`],
    },
  ],
}

export const dmcaPolicy: LegalPageContent = {
  slug: '/copyright',
  title: 'DMCA Copyright Policy',
  eyebrow: 'Copyright & Takedowns',
  description:
    'How rights owners can report alleged copyright infringement and how creators can respond to takedown notices.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. Copyright Respect',
      body: [
        'WaveNation respects the rights of artists, labels, publishers, filmmakers, photographers, writers, creators, and other rights holders. Users and creators may not upload, stream, post, distribute, monetize, or submit content unless they have the necessary rights, licenses, releases, and permissions.',
      ],
    },
    {
      heading: '2. Submitting a DMCA Notice',
      body: [
        `If you believe content on WaveNation infringes your copyright, send a written notice to ${legalConfig.copyrightEmail}. Your notice should include the following information:`,
      ],
      bullets: [
        'Your full legal name and physical or electronic signature.',
        'Identification of the copyrighted work you claim has been infringed.',
        'Identification of the allegedly infringing material, including URL or enough detail for us to locate it.',
        'Your contact information, including email address, phone number, and mailing address.',
        'A statement that you have a good faith belief the use is not authorized by the copyright owner, agent, or law.',
        'A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on behalf of the owner.',
      ],
    },
    {
      heading: '3. Counter-Notification',
      body: [
        'If your content was removed because of a copyright notice and you believe the removal was mistaken or that you have authorization or a legal right to use the material, you may send a counter-notification. A valid counter-notification should include:',
      ],
      bullets: [
        'Your full legal name and physical or electronic signature.',
        'Identification of the removed material and where it appeared before removal.',
        'A statement under penalty of perjury that you have a good faith belief the material was removed or disabled by mistake or misidentification.',
        'Your name, address, phone number, and consent to the jurisdiction of the appropriate federal court.',
        'A statement that you will accept service of process from the person who submitted the original notice or that person’s agent.',
      ],
    },
    {
      heading: '4. Repeat Infringer Policy',
      body: [
        'WaveNation may terminate or restrict accounts that repeatedly infringe copyrights or repeatedly submit unauthorized content. We may also limit creator monetization, remove access to upload tools, withhold disputed monetization where legally permitted, or take other action as appropriate.',
      ],
    },
    {
      heading: '5. False or Abusive Notices',
      body: [
        'Knowingly submitting false copyright claims or counter-notices may create legal liability. Do not misuse the DMCA process to silence criticism, competition, commentary, lawful use, or creators who have authorization.',
      ],
    },
    {
      heading: '6. Designated Agent Information',
      body: [
        `DMCA/legal email: ${legalConfig.copyrightEmail}`,
        `Mailing address: ${legalConfig.mailingAddress}`,
        'WaveNation should also maintain any required designated-agent registration with the U.S. Copyright Office online DMCA Designated Agent Directory before relying on DMCA safe-harbor processes.',
      ],
    },
  ],
}

export const communityGuidelines: LegalPageContent = {
  slug: '/community-guidelines',
  title: 'Community Guidelines',
  eyebrow: 'Community Standards',
  description:
    'The standards for comments, creator submissions, profiles, uploads, live chats, events, and community participation on WaveNation.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. Our Community Promise',
      body: [
        'WaveNation exists to amplify culture, creators, and community. We want discussion, creativity, critique, music discovery, storytelling, and debate to happen in a space that is safe, respectful, culturally grounded, and fair.',
      ],
    },
    {
      heading: '2. Age Requirement',
      body: [
        `WaveNation account, creator, community posting, subscription, monetization, and upload features are for users who are at least ${legalConfig.minimumAccountAge} years old. Minors may not create accounts, submit creator content, or participate in monetized platform features.`,
      ],
    },
    {
      heading: '3. Be Respectful',
      bullets: [
        'Do not harass, threaten, bully, dox, stalk, or target others.',
        'Do not post hate speech or content that attacks people based on race, ethnicity, nationality, religion, sex, gender identity, sexual orientation, disability, age, veteran status, or other protected characteristics.',
        'Do not encourage violence, celebrate harm, or make threats.',
        'Do not use dehumanizing language or targeted slurs.',
      ],
    },
    {
      heading: '4. Keep Content Lawful and Rights-Clear',
      bullets: [
        'Only upload or submit content you own or have permission to use.',
        'Do not post pirated music, video, shows, images, articles, software, or paid content.',
        'Do not upload content that violates privacy, publicity, trademark, copyright, contract, platform, or confidentiality rights.',
        'Do not promote fraud, illegal sales, scams, weapons trafficking, exploitation, or criminal activity.',
      ],
    },
    {
      heading: '5. Misinformation and Manipulation',
      bullets: [
        'Do not intentionally spread false information that may cause public harm.',
        'Do not impersonate people, brands, artists, creators, public figures, or WaveNation staff.',
        'Do not use bots, spam, fake engagement, coordinated manipulation, or deceptive posting practices.',
      ],
    },
    {
      heading: '6. Sensitive Content',
      body: [
        'Content involving violence, death, self-harm, abuse, trauma, minors, explicit material, or allegations against individuals may be restricted, age-gated, removed, or escalated for review. We may allow newsworthy, educational, artistic, or documentary content when handled responsibly and with proper context.',
      ],
    },
    {
      heading: '7. Creator Hub Standards',
      bullets: [
        'Creators retain ownership of original content they upload but must grant WaveNation the platform rights needed to host, promote, distribute, and monetize it where applicable.',
        'Creators must disclose sponsored content, paid promotions, affiliate relationships, AI-generated material where required, and material conflicts of interest.',
        'Creators are responsible for rights clearances, releases, music licenses, samples, artwork permissions, releases, and factual claims in their submissions.',
        'Creators may lose upload, monetization, payout, or partnership privileges for policy violations.',
      ],
    },
    {
      heading: '8. Enforcement',
      body: [
        'WaveNation may remove content, limit reach, apply labels, suspend accounts, terminate accounts, remove monetization, restrict creator tools, issue warnings, preserve evidence, or report serious conduct to law enforcement when appropriate.',
      ],
    },
    {
      heading: '9. Appeals',
      body: [
        `If you believe an enforcement action was a mistake, contact ${legalConfig.supportEmail} with your account information, the content at issue, and an explanation. Appeals are reviewed at WaveNation’s discretion.`,
      ],
    },
  ],
}

export const licensingAndRights: LegalPageContent = {
  slug: '/licensing-and-rights',
  title: 'Licensing & Rights',
  eyebrow: 'Creator Rights',
  description:
    'A plain-language guide to content ownership, music rights, creator submissions, monetization, brand assets, editorial use, and licensing requests.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. Overview',
      body: [
        'WaveNation works with artists, creators, writers, DJs, filmmakers, photographers, sponsors, and community voices. This page explains how rights are handled for content submitted to, licensed by, monetized through, or published through WaveNation.',
      ],
    },
    {
      heading: '2. Creator Ownership',
      body: [
        'Creators generally retain ownership of original content they create and submit, unless a separate written agreement says otherwise. Uploading or submitting content gives WaveNation the rights needed to host, display, perform, distribute, excerpt, promote, archive, and make that content available through the platform and related channels.',
      ],
    },
    {
      heading: '3. Monetization and Revenue Opportunities',
      body: [
        'WaveNation may offer creator monetization tools such as tips, revenue sharing, pay-per-view, subscriptions, advertising, sponsored content, merchandise splits, premium access, or licensing opportunities. These features may require additional approval, tax information, payment processor setup, and separate written creator or partner agreements.',
      ],
    },
    {
      heading: '4. Required Rights and Permissions',
      bullets: [
        'Music masters, compositions, samples, beats, stems, remixes, and performances must be cleared.',
        'Video clips, photos, artwork, logos, designs, fonts, and graphics must be owned, licensed, or otherwise authorized.',
        'People appearing in content may require releases, especially for commercial, promotional, or monetized use.',
        'Locations, brands, artwork, and third-party materials may require additional permissions.',
      ],
    },
    {
      heading: '5. Music Rights Notice',
      body: [
        'Music rights can involve multiple owners, including recording owners, songwriters, publishers, producers, performers, labels, distributors, PROs, SoundExchange, mechanical rights organizations, and sync licensing parties. Submitting a song does not guarantee that WaveNation can stream, monetize, place, sync, distribute, or license it unless the required rights are documented.',
      ],
    },
    {
      heading: '6. Editorial Use and Promotion',
      body: [
        'If you submit music, video, artwork, press assets, photos, bios, or story materials for editorial consideration, you grant WaveNation permission to use those materials for editorial coverage, social promotion, thumbnails, excerpts, interviews, playlists, radio/TV programming, and platform discovery unless you clearly state restrictions in writing and WaveNation agrees.',
      ],
    },
    {
      heading: '7. WaveNation Brand Assets',
      body: [
        'WaveNation logos, names, monograms, show marks, gradients, templates, interface designs, audio marks, and motion assets are owned or controlled by WaveNation and may not be used commercially, altered, uploaded to public asset libraries, or included in third-party products without written approval.',
      ],
    },
    {
      heading: '8. Licensing Requests',
      body: [
        `For licensing, partnerships, sync requests, content clearances, brand use, creator agreements, monetization agreements, or permissions, contact ${legalConfig.licensingEmail}. Include your name, organization, requested asset, intended use, territory, duration, platforms, and whether the use is commercial.`,
      ],
    },
    {
      heading: '9. Takedowns and Rights Disputes',
      body: [
        `For copyright complaints, use the DMCA Copyright Policy or contact ${legalConfig.copyrightEmail}. WaveNation may remove or restrict disputed content while a rights issue is reviewed.`,
      ],
    },
  ],
}

export const accessibilityStatement: LegalPageContent = {
  slug: '/accessibility',
  title: 'Accessibility Statement',
  eyebrow: 'Accessibility',
  description:
    'WaveNation’s commitment to accessible digital experiences across web, mobile, audio, video, editorial, and creator platforms.',
  effectiveDate: legalEffectiveDate,
  sections: [
    {
      heading: '1. Our Commitment',
      body: [
        'WaveNation is committed to making its digital experiences accessible and usable for as many people as possible, including people with disabilities. We aim to improve accessibility across our websites, apps, radio experiences, video content, editorial pages, creator tools, forms, subscriptions, and account features.',
      ],
    },
    {
      heading: '2. Standards We Aim Toward',
      bullets: [
        'Clear page structure and semantic HTML.',
        'Readable contrast and scalable text.',
        'Keyboard-accessible navigation and controls.',
        'Visible focus states for interactive elements.',
        'Alt text for meaningful images.',
        'Captions or transcripts for audio/video where available and appropriate.',
        'Reduced-motion support where animations may affect accessibility.',
      ],
    },
    {
      heading: '3. Ongoing Improvements',
      body: [
        'Accessibility is an ongoing process. As WaveNation grows, we will continue reviewing templates, player controls, forms, navigation, editorial pages, and creator features to improve accessibility and usability.',
      ],
    },
    {
      heading: '4. Feedback',
      body: [
        `If you experience an accessibility barrier, contact ${legalConfig.accessibilityEmail}. Include the page URL, the issue you encountered, your device/browser, and any assistive technology used if you are comfortable sharing it.`,
      ],
    },
  ],
}

export const legalPages = [
  privacyPolicy,
  termsOfService,
  cookiePolicy,
  dmcaPolicy,
  communityGuidelines,
  licensingAndRights,
  accessibilityStatement,
]

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug)
}
