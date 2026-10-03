import { BRAND_NAME, COMPANY_NAME, COMPANY_URL } from "@/lib/site-config";

export const LEGAL_LAST_UPDATED = "3 October 2026";

export interface LegalSection {
  bullets?: readonly string[];
  heading: string;
  paragraphs: readonly string[];
}

export interface LegalDocumentContent {
  description: string;
  intro: string;
  sections: readonly LegalSection[];
  slug: string;
  title: string;
}

const CONTACT_SECTION: LegalSection = {
  heading: "Contact",
  paragraphs: [
    `Questions about this document can be sent to ${COMPANY_NAME} through [${COMPANY_URL.replace("https://", "")}](${COMPANY_URL}).`,
  ],
};

export const PRIVACY_POLICY: LegalDocumentContent = {
  description:
    `How ${BRAND_NAME} handles your data: tool input, browser storage, server logs, and your choices.`,
  intro: `${BRAND_NAME} is operated by ${COMPANY_NAME} ("we", "us"). This policy explains what data the site handles and why. We aim to collect as little as possible.`,
  sections: [
    {
      heading: "Your tool input",
      paragraphs: [
        "Each tool page states where its processing happens. Tools marked \"On this device\" run entirely in your browser, and the text or values you enter are not sent to our servers.",
        "If a tool ever needs server processing, its page will say \"Secure server processing\" and describe what is sent and how long it is kept before you use it.",
      ],
    },
    {
      heading: "Accounts",
      paragraphs: [
        `You do not need an account to use ${BRAND_NAME}, and we do not ask for your name, email address, or payment details.`,
      ],
    },
    {
      heading: "Information stored on your device",
      paragraphs: [
        "We store your light or dark theme choice in your browser's local storage so the site remembers it on your next visit. This stays on your device and is not sent to us. You can clear it at any time through your browser settings.",
      ],
    },
    {
      heading: "Information collected automatically",
      paragraphs: [
        "Like most websites, our hosting infrastructure records standard technical logs when you request a page, such as your IP address, browser type, the page requested, and the time. We use these logs to keep the service secure and reliable.",
        "We do not currently run advertising or behavioural analytics. If we add analytics later, we will update this policy first and will never include the content of your tool input.",
      ],
    },
    {
      heading: "Third parties",
      paragraphs: [
        `The site is delivered by a hosting provider acting on our behalf. Fonts and scripts are served from our own domain. Links to other websites, such as our [company site](${COMPANY_URL}), are governed by their own policies.`,
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        `${BRAND_NAME} is a general-purpose utility site and is not directed at children under 13. We do not knowingly collect personal information from children.`,
      ],
    },
    {
      heading: "Your choices",
      bullets: [
        "Clear your browser's site data to remove your stored theme preference.",
        "Use your browser's privacy settings to limit or block local storage.",
        "Contact us to ask what data we hold about you or to request its deletion.",
      ],
      paragraphs: ["You are in control of the little we store."],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        `We may update this policy as the site grows, for example when new tools or features are added. The date at the top of this page shows when it last changed (currently ${LEGAL_LAST_UPDATED}).`,
      ],
    },
    CONTACT_SECTION,
  ],
  slug: "privacy",
  title: "Privacy Policy",
};

export const TERMS_OF_USE: LegalDocumentContent = {
  description:
    `The terms for using ${BRAND_NAME}: acceptable use, no warranty, liability, and governing law.`,
  intro: `These terms govern your use of ${BRAND_NAME}, operated by ${COMPANY_NAME} ("we", "us"). By using the site you agree to them.`,
  sections: [
    {
      heading: "The service",
      paragraphs: [
        `${BRAND_NAME} provides free online utilities. We may add, change, or remove tools and features at any time, and we do not guarantee that any tool will always be available.`,
      ],
    },
    {
      heading: "Acceptable use",
      bullets: [
        "Do not use the site to break the law or infringe the rights of others.",
        "Do not attempt to disrupt, overload, or gain unauthorised access to the site or its infrastructure.",
        "Do not use automated means to place excessive load on the service.",
      ],
      paragraphs: ["You agree to use the site responsibly. In particular:"],
    },
    {
      heading: "Your content",
      paragraphs: [
        "You keep all rights to the content you enter into a tool. Because tools marked \"On this device\" process content in your browser, we do not receive or store it. See our [Privacy Policy](/privacy) for details.",
      ],
    },
    {
      heading: "Results are informational",
      paragraphs: [
        "Tool results are provided for convenience. Check important results yourself before relying on them. For example, decoding a token does not verify its signature, and calculators and converters do not replace professional advice.",
      ],
    },
    {
      heading: "No warranty",
      paragraphs: [
        "The site and its tools are provided \"as is\" and \"as available\", without warranties of any kind, whether express or implied, including fitness for a particular purpose and accuracy.",
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        "To the extent permitted by law, we are not liable for any indirect, incidental, or consequential loss, or for loss of data or profits, arising from your use of the site or its tools.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        `The site, its design, and its code are owned by ${COMPANY_NAME} or its licensors. These terms do not grant you any right to copy or reuse them beyond normal use of the site.`,
      ],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        `We may update these terms from time to time. Continued use of the site after a change means you accept the updated terms. This version is dated ${LEGAL_LAST_UPDATED}.`,
      ],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of Pakistan, and any dispute will be subject to the courts of Pakistan.",
      ],
    },
    CONTACT_SECTION,
  ],
  slug: "terms",
  title: "Terms of Use",
};

export const LEGAL_DOCUMENTS: readonly LegalDocumentContent[] = [PRIVACY_POLICY, TERMS_OF_USE];
