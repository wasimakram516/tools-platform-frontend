import type { Guide } from "@/lib/guides/guide-types";

/**
 * JWT claims: the registered claims of RFC 7519, the header fields, common claims from OpenID
 * Connect and RFC 9068, and the checks a server should make. Checked against the RFCs.
 */
export const JWT_CLAIMS_GUIDE: Guide = {
  faqs: [
    {
      answer:
        "In seconds since 1 January 1970 UTC, not milliseconds. A value such as 1767225600 is a date in 2026. A thirteen digit value is almost always a bug, made by passing JavaScript's Date.now() straight into the token.",
      question: "Is exp in seconds or milliseconds?",
    },
    {
      answer:
        "No. The header and payload are only Base64URL encoded, so anyone holding the token can read them. Do not put passwords, secrets, or personal data you would not show the user into a JWT. Use JWE, the encrypted form, if the contents must be hidden.",
      question: "Is the payload of a JWT encrypted?",
    },
    {
      answer:
        "None, as far as the JWT standard goes: every registered claim is optional. The application decides. Access tokens that follow RFC 9068 must carry iss, exp, aud, sub, client_id, iat, and jti, and OpenID Connect ID tokens must carry iss, sub, aud, exp, and iat.",
      question: "Which JWT claims are required?",
    },
    {
      answer:
        "Paste the token into the JWT Decoder to see its header and payload. To read exp, nbf, or iat as a date, paste the number into the Unix Timestamp Converter.",
      question: "How do I see what is inside a token?",
    },
  ],
  intro:
    "A JSON Web Token carries claims: named facts about a user or a session, such as who issued the token, who it is for, and when it expires. This reference lists every registered claim, the header fields beside them, the claims OpenID Connect and OAuth access tokens add, and the checks a server should make before trusting any of them.",
  metaDescription:
    "Every registered JWT claim explained: iss, sub, aud, exp, nbf, iat, and jti, plus header fields and OpenID Connect claims, with formats and pitfalls.",
  name: "JWT claims reference",
  sections: [
    {
      blocks: [
        {
          kind: "paragraph",
          text: "A JWT in its usual signed form is three parts joined by dots: a header, a payload, and a signature. The header and the payload are JSON objects written in Base64URL, the URL safe variant of Base64. The payload's keys are the claims. The signature lets the receiver check that the first two parts were made by someone holding the key and have not been changed.",
        },
        {
          kind: "code",
          label: "A decoded payload",
          text: '{\n  "iss": "https://login.example.com",\n  "sub": "user_8412",\n  "aud": "https://api.example.com",\n  "iat": 1767225600,\n  "exp": 1767229200,\n  "scope": "orders:read"\n}',
        },
        {
          kind: "paragraph",
          text: "Claims come in three kinds. Registered claims are the seven short names defined by RFC 7519 below. Public claims are names listed in the IANA JSON Web Token Claims registry, such as name and email, or names that cannot clash because they are URLs. Private claims, such as scope above, are names that the issuer and the receiver agree on between themselves.",
        },
      ],
      heading: "What a claim is",
      id: "what-a-claim-is",
    },
    {
      blocks: [
        {
          caption: "Registered claims from RFC 7519, section 4.1",
          columns: ["Claim", "Name", "Value", "What it means"],
          kind: "table",
          rows: [
            ["iss", "Issuer", "A string, usually a URL", "Who made and signed the token."],
            ["sub", "Subject", "A string", "Who the token is about, usually a user id. Unique within the issuer."],
            ["aud", "Audience", "A string or a list of strings", "Who the token is meant for. A receiver that is not named must reject it."],
            ["exp", "Expiration time", "A NumericDate", "The token must not be accepted on or after this time."],
            ["nbf", "Not before", "A NumericDate", "The token must not be accepted before this time."],
            ["iat", "Issued at", "A NumericDate", "When the token was made, which tells its age."],
            ["jti", "JWT ID", "A string", "A unique id for this token, used to stop it being replayed or to revoke it."],
          ],
        },
        {
          kind: "paragraph",
          text: "RFC 7519 makes every one of these optional. Which ones a token carries, and which ones a server insists on, is up to the application, or to the profile it follows, such as OpenID Connect.",
        },
      ],
      heading: "The registered claims",
      id: "registered-claims",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "exp, nbf, and iat are NumericDate values: the number of seconds since 1970-01-01T00:00:00Z UTC, ignoring leap seconds. That is the same count as a Unix timestamp. The value may have a fraction, but most issuers use whole seconds.",
        },
        {
          kind: "list",
          items: [
            "Seconds, not milliseconds. A ten digit value such as 1767229200 is a date in 2026. A thirteen digit value read as seconds lands tens of thousands of years in the future, so a token that never seems to expire often has this bug.",
            "Allow a little clock skew. The RFC lets a server accept a token a short time past exp or before nbf, usually no more than a few minutes, because servers' clocks drift. Libraries call this leeway or clock tolerance.",
            "Keep access tokens short lived. An exp a few minutes to an hour after iat limits the harm if a token leaks, because a JWT cannot easily be taken back once issued.",
          ],
        },
        {
          kind: "paragraph",
          text: "To read one of these values as a date, paste it into the [Unix Timestamp Converter](/tools/unix-timestamp-converter).",
        },
      ],
      heading: "Times: exp, nbf, and iat",
      id: "times",
    },
    {
      blocks: [
        {
          caption: "Common JOSE header fields, from RFC 7515",
          columns: ["Field", "Name", "What it means"],
          kind: "table",
          rows: [
            ["alg", "Algorithm", "How the token was signed, such as HS256, RS256, or ES256. The value none means it is not signed at all."],
            ["typ", "Type", "The kind of token, usually JWT, or at+jwt for an access token that follows RFC 9068."],
            ["kid", "Key ID", "Which of the issuer's keys signed the token, so the receiver can pick the right key to check it."],
            ["cty", "Content type", "Used when the payload is itself a token, such as a JWT inside an encrypted JWT."],
          ],
        },
        {
          kind: "paragraph",
          text: "The header is not protected from the person sending the token, so a server must never let it choose the rules. A server that trusts alg from the header can be tricked into accepting none, or into checking an RS256 token as HS256 with its public key as the secret. Decide the allowed algorithms on the server and reject anything else.",
        },
      ],
      heading: "Header fields",
      id: "header",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "OpenID Connect, the sign in layer on top of OAuth 2.0, defines the ID token. It must carry iss, sub, aud, exp, and iat, and it adds claims of its own:",
        },
        {
          caption: "Claims added by OpenID Connect and by RFC 9068 access tokens",
          columns: ["Claim", "Used in", "What it means"],
          kind: "table",
          rows: [
            ["auth_time", "OpenID Connect", "When the user last actually signed in, as a NumericDate."],
            ["nonce", "OpenID Connect", "A value the app sent with the sign in request and must find unchanged in the token, which stops replay."],
            ["azp", "OpenID Connect", "Authorized party: the client id the token was issued to."],
            ["email, name", "OpenID Connect", "Standard profile claims, present when the app asked for them and the provider includes them."],
            ["client_id", "RFC 9068 access tokens", "The OAuth client that asked for the access token."],
            ["scope", "RFC 9068 access tokens", "The permissions granted, as a space separated list."],
          ],
        },
        {
          kind: "paragraph",
          text: "RFC 9068 sets out a common format for OAuth 2.0 access tokens that are JWTs. Such a token has the type at+jwt and must carry iss, exp, aud, sub, client_id, iat, and jti.",
        },
      ],
      heading: "Claims from OpenID Connect and OAuth",
      id: "oidc",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "Decoding a token only reads it. Before a server acts on any claim, it should check, in line with RFC 8725, the JWT best practice:",
        },
        {
          kind: "list",
          items: [
            "The signature, with a key it already trusts and an algorithm on its own allowed list.",
            "iss, so the token came from the issuer it expects.",
            "aud, so the token was meant for this service and not another one that trusts the same issuer.",
            "exp and nbf, with a small leeway for clock skew.",
            "typ, where the issuer sets it, so an ID token cannot be used as an access token.",
          ],
        },
        {
          kind: "paragraph",
          text: "Keep the payload small, because the token travels with every request, and remember that it is readable by anyone who has it.",
        },
      ],
      heading: "What to check before trusting a token",
      id: "validation",
    },
  ],
  seoTitle: "JWT Claims Reference: exp, iat, sub, aud",
  slug: "jwt-claims",
  sources: [
    { label: "RFC 7519: JSON Web Token (JWT)", url: "https://www.rfc-editor.org/rfc/rfc7519" },
    { label: "RFC 7515: JSON Web Signature (JWS)", url: "https://www.rfc-editor.org/rfc/rfc7515" },
    { label: "RFC 8725: JSON Web Token Best Current Practices", url: "https://www.rfc-editor.org/rfc/rfc8725" },
    { label: "RFC 9068: JWT Profile for OAuth 2.0 Access Tokens", url: "https://www.rfc-editor.org/rfc/rfc9068" },
    { label: "OpenID Connect Core 1.0", url: "https://openid.net/specs/openid-connect-core-1_0.html" },
    { label: "IANA: JSON Web Token Claims registry", url: "https://www.iana.org/assignments/jwt/jwt.xhtml" },
  ],
  toolAction: "Open the JWT Decoder",
  toolSlug: "jwt-decoder",
  updatedAt: "2026-11-14",
};
