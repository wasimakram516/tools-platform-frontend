import type { Guide } from "@/lib/guides/guide-types";

/**
 * SHA-1, SHA-256, SHA-384, and SHA-512 compared: output sizes, security status, where each is
 * used, and what not to use them for. Checked against NIST, Google, OWASP, and the RFCs.
 */
export const SHA_COMPARISON_GUIDE: Guide = {
  faqs: [
    {
      answer:
        "Use SHA-256 unless something you work with asks for another. It is the default for TLS certificates, software checksums, and most APIs, and no practical attack on it is known. SHA-512 is just as sound and gives a longer value.",
      question: "Which SHA should I use?",
    },
    {
      answer:
        "Not for anything where someone might forge a match. Google and CWI produced two different PDF files with the same SHA-1 hash in 2017, and NIST says SHA-1 should be phased out by 31 December 2030. It is still fine for spotting accidental changes, such as a corrupted download.",
      question: "Is SHA-1 still safe?",
    },
    {
      answer:
        "Not directly. A fast hash lets an attacker try billions of guesses a second. Store passwords with a slow password hashing method made for the job, such as Argon2id, scrypt, or bcrypt, as OWASP recommends.",
      question: "Can I store passwords as SHA-256 hashes?",
    },
    {
      answer:
        "No. A hash is one way: there is no key and nothing to reverse. The only way back is to guess inputs and compare, which works only for short or common inputs.",
      question: "Can a SHA hash be decrypted?",
    },
  ],
  intro:
    "SHA-1, SHA-256, SHA-384, and SHA-512 all turn any input into a fixed length fingerprint, but they are not equally safe. This guide compares their sizes and their security, says where each is still used, and explains what a plain hash should and should not be used for.",
  metaDescription:
    "SHA-1, SHA-256, SHA-384, and SHA-512 compared: output length, which are still secure, where each is used, and why none should store passwords alone.",
  name: "SHA-1 vs SHA-256 vs SHA-512",
  relatedGuides: ["jwt-claims"],
  relatedTools: ["sha256-hash-generator", "password-generator"],
  searchTerms: ["sha", "sha1", "sha256", "sha384", "sha512", "hash", "checksum", "md5"],
  sections: [
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A hash function reads any amount of data and returns a value of a fixed length, usually written in hexadecimal. The same input always gives the same value, and changing a single character changes it completely. A secure hash makes it impractical to find two inputs with the same value, a collision, or to find an input that gives a value chosen in advance.",
        },
        {
          caption: "The SHA family members side by side",
          columns: ["Algorithm", "Output", "Hex characters", "Status"],
          kind: "table",
          rows: [
            ["SHA-1", "160 bits", "40", "Broken for collisions. NIST says to phase it out by the end of 2030."],
            ["SHA-256", "256 bits", "64", "Secure. The usual default."],
            ["SHA-384", "384 bits", "96", "Secure. A shortened SHA-512, common in some government and TLS settings."],
            ["SHA-512", "512 bits", "128", "Secure. Often faster than SHA-256 on 64 bit processors without hash acceleration."],
          ],
        },
        {
          kind: "paragraph",
          text: "SHA-256, SHA-384, and SHA-512 are all part of SHA-2, defined in NIST's FIPS 180-4. SHA-1 is an older design from the same family. SHA-3, defined in FIPS 202, is a newer and completely different design, a backup in case SHA-2 is ever weakened.",
        },
      ],
      heading: "The family at a glance",
      id: "overview",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "Here is the word hello, with no line break after it, through each function. The values are what the [Hash Generator](/tools/hash-generator) shows for the same input.",
        },
        {
          caption: "Hashes of the word hello",
          columns: ["Algorithm", "Hash"],
          kind: "table",
          rows: [
            ["SHA-1", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"],
            ["SHA-256", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"],
            ["SHA-384", "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f"],
            ["SHA-512", "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"],
          ],
        },
        {
          kind: "paragraph",
          text: "If your own result differs, the input differs: a trailing line break, a space, or another character encoding. Hash tools almost always read text as UTF-8.",
        },
      ],
      heading: "The same input, four hashes",
      id: "example",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "In 2017, Google and the CWI Institute in Amsterdam published the first practical SHA-1 collision: two different PDF files with the same SHA-1 hash. That means SHA-1 can no longer prove that a file or a signed document is the one that was intended, because an attacker can prepare two that match. Browsers had already stopped trusting SHA-1 certificates.",
        },
        {
          kind: "paragraph",
          text: "In December 2022, NIST announced that SHA-1 should be phased out by 31 December 2030 in favour of SHA-2 and SHA-3, and recommended that anyone relying on it for security move as soon as possible. SHA-1 is still acceptable for checks against accidental damage, where nobody is trying to forge a match, and it remains inside some older protocols and tools. Git has long named objects by SHA-1 and now also supports repositories that use SHA-256.",
        },
      ],
      heading: "Why SHA-1 is retired",
      id: "sha-1",
    },
    {
      blocks: [
        {
          kind: "list",
          items: [
            "SHA-256 is the default almost everywhere: TLS certificates, software download checksums, package lock files, Bitcoin, and most API signing schemes.",
            "SHA-512 suits places that want a longer value, and it is often faster than SHA-256 in software on 64 bit processors. Processors with SHA-256 instructions reverse that.",
            "SHA-384 is SHA-512 with a different start and a shorter output. It appears in TLS cipher suites and in some government profiles.",
            "SHA-1 belongs only in legacy systems and in checks against accidental corruption.",
          ],
        },
      ],
      heading: "Where each one is used",
      id: "uses",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A hash proves that data has not changed only if the hash itself reached you safely. To prove who made a value, use a key: HMAC, defined in RFC 2104, mixes a secret key into the hash, so only someone with the key can make a matching value. Webhook and API signatures, such as HMAC-SHA256, work this way. A plain SHA-256 of a secret joined to a message is not a safe substitute, because SHA-2 hashes of that shape can be extended by an attacker who does not know the secret.",
        },
        {
          kind: "paragraph",
          text: "Do not store passwords as plain SHA hashes, even with a salt. SHA functions are designed to be fast, so an attacker with a leaked database can test guesses at enormous speed. OWASP's Password Storage Cheat Sheet recommends Argon2id, then scrypt, then bcrypt, which are slow on purpose and use a salt for every password. A long random password still matters, and the [Password Generator](/tools/password-generator) makes one in your browser.",
        },
        {
          kind: "paragraph",
          text: "MD5 is older than SHA-1 and broken more badly. Browsers' built in cryptography does not even offer it, so it is missing from the Hash Generator on purpose.",
        },
      ],
      heading: "What a plain hash is not for",
      id: "not-for",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "The [Hash Generator](/tools/hash-generator) shows SHA-1, SHA-256, SHA-384, and SHA-512 for any text at once, makes an HMAC when you add a key, and checks the result against a hash you paste in. The [SHA-256 Hash Generator](/tools/sha256-hash-generator) opens with the focus on SHA-256. Both run in your browser, so the text is never sent anywhere.",
        },
      ],
      heading: "Making and checking a hash",
      id: "tools",
    },
  ],
  seoTitle: "SHA-1 vs SHA-256 vs SHA-512 Compared",
  slug: "sha-1-vs-sha-256-vs-sha-512",
  sources: [
    { label: "NIST FIPS 180-4: Secure Hash Standard", url: "https://csrc.nist.gov/pubs/fips/180-4/upd1/final" },
    { label: "NIST FIPS 202: SHA-3 Standard", url: "https://csrc.nist.gov/pubs/fips/202/final" },
    { label: "NIST: NIST retires SHA-1 cryptographic algorithm", url: "https://www.nist.gov/news-events/news/2022/12/nist-retires-sha-1-cryptographic-algorithm" },
    { label: "Google Security Blog: Announcing the first SHA1 collision", url: "https://security.googleblog.com/2017/02/announcing-first-sha1-collision.html" },
    { label: "RFC 2104: HMAC", url: "https://www.rfc-editor.org/rfc/rfc2104" },
    { label: "OWASP: Password Storage Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" },
    { label: "Git: git init, including the SHA-256 object format", url: "https://git-scm.com/docs/git-init" },
  ],
  toolAction: "Open the Hash Generator",
  toolSlug: "hash-generator",
  updatedAt: "2026-11-14",
};
