import type { MarketingFormField, MarketingPageConfig } from '@wavenation/ui-web'

type MarketingPageKey =
  | 'creatorHub'
  | 'contributorsApply'
  | 'newsletter'
  | 'contact'
  | 'advertise'
  | 'sponsorships'
  | 'showSponsorships'
  | 'partnerships'
  | 'press'
  | 'interviewRequest'
  | 'supportCenter'
  | 'careers'
  | 'creatorResources'

const contactEmail =
  process.env.NEXT_PUBLIC_WAVENATION_CONTACT_EMAIL || 'team@wavenation.online'

const marketingEndpoint = '/api/marketing-inquiry'
const newsletterEndpoint = '/api/newsletter'

function baseContactFields(): MarketingFormField[] {
  return [
    {
      name: 'name',
      label: 'Your name',
      type: 'text',
      required: true,
      placeholder: 'First and last name',
    },
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      required: true,
      placeholder: 'you@example.com',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: 'Optional',
    },
  ]
}

export const marketingPages: Record<MarketingPageKey, MarketingPageConfig> = {
  creatorHub: {
    eyebrow: 'WaveNation Creator Hub',
    title: 'Build with the wave.',
    description:
      'A public landing page for creators who want to pitch shows, submit ideas, grow their audience, and eventually access WaveNation creator tools, channels, analytics, and monetization opportunities.',
    seoTitle: 'Creator Hub | WaveNation',
    seoDescription:
      'Join the WaveNation Creator Hub to pitch shows, submit ideas, grow your audience, and connect with future creator tools, channels, analytics, and monetization opportunities.',
    accent: 'teal',
    primaryAction: {
      label: 'Apply as a contributor',
      href: '/contributors/apply',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'View creator resources',
      href: '/creator-resources',
      variant: 'secondary',
    },
    stats: [
      {
        value: '24/7',
        label: 'Media ecosystem',
        detail: 'Radio, TV, editorial, playlists, events, and creator-led content.',
      },
      {
        value: '360°',
        label: 'Creator visibility',
        detail:
          'Cross-promotion across web, social, audio, video, and live experiences.',
      },
      {
        value: 'Next',
        label: 'Dashboard phase',
        detail:
          'Future creator login, channels, analytics, and monetization tools.',
      },
    ],
    sections: [
      {
        eyebrow: 'Creator pathways',
        title: 'Choose how you want to show up.',
        description:
          'WaveNation is designed for creators who need distribution, editorial polish, audience access, and a culturally rooted platform.',
        items: [
          {
            meta: 'Audio',
            title: 'Pitch a show or podcast',
            description:
              'Bring radio, podcast, DJ mix, commentary, faith, music, or culture concepts into the WaveNation pipeline.',
          },
          {
            meta: 'Video',
            title: 'Create for WaveNation One',
            description:
              'Submit ideas for interviews, creator spotlights, mini-docs, live events, and short-form video.',
          },
          {
            meta: 'Editorial',
            title: 'Write, report, review, or recap',
            description:
              'Contribute stories across music, culture, community, lifestyle, faith, events, and entertainment.',
          },
        ],
      },
    ],
    footerCta: {
      eyebrow: 'Ready to get started?',
      title: 'Apply to create with WaveNation.',
      description:
        'Tell us who you are, what you create, and where your work can fit across the WaveNation ecosystem.',
      actions: [
        {
          label: 'Start application',
          href: '/contributors/apply',
          variant: 'primary',
        },
        {
          label: 'Request an interview',
          href: '/interview-request',
          variant: 'secondary',
        },
      ],
    },
  },

  contributorsApply: {
    eyebrow: 'Contributors',
    title: 'Apply to join the contributor network.',
    description:
      'For writers, photographers, videographers, DJs, on-air hosts, podcast hosts, culture reporters, reviewers, and social media contributors who want to help amplify culture with excellence.',
    seoTitle: 'Apply as a Contributor | WaveNation',
    seoDescription:
      'Apply to join WaveNation as a writer, photographer, videographer, DJ, on-air host, podcast host, culture reporter, reviewer, or social media contributor.',
    accent: 'blue',
    primaryAction: {
      label: 'Complete the form',
      href: '#request-form',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'See creator resources',
      href: '/creator-resources',
      variant: 'secondary',
    },
    sections: [
      {
        eyebrow: 'Who should apply',
        title: 'All contributor lanes are open for review.',
        items: [
          {
            title: 'Editorial contributors',
            description:
              'Writers, reviewers, culture reporters, interviewers, photographers, and social-first storytellers.',
          },
          {
            title: 'Audio and on-air contributors',
            description:
              'DJs, radio hosts, podcast hosts, community voices, and show concept creators.',
          },
          {
            title: 'Video contributors',
            description:
              'Videographers, editors, short-form creators, event recappers, and interview producers.',
          },
        ],
      },
    ],
    form: {
      intent: 'contributors_apply',
      title: 'Contributor application',
      description:
        'Tell us about your lane, experience, availability, and links to your work.',
      endpoint: marketingEndpoint,
      submitLabel: 'Send application',
      fields: [
        ...baseContactFields(),
        {
          name: 'roles',
          label: 'Contributor roles',
          type: 'checkboxGroup',
          required: true,
          options: [
            { label: 'Writer', value: 'writer' },
            { label: 'Photographer', value: 'photographer' },
            { label: 'Videographer', value: 'videographer' },
            { label: 'DJ', value: 'dj' },
            { label: 'On-air host', value: 'on_air_host' },
            { label: 'Podcast host', value: 'podcast_host' },
            { label: 'Culture reporter', value: 'culture_reporter' },
            { label: 'Reviewer', value: 'reviewer' },
            {
              label: 'Social media contributor',
              value: 'social_media_contributor',
            },
          ],
        },
        {
          name: 'portfolioUrl',
          label: 'Portfolio or sample link',
          type: 'url',
          placeholder: 'Website, Google Drive, YouTube, Instagram, etc.',
        },
        {
          name: 'availability',
          label: 'Availability',
          type: 'select',
          options: [
            { label: 'Occasional contributor', value: 'occasional' },
            { label: 'Monthly contributor', value: 'monthly' },
            { label: 'Weekly contributor', value: 'weekly' },
            {
              label: 'Open to regular assignments',
              value: 'regular_assignments',
            },
          ],
        },
        {
          name: 'message',
          label: 'Tell us what you want to create',
          type: 'textarea',
          required: true,
        },
      ],
    },
    faqs: [
      {
        question: 'Are contributor roles paid?',
        answer:
          'Contributor opportunities are reviewed case by case. The form helps WaveNation determine the right editorial, creator, volunteer, freelance, or future team pathway.',
      },
      {
        question: 'What happens after I apply?',
        answer: `Your application goes to ${contactEmail}. If your background or idea fits a current need, WaveNation can follow up by email.`,
      },
    ],
  },

  newsletter: {
    eyebrow: 'Newsletter',
    title: 'One newsletter. The whole wave.',
    description:
      'Join the WaveNation newsletter for culture updates, music moments, creator opportunities, shows, events, and platform announcements in one focused email list.',
    seoTitle: 'Newsletter | WaveNation',
    seoDescription:
      'Subscribe to the WaveNation newsletter for music, culture, creator opportunities, shows, events, platform updates, and community stories.',
    accent: 'green',
    primaryAction: {
      label: 'Subscribe now',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'What you get',
        title: 'A single inbox connection to WaveNation.',
        items: [
          {
            title: 'Music and culture',
            description:
              'Featured stories, interviews, playlists, charts, events, and show announcements.',
          },
          {
            title: 'Creator opportunities',
            description:
              'Submission windows, contributor calls, interview opportunities, and future creator resources.',
          },
          {
            title: 'Platform updates',
            description:
              'News about WaveNation FM, WaveNation One, WaveNation+, and community activations.',
          },
        ],
      },
    ],
    form: {
      intent: 'newsletter_signup',
      title: 'Subscribe to WaveNation',
      description: 'Powered by Resend. One newsletter list only.',
      endpoint: newsletterEndpoint,
      submitLabel: 'Join the newsletter',
      successMessage:
        'You are on the WaveNation newsletter list. Check your inbox for any confirmation email.',
      fields: [
        {
          name: 'firstName',
          label: 'First name',
          type: 'text',
          placeholder: 'First name',
        },
        {
          name: 'email',
          label: 'Email address',
          type: 'email',
          required: true,
          placeholder: 'you@example.com',
        },
        {
          name: 'consent',
          label:
            'I agree to receive the WaveNation newsletter and understand I can unsubscribe later.',
          type: 'checkbox',
          required: true,
        },
      ],
    },
    faqs: [
      {
        question: 'How many newsletters are there?',
        answer: 'Just one public WaveNation newsletter list for now.',
      },
      {
        question: 'Can I unsubscribe?',
        answer:
          'Yes. Use the unsubscribe link in the email footer when WaveNation sends newsletter broadcasts.',
      },
    ],
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Reach the WaveNation team.',
    description: `Use this page for general questions, listener feedback, creator questions, business requests, and support needs. Public contact email: ${contactEmail}.`,
    seoTitle: 'Contact WaveNation',
    seoDescription:
      'Contact the WaveNation team for general questions, listener feedback, creator inquiries, business requests, support needs, and platform information.',
    accent: 'blue',
    primaryAction: {
      label: 'Send a message',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Contact lanes',
        title: 'Send the request to the right place.',
        items: [
          {
            title: 'General inquiry',
            description:
              'Questions about WaveNation FM, WaveNation One, events, programming, or the website.',
          },
          {
            title: 'Creator inquiry',
            description:
              'Questions about contributor applications, interviews, music, podcasts, or creator resources.',
          },
          {
            title: 'Business inquiry',
            description:
              'Advertising, sponsorships, partnerships, media kit requests, and brand collaborations.',
          },
        ],
      },
    ],
    form: {
      intent: 'contact',
      title: 'Contact WaveNation',
      description: `This form sends an email to ${contactEmail}.`,
      endpoint: marketingEndpoint,
      submitLabel: 'Send message',
      fields: [
        ...baseContactFields(),
        {
          name: 'topic',
          label: 'Topic',
          type: 'select',
          required: true,
          options: [
            { label: 'General question', value: 'general_question' },
            { label: 'Listener feedback', value: 'listener_feedback' },
            { label: 'Creator question', value: 'creator_question' },
            { label: 'Business inquiry', value: 'business_inquiry' },
            { label: 'Technical support', value: 'technical_support' },
          ],
        },
        {
          name: 'message',
          label: 'Message',
          type: 'textarea',
          required: true,
        },
      ],
    },
  },

  advertise: {
    eyebrow: 'Advertise',
    title: 'Request a WaveNation media kit.',
    description:
      'WaveNation gives brands a culturally connected path into radio, TV, web, newsletters, social, podcasts, sponsored editorial, creator campaigns, and live experiences.',
    seoTitle: 'Advertise with WaveNation',
    seoDescription:
      'Request the WaveNation media kit for radio, TV, web, newsletter, podcast, social, sponsored editorial, creator campaign, and live event advertising opportunities.',
    accent: 'magenta',
    primaryAction: {
      label: 'Request media kit',
      href: '#request-form',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Sponsor a show',
      href: '/sponsorships/shows',
      variant: 'secondary',
    },
    stats: [
      {
        value: 'Multi',
        label: 'Platform placements',
        detail: 'Audio, video, web, social, newsletter, shows, and events.',
      },
      {
        value: '25–45',
        label: 'Primary audience',
        detail: 'Culturally connected adults and urban professionals.',
      },
      {
        value: '45+',
        label: 'Secondary audience',
        detail: 'Urban AC, Gospel, R&B, Soul, and Southern Soul listeners.',
      },
    ],
    sections: [
      {
        eyebrow: 'Advertising options',
        title: 'Request packages for the channels that fit your campaign.',
        items: [
          {
            title: 'Radio and podcast ads',
            description:
              'Commercial slots, host reads, podcast placements, and audio integrations.',
          },
          {
            title: 'TV and video sponsorships',
            description:
              'Commercial blocks, show integrations, VOD sponsorships, and event streams.',
          },
          {
            title: 'Digital and social campaigns',
            description:
              'Website display, newsletter sponsorships, sponsored articles, social campaigns, and creator collaborations.',
          },
        ],
      },
    ],
    form: {
      intent: 'advertise_media_kit',
      title: 'Request the media kit',
      description:
        'Tell us about your business and campaign goals. Pricing is not displayed publicly.',
      endpoint: marketingEndpoint,
      submitLabel: 'Request media kit',
      fields: [
        ...baseContactFields(),
        {
          name: 'company',
          label: 'Company / organization',
          type: 'text',
          required: true,
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
        },
        {
          name: 'placements',
          label: 'Interested placements',
          type: 'checkboxGroup',
          required: true,
          options: [
            { label: 'Radio ad slots', value: 'radio_ad_slots' },
            { label: 'Podcast ads', value: 'podcast_ads' },
            { label: 'TV commercial blocks', value: 'tv_commercial_blocks' },
            { label: 'Website display ads', value: 'website_display_ads' },
            {
              label: 'Newsletter sponsorship',
              value: 'newsletter_sponsorship',
            },
            {
              label: 'Social media campaigns',
              value: 'social_media_campaigns',
            },
            { label: 'Sponsored articles', value: 'sponsored_articles' },
            { label: 'Event sponsorship', value: 'event_sponsorship' },
            { label: 'Creator campaigns', value: 'creator_campaigns' },
          ],
        },
        {
          name: 'campaignGoal',
          label: 'Campaign goal',
          type: 'textarea',
          required: true,
        },
      ],
    },
  },

  sponsorships: {
    eyebrow: 'Sponsorships',
    title: 'Support the culture through strategic sponsorship.',
    description:
      'A parent sponsorship page for brands, organizations, and community partners that want to support WaveNation shows, live events, editorial experiences, creator campaigns, and platform growth.',
    seoTitle: 'Sponsorships | WaveNation',
    seoDescription:
      'Explore WaveNation sponsorship opportunities across shows, live events, editorial experiences, creator campaigns, community activations, and platform growth.',
    accent: 'green',
    heroBadges: ['Show sponsorships', 'Events', 'Creators', 'Community activations'],
    primaryAction: {
      label: 'Sponsor a show',
      href: '/sponsorships/shows',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Request media kit',
      href: '/advertise',
      variant: 'secondary',
    },
    sections: [
      {
        eyebrow: 'Sponsorship lanes',
        title: 'Choose a sponsorship path.',
        items: [
          {
            title: 'Shows and segments',
            description:
              'Align with radio shows, podcasts, TV shows, interviews, and recurring editorial segments.',
          },
          {
            title: 'Events and activations',
            description:
              'Support live streams, virtual events, community gatherings, festival tie-ins, and cultural moments.',
          },
          {
            title: 'Creator and community campaigns',
            description:
              'Back creators, contributor series, community storytelling, and audience engagement initiatives.',
          },
        ],
      },
    ],
    footerCta: {
      eyebrow: 'Next step',
      title: 'Start with show sponsorships or request the full media kit.',
      actions: [
        {
          label: 'Show sponsorships',
          href: '/sponsorships/shows',
          variant: 'primary',
        },
        {
          label: 'Media kit request',
          href: '/advertise',
          variant: 'secondary',
        },
      ],
    },
  },

  showSponsorships: {
    eyebrow: 'Show sponsorships',
    title: 'Put your brand inside the shows people trust.',
    description:
      'Request sponsorship opportunities across WaveNation radio shows, podcast shows, TV shows, specific segments, full seasons, single episodes, and live event tie-ins.',
    seoTitle: 'Show Sponsorships | WaveNation',
    seoDescription:
      'Request WaveNation show sponsorship opportunities across radio shows, podcasts, TV shows, segments, episodes, seasons, and live event tie-ins.',
    accent: 'magenta',
    heroBadges: [
      'Radio shows',
      'Podcasts',
      'TV shows',
      'Segments',
      'Live event tie-ins',
    ],
    primaryAction: {
      label: 'Request sponsorship',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Sponsorship options',
        title: 'Built for direct-sold brand alignment.',
        items: [
          {
            title: 'Radio and podcast sponsorship',
            description:
              'Presented-by tags, host reads, segment integrations, episode sponsorships, and recurring campaigns.',
          },
          {
            title: 'TV show sponsorship',
            description:
              'Show branding, video mentions, lower-third sponsor tags, episode support, and live stream visibility.',
          },
          {
            title: 'Live event tie-ins',
            description:
              'Connect sponsorship to concerts, conversations, town halls, watch parties, festival coverage, and virtual events.',
          },
        ],
      },
    ],
    form: {
      intent: 'show_sponsorship',
      title: 'Show sponsorship request',
      description:
        'Share the type of sponsorship, budget range, and brand fit.',
      endpoint: marketingEndpoint,
      submitLabel: 'Send sponsorship request',
      fields: [
        ...baseContactFields(),
        {
          name: 'company',
          label: 'Company / organization',
          type: 'text',
          required: true,
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
        },
        {
          name: 'sponsorshipTypes',
          label: 'Sponsorship types',
          type: 'checkboxGroup',
          required: true,
          options: [
            { label: 'Radio shows', value: 'radio_shows' },
            { label: 'Podcast shows', value: 'podcast_shows' },
            { label: 'TV shows', value: 'tv_shows' },
            { label: 'Specific segments', value: 'specific_segments' },
            {
              label: 'Full season sponsorship',
              value: 'full_season_sponsorship',
            },
            {
              label: 'Single episode sponsorship',
              value: 'single_episode_sponsorship',
            },
            { label: 'Live event tie-in', value: 'live_event_tie_in' },
          ],
        },
        {
          name: 'budgetRange',
          label: 'Budget range',
          type: 'select',
          required: true,
          options: [
            { label: 'Under $500', value: 'under_500' },
            { label: '$500–$1,500', value: '500_1500' },
            { label: '$1,500–$5,000', value: '1500_5000' },
            { label: '$5,000+', value: '5000_plus' },
            { label: 'Not sure yet', value: 'not_sure' },
          ],
        },
        {
          name: 'brandFit',
          label: 'What show, audience, or segment do you want to align with?',
          type: 'textarea',
          required: true,
        },
      ],
    },
  },

  partnerships: {
    eyebrow: 'Partnerships',
    title: 'Partner with WaveNation.',
    description:
      'WaveNation collaborates with community organizations, festivals, schools, HBCUs, churches, brands, venues, labels, publicists, media partners, and technology partners.',
    seoTitle: 'Partner with WaveNation',
    seoDescription:
      'Partner with WaveNation through community, education, entertainment, event, media, brand, technology, festival, venue, label, and creator collaborations.',
    accent: 'teal',
    primaryAction: {
      label: 'Pitch a partnership',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Partnership types',
        title: 'Build impact across culture and community.',
        items: [
          {
            title: 'Community and education',
            description:
              'Community organizations, schools, HBCUs, churches, youth programs, and faith-based/community initiatives.',
          },
          {
            title: 'Entertainment and events',
            description:
              'Festivals, venues, labels, publicists, artists, event organizers, and live activation partners.',
          },
          {
            title: 'Media and technology',
            description:
              'Media partners, technology vendors, platforms, streaming partners, and branded content collaborators.',
          },
        ],
      },
    ],
    form: {
      intent: 'partnership',
      title: 'Partnership inquiry',
      description:
        'Tell us who you are, what you want to build, and how the partnership supports the WaveNation audience.',
      endpoint: marketingEndpoint,
      submitLabel: 'Send partnership pitch',
      fields: [
        ...baseContactFields(),
        {
          name: 'organization',
          label: 'Organization / company',
          type: 'text',
          required: true,
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
        },
        {
          name: 'partnershipTypes',
          label: 'Partnership type',
          type: 'checkboxGroup',
          required: true,
          options: [
            {
              label: 'Community organization',
              value: 'community_organization',
            },
            { label: 'Festival / event', value: 'festival_event' },
            { label: 'School / HBCU', value: 'school_hbcu' },
            { label: 'Church / faith group', value: 'church_faith_group' },
            { label: 'Brand', value: 'brand' },
            { label: 'Venue', value: 'venue' },
            { label: 'Label / publicist', value: 'label_publicist' },
            { label: 'Media partner', value: 'media_partner' },
            { label: 'Technology partner', value: 'technology_partner' },
          ],
        },
        {
          name: 'proposal',
          label: 'Partnership proposal',
          type: 'textarea',
          required: true,
        },
      ],
    },
  },

  press: {
    eyebrow: 'Press',
    title: 'Request WaveNation press information.',
    description:
      'Press assets, brand boilerplate, founder information, company facts, media kit materials, and interview support are available by request only.',
    seoTitle: 'Press & Media Requests | WaveNation',
    seoDescription:
      'Request WaveNation press information, public-safe brand materials, founder details, company facts, media kit assets, and interview support.',
    accent: 'blue',
    heroBadges: ['Assets by request', 'Press contact', contactEmail],
    primaryAction: {
      label: 'Request press materials',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Available by request',
        title: 'No public download wall yet. Request what you need.',
        items: [
          {
            title: 'Brand and company information',
            description:
              'Public-safe brand boilerplate, company facts, and approved WaveNation descriptions.',
          },
          {
            title: 'Founder and leadership information',
            description:
              'Founder bio or executive details can be requested for media, conferences, and press coverage.',
          },
          {
            title: 'Media kit and press assets',
            description:
              'Press logos, media kit files, photos, and approved assets are reviewed before release.',
          },
        ],
      },
    ],
    form: {
      intent: 'press_request',
      title: 'Press materials request',
      description: 'Tell us who you represent and what materials you need.',
      endpoint: marketingEndpoint,
      submitLabel: 'Request press materials',
      fields: [
        ...baseContactFields(),
        {
          name: 'outlet',
          label: 'Outlet / organization',
          type: 'text',
          required: true,
        },
        {
          name: 'deadline',
          label: 'Deadline',
          type: 'text',
          placeholder: 'Example: Friday, March 8',
        },
        {
          name: 'materials',
          label: 'Requested materials',
          type: 'checkboxGroup',
          required: true,
          options: [
            { label: 'Public-safe media kit', value: 'public_media_kit' },
            { label: 'Company facts', value: 'company_facts' },
            { label: 'Founder bio', value: 'founder_bio' },
            { label: 'Logo / brand assets', value: 'logo_brand_assets' },
            { label: 'Interview request', value: 'interview_request' },
            { label: 'Press comment', value: 'press_comment' },
          ],
        },
        {
          name: 'requestDetails',
          label: 'Request details',
          type: 'textarea',
          required: true,
        },
      ],
    },
    faqs: [
      {
        question: 'Can users download the brand guide?',
        answer:
          'No. This page is request-only. Public-safe media kit materials should be reviewed before release.',
      },
    ],
  },

  interviewRequest: {
    eyebrow: 'Interview request',
    title: 'Request an interview with WaveNation.',
    description:
      'Artists, authors, community leaders, business owners, publicists, event organizers, faith leaders, creators, and guests from any relevant lane can request interview consideration.',
    seoTitle: 'Request an Interview | WaveNation',
    seoDescription:
      'Request interview consideration with WaveNation for artists, authors, creators, business owners, faith leaders, publicists, event organizers, and community voices.',
    accent: 'magenta',
    primaryAction: {
      label: 'Request interview',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Review path',
        title: 'Interview requests can fit editorial, radio, podcast, TV, or events.',
        items: [
          {
            title: 'Editorial interviews',
            description:
              'Feature interviews, Q&As, creator profiles, and culture stories.',
          },
          {
            title: 'Audio interviews',
            description:
              'Radio segments, podcast conversations, artist stories, and community discussions.',
          },
          {
            title: 'Video interviews',
            description:
              'WaveNation One interviews, short-form clips, event recaps, and creator spotlight content.',
          },
        ],
      },
    ],
    form: {
      intent: 'interview_request',
      title: 'Interview request form',
      description:
        'Share guest information, topic, links, and preferred interview format.',
      endpoint: marketingEndpoint,
      submitLabel: 'Send interview request',
      fields: [
        ...baseContactFields(),
        {
          name: 'guestName',
          label: 'Guest / featured person name',
          type: 'text',
          required: true,
        },
        {
          name: 'guestType',
          label: 'Guest type',
          type: 'select',
          required: true,
          options: [
            { label: 'Artist', value: 'artist' },
            { label: 'Author', value: 'author' },
            { label: 'Community leader', value: 'community_leader' },
            { label: 'Business owner', value: 'business_owner' },
            { label: 'Publicist', value: 'publicist' },
            { label: 'Event organizer', value: 'event_organizer' },
            { label: 'Faith leader', value: 'faith_leader' },
            { label: 'Creator', value: 'creator' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'preferredFormats',
          label: 'Preferred format',
          type: 'checkboxGroup',
          options: [
            { label: 'Article', value: 'article' },
            { label: 'Radio', value: 'radio' },
            { label: 'Podcast', value: 'podcast' },
            { label: 'TV / video', value: 'tv_video' },
            { label: 'Live event', value: 'live_event' },
          ],
        },
        {
          name: 'links',
          label: 'Relevant links',
          type: 'url',
          placeholder: 'Website, press kit, music, book, event, etc.',
        },
        {
          name: 'pitch',
          label: 'Interview pitch',
          type: 'textarea',
          required: true,
        },
      ],
    },
  },

  supportCenter: {
    eyebrow: 'Support Center',
    title: 'Get help with WaveNation.',
    description:
      'A public support page for listener support, creator help, advertiser questions, account/profile questions, technical/player issues, and general support tickets.',
    seoTitle: 'Support Center | WaveNation',
    seoDescription:
      'Get help with WaveNation listener support, creator help, advertiser questions, account questions, technical issues, live player problems, and general support tickets.',
    accent: 'teal',
    primaryAction: {
      label: 'Submit support ticket',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Help categories',
        title: 'Route your issue faster.',
        items: [
          {
            title: 'Listener support',
            description:
              'Questions about listening live, shows, newsletters, events, playlists, or site content.',
          },
          {
            title: 'Creator and contributor support',
            description:
              'Help with applications, interview requests, creator resources, and submitted materials.',
          },
          {
            title: 'Technical support',
            description:
              'Player issues, streaming problems, login/profile issues, page errors, or broken links.',
          },
        ],
      },
    ],
    form: {
      intent: 'support_ticket',
      title: 'Submit a support ticket',
      description: `This sends a support email to ${contactEmail}.`,
      endpoint: marketingEndpoint,
      submitLabel: 'Submit support request',
      fields: [
        ...baseContactFields(),
        {
          name: 'supportType',
          label: 'Support type',
          type: 'select',
          required: true,
          options: [
            { label: 'Listener help', value: 'listener_help' },
            { label: 'Creator help', value: 'creator_help' },
            { label: 'Advertiser help', value: 'advertiser_help' },
            {
              label: 'Technical / player support',
              value: 'technical_player_support',
            },
            {
              label: 'Account / profile support',
              value: 'account_profile_support',
            },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'pageUrl',
          label: 'Page URL or link with the issue',
          type: 'url',
        },
        {
          name: 'message',
          label: 'Describe the issue',
          type: 'textarea',
          required: true,
        },
      ],
    },
    faqs: [
      {
        question: 'The live player will not autoplay. Is it broken?',
        answer:
          'Most browsers block unmuted autoplay until the user taps play. Use the play button on the player or listen-live page.',
      },
      {
        question: 'Where do music submissions go?',
        answer:
          'Music submissions should use the Submit Music page when available. General creator questions can use support or contributor applications.',
      },
      {
        question: 'Can I request advertising help here?',
        answer:
          'Yes, but advertisers should use the Advertise page for media kit requests or the Show Sponsorships page for show-specific sponsorships.',
      },
    ],
  },

  careers: {
    eyebrow: 'Careers',
    title: 'Join the WaveNation team.',
    description:
      'A public team-interest page for people who want to be considered for future editorial, sales, sponsorship, on-air, production, social, engineering, internship, volunteer, and contributor opportunities.',
    seoTitle: 'Careers | WaveNation',
    seoDescription:
      'Submit interest in future WaveNation editorial, sales, sponsorship, on-air, production, social media, engineering, internship, volunteer, and contributor opportunities.',
    accent: 'green',
    primaryAction: {
      label: 'Submit interest',
      href: '#request-form',
      variant: 'primary',
    },
    sections: [
      {
        eyebrow: 'Future team areas',
        title: 'Tell us where you fit.',
        items: [
          {
            title: 'Content and production',
            description:
              'Editorial, on-air talent, podcasting, video production, social media, and programming.',
          },
          {
            title: 'Business and partnerships',
            description:
              'Sales, sponsorships, advertising, partnerships, community relations, and events.',
          },
          {
            title: 'Technology and operations',
            description:
              'Engineering, web app support, media operations, internships, and future platform roles.',
          },
        ],
      },
    ],
    form: {
      intent: 'careers_interest',
      title: 'Team interest form',
      description:
        'There may not be active openings yet. This form helps build the WaveNation talent pipeline.',
      endpoint: marketingEndpoint,
      submitLabel: 'Send interest form',
      fields: [
        ...baseContactFields(),
        {
          name: 'areas',
          label: 'Areas of interest',
          type: 'checkboxGroup',
          required: true,
          options: [
            { label: 'Editorial', value: 'editorial' },
            { label: 'Sales & sponsorships', value: 'sales_sponsorships' },
            { label: 'On-air talent', value: 'on_air_talent' },
            { label: 'Production', value: 'production' },
            { label: 'Social media', value: 'social_media' },
            { label: 'Engineering', value: 'engineering' },
            { label: 'Internships', value: 'internships' },
            {
              label: 'Volunteers / contributors',
              value: 'volunteers_contributors',
            },
          ],
        },
        {
          name: 'resumeUrl',
          label: 'Resume / portfolio link',
          type: 'url',
        },
        {
          name: 'message',
          label: 'Why do you want to work with WaveNation?',
          type: 'textarea',
          required: true,
        },
      ],
    },
  },

  creatorResources: {
    eyebrow: 'Creator resources',
    title: 'Creator tools and storefronts are coming.',
    description:
      'This page is built for future storefront links, recommended tools, creator equipment, templates, affiliate links, and partner resources. Add your real links later without changing the route.',
    seoTitle: 'Creator Resources | WaveNation',
    seoDescription:
      'Explore upcoming WaveNation creator resources, storefronts, recommended tools, equipment, templates, affiliate links, partner resources, and creator guidelines.',
    accent: 'teal',
    primaryAction: {
      label: 'Apply as a contributor',
      href: '/contributors/apply',
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Request support',
      href: '/support-center',
      variant: 'secondary',
    },
    resources: [
      {
        title: 'Amazon creator storefront',
        description:
          'Recommended microphones, cameras, lighting, tripods, headphones, and studio accessories.',
        label: 'Storefront',
        isComingSoon: true,
        disclosure:
          'Future affiliate disclosure: WaveNation may earn from qualifying purchases.',
      },
      {
        title: 'Podcast starter kit',
        description:
          'A future collection of podcast hosting, editing, recording, and publishing tools.',
        label: 'Affiliate links',
        isComingSoon: true,
        disclosure:
          'Affiliate relationship should be disclosed when links are added.',
      },
      {
        title: 'Video creator kit',
        description:
          'Camera, lighting, background, storage, editing, captioning, and upload workflow tools.',
        label: 'Storefront',
        isComingSoon: true,
        disclosure: 'Add sponsor or affiliate disclosure when applicable.',
      },
      {
        title: 'Music submission toolkit',
        description:
          'Future links for distribution, metadata cleanup, cover art, press kit templates, and artist profiles.',
        label: 'Creator tools',
        isComingSoon: true,
        disclosure: 'Use editorially honest recommendations only.',
      },
      {
        title: 'Brand and media kit templates',
        description:
          'Future templates for creators preparing interview requests, sponsorship pitches, and EPKs.',
        label: 'Templates',
        isComingSoon: true,
      },
      {
        title: 'WaveNation creator guidelines',
        description:
          'Future public-safe creator standards, brand safety notes, and content preparation guidance.',
        label: 'Guidelines',
        isComingSoon: true,
      },
    ],
    sections: [],
    faqs: [
      {
        question: 'Why are the links coming soon?',
        answer:
          'You said you do not have storefront or affiliate links yet, so the page is built with placeholders that can be updated later.',
      },
      {
        question: 'Do affiliate links need labels?',
        answer:
          'Yes. Use clear labels such as Affiliate link, Sponsored placement, Partner resource, or Paid partner when those relationships apply.',
      },
    ],
  },
}