import type { Guide } from "@/lib/guides/guide-types";

/**
 * UTM parameters: what each one records, how Google Analytics 4 turns source and medium into a
 * channel, and naming rules. Checked against Google Analytics Help.
 */
export const UTM_PARAMETERS_GUIDE: Guide = {
  faqs: [
    {
      answer:
        "Set utm_source, utm_medium, and utm_campaign on every tagged link. That is Google's own advice. utm_term and utm_content are optional, for paid keywords and for telling apart two links in the same message.",
      question: "Which UTM parameters do I need?",
    },
    {
      answer:
        "Yes. Google Analytics shows Facebook and facebook, or Spring_Sale and spring_sale, as different rows. The default channel rules ignore capitals, but your reports do not, so use lower case everywhere.",
      question: "Are UTM parameters case sensitive?",
    },
    {
      answer:
        "No. The page ignores them, and the visitor sees the same page. Search engines may crawl a tagged address as a separate copy, so point canonical tags and sitemaps at the clean address, without tags.",
      question: "Do UTM parameters affect SEO?",
    },
    {
      answer:
        "Analytics did not recognise the medium. Use one of the values GA4's channel rules know, such as email, cpc, social, display, referral, or affiliate, or add a custom channel group for your own values.",
      question: "Why does my campaign show as Unassigned in GA4?",
    },
  ],
  intro:
    "UTM parameters are tags added to the end of a link so that your analytics can tell which campaign, newsletter, or post sent a visitor. This reference lists every parameter Google Analytics 4 reads, the medium values that put a visit in the right channel, and naming rules that stop reports from splitting into rows that should be one.",
  metaDescription:
    "What each UTM parameter records, which ones to always set, how GA4 maps source and medium to channels, and naming rules that keep campaign reports clean.",
  name: "UTM parameters reference",
  relatedGuides: ["qr-code-error-correction"],
  relatedTools: ["url-encoder-decoder", "qr-code-generator", "meta-tag-generator"],
  searchTerms: ["utm", "utm source", "utm medium", "utm campaign", "ga4", "google analytics", "campaign tracking"],
  sections: [
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A UTM link is an ordinary link with extra query parameters after a question mark. The page ignores them and shows the visitor the same content. Analytics reads them when the page loads and records where the visit came from.",
        },
        {
          kind: "code",
          label: "A tagged link",
          text: "https://www.example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale",
        },
        {
          kind: "list",
          items: [
            "Parameters are joined with &, and their order does not matter.",
            "If the address already has a ?, add the tags after an & instead of a second ?.",
            "If the address has a # part, put the tags before the #. Anything after # is not part of the query, and many tools ignore it.",
            "Spaces and symbols must be encoded, so a space becomes %20 or +. It is simpler not to use them at all. The [URL Encoder and Decoder](/tools/url-encoder-decoder) shows how any value will be encoded.",
          ],
        },
      ],
      heading: "How a UTM link works",
      id: "how-it-works",
    },
    {
      blocks: [
        {
          caption: "The UTM parameters Google Analytics 4 reads",
          columns: ["Parameter", "What it records", "Example"],
          kind: "table",
          rows: [
            ["utm_source", "Who sent the visit: a site, a newsletter, or a platform", "google, newsletter, facebook"],
            ["utm_medium", "The kind of link, such as email, paid search, or social", "email, cpc, social"],
            ["utm_campaign", "The campaign, promotion, or product", "spring-sale"],
            ["utm_term", "The paid search keyword", "running-shoes"],
            ["utm_content", "Which link or creative, to tell apart two links in one email or ad", "header-button"],
            ["utm_id", "The campaign id, matching the id in any cost data you upload", "spring-2026-01"],
            ["utm_source_platform", "The platform that bought or managed the traffic", "Search Ads 360"],
            ["utm_creative_format", "The type of creative. Google says it is not reported yet", "video"],
            ["utm_marketing_tactic", "The targeting used. Google says it is not reported yet", "remarketing"],
          ],
        },
        {
          kind: "paragraph",
          text: "Google's advice is to always use utm_source, utm_medium, and utm_campaign together. A link with a source but no medium still counts the visit, but its medium shows as (not set), and it cannot be put in a channel.",
        },
      ],
      heading: "The parameters",
      id: "parameters",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "GA4 sorts every visit into a default channel, such as Email or Paid Search, using the source and the medium. A medium it does not recognise puts the visit in Unassigned, which is where carefully tagged campaigns most often disappear.",
        },
        {
          caption: "Medium values and the GA4 default channel they land in",
          columns: ["Medium", "Channel", "Note"],
          kind: "table",
          rows: [
            ["email", "Email", "Also chosen when the source is email."],
            ["cpc, ppc, retargeting, or anything starting with paid", "Paid Search", "When the source is a search engine, such as google or bing."],
            ["cpc, ppc, retargeting, or anything starting with paid", "Paid Social", "When the source is a social site, such as facebook or instagram."],
            ["display, banner, cpm, expandable, interstitial", "Display", ""],
            ["social, social-media, social-network, sm", "Organic Social", "A known social site as the source also counts."],
            ["referral, app, link", "Referral", ""],
            ["affiliate", "Affiliates", ""],
            ["sms", "SMS", "Also chosen when the source is sms."],
            ["organic", "Organic Search", "Visits from known search engines count too."],
            ["A paid medium with an unknown source", "Paid Other", ""],
            ["Anything else", "Unassigned", "Unless you add a custom channel group."],
          ],
        },
        {
          kind: "paragraph",
          text: "Google keeps the full rules, and its lists of search, social, shopping, and video sites, in its [default channel group help page](https://support.google.com/analytics/answer/9756891), and changes them from time to time. The rules ignore capitals, but reports do not.",
        },
      ],
      heading: "Medium values and GA4 channels",
      id: "channels",
    },
    {
      blocks: [
        {
          kind: "list",
          items: [
            "Use lower case for every value. Google Analytics treats Facebook and facebook as two sources.",
            "Pick one separator and keep to it, such as hyphens: spring-sale everywhere, never Spring Sale in one link and spring_sale in another.",
            "Keep a shared list of the sources and mediums your team may use, and use nothing else.",
            "Name the campaign exactly as it is named in the ad platform, so cost and traffic line up.",
            "Use utm_content for the difference between two links in one email or ad, rather than a new campaign name.",
            "Write dates in one fixed form, such as 2026-11 for November 2026.",
          ],
        },
        {
          caption: "An example naming scheme",
          columns: ["Link", "utm_source", "utm_medium", "utm_campaign", "Channel in GA4"],
          kind: "table",
          rows: [
            ["Monthly newsletter", "newsletter", "email", "2026-11-newsletter", "Email"],
            ["Paid Facebook ad", "facebook", "paid-social", "black-friday-2026", "Paid Social"],
            ["Organic LinkedIn post", "linkedin", "social", "product-launch", "Organic Social"],
            ["Google Ads, tagged by hand", "google", "cpc", "brand-search", "Paid Search"],
            ["QR code on a flyer", "flyer", "qr", "store-opening", "Unassigned, unless you add a custom channel group"],
          ],
        },
      ],
      heading: "Naming rules that keep reports clean",
      id: "naming",
    },
    {
      blocks: [
        {
          kind: "list",
          items: [
            "On links between pages of your own site. A tag on an internal link replaces the real source of the visit, so the ad or email that brought the visitor loses the credit.",
            "With personal information. Never put an email address, a name, or a phone number in a UTM value. Google Analytics' policies forbid sending data that identifies a person, and links get forwarded and logged.",
            "In canonical tags and sitemaps. Search engines should see the clean address, so tagged copies are not treated as separate pages.",
          ],
        },
        {
          kind: "paragraph",
          text: "The [UTM Link Builder](/tools/utm-link-builder) adds the tags to any address, lowers the case and replaces spaces if you ask it to, warns about values that will split your reports, and takes a tagged link apart to show what it says.",
        },
      ],
      heading: "When not to use UTM tags",
      id: "when-not",
    },
  ],
  seoTitle: "UTM Parameters: Reference and Naming Rules",
  slug: "utm-parameters",
  sources: [
    {
      label: "Google Analytics Help: Collect campaign data with custom URLs",
      url: "https://support.google.com/analytics/answer/10917952",
    },
    { label: "Google Analytics Help: Default channel group", url: "https://support.google.com/analytics/answer/9756891" },
    {
      label: "Google Analytics Help: Best practices to avoid sending personally identifiable information",
      url: "https://support.google.com/analytics/answer/6366371",
    },
    { label: "Google: Campaign URL Builder", url: "https://ga-dev-tools.google/campaign-url-builder/" },
  ],
  toolAction: "Open the UTM Link Builder",
  toolSlug: "utm-link-builder",
  updatedAt: "2026-11-14",
};
