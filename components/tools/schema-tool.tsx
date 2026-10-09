"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Box, Button, IconButton, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { SelectField } from "@/components/tools/calculator-fields";
import { CodeOutput } from "@/components/tools/code-output";
import { IssueList } from "@/components/tools/issue-list";
import { TextInput } from "@/components/tools/text-input";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import {
  AVAILABILITY_OPTIONS,
  BUSINESS_TYPES,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildProductSchema,
  type ArticleInput,
  type BreadcrumbInput,
  type FaqInput,
  type LocalBusinessInput,
  type OrganizationInput,
  type ProductInput,
  type SchemaResult,
  type SchemaType,
} from "@/lib/tools/seo/schema";

interface Forms {
  article: ArticleInput;
  breadcrumbs: BreadcrumbInput;
  faq: FaqInput;
  localBusiness: LocalBusinessInput;
  organization: OrganizationInput;
  product: ProductInput;
}

const EMPTY: Forms = {
  article: { articleType: "Article", authorName: "", authorUrl: "", dateModified: "", datePublished: "", headline: "", imageUrl: "", publisherLogoUrl: "", publisherName: "", url: "" },
  breadcrumbs: { items: [{ name: "", url: "" }, { name: "", url: "" }] },
  faq: { items: [{ answer: "", question: "" }] },
  localBusiness: { businessType: "LocalBusiness", city: "", country: "", imageUrl: "", name: "", openingHours: "", postalCode: "", priceRange: "", region: "", street: "", telephone: "", url: "" },
  organization: { description: "", email: "", logoUrl: "", name: "", profiles: "", telephone: "", url: "" },
  product: { availability: "InStock", brand: "", currency: "", description: "", imageUrl: "", name: "", price: "", sku: "", url: "" },
};

const EXAMPLES: Forms = {
  article: { articleType: "BlogPosting", authorName: "Ann Lee", authorUrl: "https://www.example.com/team/ann", dateModified: "2026-10-10", datePublished: "2026-10-09", headline: "How to make an image smaller without losing quality", imageUrl: "https://www.example.com/images/shrink.png", publisherLogoUrl: "https://www.example.com/logo.png", publisherName: "Example Tools", url: "https://www.example.com/blog/shrink-images" },
  breadcrumbs: { items: [{ name: "Home", url: "https://www.example.com/" }, { name: "Blog", url: "https://www.example.com/blog" }, { name: "Shrink images", url: "" }] },
  faq: { items: [{ answer: "Yes. Every tool is free and needs no account.", question: "Is it free?" }, { answer: "No. Everything runs in your browser.", question: "Are my files uploaded?" }] },
  localBusiness: { businessType: "CafeOrCoffeeShop", city: "Sargodha", country: "PK", imageUrl: "", name: "Chai House", openingHours: "Mo-Sa 09:00-23:00\nSu 12:00-22:00", postalCode: "40100", priceRange: "$$", region: "Punjab", street: "12 Main Road", telephone: "+92 300 1234567", url: "https://www.chaihouse.example" },
  organization: { description: "Custom software and web products.", email: "hello@example.com", logoUrl: "https://www.example.com/logo.png", name: "Example Ltd", profiles: "https://x.com/example\nhttps://www.linkedin.com/company/example", telephone: "", url: "https://www.example.com" },
  product: { availability: "InStock", brand: "Acme", currency: "USD", description: "A hardcover notebook with 200 dotted pages.", imageUrl: "https://www.example.com/notebook.png", name: "Dotted notebook", price: "9.50", sku: "NB-200", url: "https://www.example.com/notebook" },
};

const TYPE_OPTIONS: readonly { label: string; value: SchemaType }[] = [
  { label: "FAQ page", value: "faq" },
  { label: "Article or blog post", value: "article" },
  { label: "Product", value: "product" },
  { label: "Local business", value: "localBusiness" },
  { label: "Organization", value: "organization" },
  { label: "Breadcrumbs", value: "breadcrumbs" },
];

const ARTICLE_TYPE_OPTIONS = [
  { label: "Article", value: "Article" },
  { label: "Blog post", value: "BlogPosting" },
  { label: "News article", value: "NewsArticle" },
];

const AVAILABILITY_SELECT = AVAILABILITY_OPTIONS.map((option) => ({ label: option.label, value: option.value }));
const BUSINESS_SELECT = BUSINESS_TYPES.map((type) => ({ label: type.replace(/([a-z])([A-Z])/g, "$1 $2"), value: type }));

interface RowsProps<Row> {
  addLabel: string;
  onChange: (rows: Row[]) => void;
  renderRow: (row: Row, index: number, update: (next: Row) => void) => ReactNode;
  rows: Row[];
  /** The least rows to keep. */
  minimum: number;
  empty: Row;
  removeLabel: string;
}

/**
 * A list of rows of fields that can grow and shrink, for questions and breadcrumb steps.
 */
function Rows<Row>({ addLabel, empty, minimum, onChange, removeLabel, renderRow, rows }: RowsProps<Row>): ReactNode {
  return (
    <Stack sx={{ gap: 1.5 }}>
      {rows.map((row, index) => (
        <Box key={index} sx={{ alignItems: "start", display: "grid", gap: 1, gridTemplateColumns: "minmax(0, 1fr) auto" }}>
          <Stack sx={{ gap: 1.5 }}>{renderRow(row, index, (next) => onChange(rows.map((current, position) => (position === index ? next : current))))}</Stack>
          <IconButton aria-label={`${removeLabel} ${index + 1}`} disabled={rows.length <= minimum} onClick={() => onChange(rows.filter((_, position) => position !== index))} size="small" sx={{ mt: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Box>
        <Button onClick={() => onChange([...rows, empty])} size="small" startIcon={<AddIcon />} variant="outlined">
          {addLabel}
        </Button>
      </Box>
    </Stack>
  );
}

/**
 * Builds structured data (JSON-LD) that helps search engines understand a page: FAQ, article,
 * product, local business, organization, and breadcrumb markup. It is checked as you type and
 * produces the script tag to paste into the page.
 */
export function SchemaTool(): ReactNode {
  const [type, setType] = useState<SchemaType>("faq");
  const [forms, setForms] = useState<Forms>(EMPTY);

  /**
   * Replaces the form of the chosen type.
   */
  function setForm<Key extends keyof Forms>(key: Key, value: Forms[Key]): void {
    setForms((current) => ({ ...current, [key]: value }));
  }

  const result: SchemaResult = {
    article: () => buildArticleSchema(forms.article),
    breadcrumbs: () => buildBreadcrumbSchema(forms.breadcrumbs),
    faq: () => buildFaqSchema(forms.faq),
    localBusiness: () => buildLocalBusinessSchema(forms.localBusiness),
    organization: () => buildOrganizationSchema(forms.organization),
    product: () => buildProductSchema(forms.product),
  }[type]();

  const article = forms.article;
  const product = forms.product;
  const business = forms.localBusiness;
  const organization = forms.organization;

  return (
    <ToolWorkspace
      label="Schema markup generator workspace"
      options={<Box sx={{ minWidth: 220 }}><SelectField id="schema-type" label="Type of markup" onChange={(value) => setType(value as SchemaType)} options={TYPE_OPTIONS} value={type} /></Box>}
      secondaryActions={
        <>
          <Button color="inherit" onClick={() => setForm(type, EXAMPLES[type])} size="small" startIcon={<LightbulbOutlinedIcon />}>
            Load example
          </Button>
          <Button color="inherit" onClick={() => setForm(type, EMPTY[type])} size="small" startIcon={<DeleteOutlinedIcon />}>
            Clear
          </Button>
        </>
      }
    >
      <Box sx={{ alignItems: "start", display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
        <Stack sx={{ gap: 2 }}>
          {type === "faq" ? (
            <Rows
              addLabel="Add a question"
              empty={{ answer: "", question: "" }}
              minimum={1}
              onChange={(items) => setForm("faq", { items })}
              removeLabel="Remove question"
              renderRow={(row, index, update) => (
                <>
                  <TextInput id={`faq-question-${index}`} label={`Question ${index + 1}`} onChange={(question) => update({ ...row, question })} value={row.question} />
                  <TextInput id={`faq-answer-${index}`} label={`Answer ${index + 1}`} maxLength={5000} multiline onChange={(answer) => update({ ...row, answer })} value={row.answer} />
                </>
              )}
              rows={forms.faq.items}
            />
          ) : null}

          {type === "article" ? (
            <>
              <SelectField id="article-type" label="Kind of article" onChange={(value) => setForm("article", { ...article, articleType: value as ArticleInput["articleType"] })} options={ARTICLE_TYPE_OPTIONS} value={article.articleType} />
              <TextInput helperText="Up to about 110 characters." id="article-headline" label="Headline" onChange={(headline) => setForm("article", { ...article, headline })} value={article.headline} />
              <TextInput id="article-url" label="Article address" onChange={(url) => setForm("article", { ...article, url })} placeholder="https://www.example.com/blog/post" value={article.url} />
              <TextInput id="article-image" label="Image address" onChange={(imageUrl) => setForm("article", { ...article, imageUrl })} value={article.imageUrl} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                <TextInput helperText="YYYY-MM-DD" id="article-published" label="Date published" onChange={(datePublished) => setForm("article", { ...article, datePublished })} value={article.datePublished} />
                <TextInput helperText="Optional." id="article-modified" label="Date changed" onChange={(dateModified) => setForm("article", { ...article, dateModified })} value={article.dateModified} />
                <TextInput id="article-author" label="Author name" onChange={(authorName) => setForm("article", { ...article, authorName })} value={article.authorName} />
                <TextInput helperText="Optional." id="article-author-url" label="Author page address" onChange={(authorUrl) => setForm("article", { ...article, authorUrl })} value={article.authorUrl} />
                <TextInput id="article-publisher" label="Publisher name" onChange={(publisherName) => setForm("article", { ...article, publisherName })} value={article.publisherName} />
                <TextInput helperText="Optional." id="article-logo" label="Publisher logo address" onChange={(publisherLogoUrl) => setForm("article", { ...article, publisherLogoUrl })} value={article.publisherLogoUrl} />
              </Box>
            </>
          ) : null}

          {type === "product" ? (
            <>
              <TextInput id="product-name" label="Product name" onChange={(name) => setForm("product", { ...product, name })} value={product.name} />
              <TextInput id="product-description" label="Description" maxLength={5000} multiline onChange={(description) => setForm("product", { ...product, description })} value={product.description} />
              <TextInput id="product-image" label="Image address" onChange={(imageUrl) => setForm("product", { ...product, imageUrl })} value={product.imageUrl} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                <TextInput helperText="A number, such as 19.99." id="product-price" label="Price" onChange={(price) => setForm("product", { ...product, price })} value={product.price} />
                <TextInput helperText="Three letters, such as USD." id="product-currency" label="Currency" onChange={(currency) => setForm("product", { ...product, currency: currency.toUpperCase() })} value={product.currency} />
                <SelectField id="product-availability" label="Availability" onChange={(value) => setForm("product", { ...product, availability: value as ProductInput["availability"] })} options={AVAILABILITY_SELECT} value={product.availability} />
                <TextInput id="product-brand" label="Brand" onChange={(brand) => setForm("product", { ...product, brand })} value={product.brand} />
                <TextInput id="product-sku" label="SKU" onChange={(sku) => setForm("product", { ...product, sku })} value={product.sku} />
                <TextInput id="product-url" label="Product page address" onChange={(url) => setForm("product", { ...product, url })} value={product.url} />
              </Box>
            </>
          ) : null}

          {type === "localBusiness" ? (
            <>
              <SelectField id="business-type" label="Kind of business" onChange={(value) => setForm("localBusiness", { ...business, businessType: value as LocalBusinessInput["businessType"] })} options={BUSINESS_SELECT} value={business.businessType} />
              <TextInput id="business-name" label="Business name" onChange={(name) => setForm("localBusiness", { ...business, name })} value={business.name} />
              <TextInput id="business-street" label="Street address" onChange={(street) => setForm("localBusiness", { ...business, street })} value={business.street} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                <TextInput id="business-city" label="City" onChange={(city) => setForm("localBusiness", { ...business, city })} value={business.city} />
                <TextInput id="business-region" label="State or region" onChange={(region) => setForm("localBusiness", { ...business, region })} value={business.region} />
                <TextInput id="business-postal" label="Postal code" onChange={(postalCode) => setForm("localBusiness", { ...business, postalCode })} value={business.postalCode} />
                <TextInput helperText="Two letters, such as PK." id="business-country" label="Country" onChange={(country) => setForm("localBusiness", { ...business, country: country.toUpperCase() })} value={business.country} />
                <TextInput helperText="With the country code." id="business-phone" label="Phone number" onChange={(telephone) => setForm("localBusiness", { ...business, telephone })} value={business.telephone} />
                <TextInput helperText="Such as $$ or $$$." id="business-price" label="Price range" onChange={(priceRange) => setForm("localBusiness", { ...business, priceRange })} value={business.priceRange} />
              </Box>
              <TextInput id="business-url" label="Website address" onChange={(url) => setForm("localBusiness", { ...business, url })} value={business.url} />
              <TextInput helperText="One line for each, such as Mo-Fr 09:00-17:00." id="business-hours" label="Opening hours" multiline onChange={(openingHours) => setForm("localBusiness", { ...business, openingHours })} value={business.openingHours} />
            </>
          ) : null}

          {type === "organization" ? (
            <>
              <TextInput id="org-name" label="Organization name" onChange={(name) => setForm("organization", { ...organization, name })} value={organization.name} />
              <TextInput id="org-url" label="Website address" onChange={(url) => setForm("organization", { ...organization, url })} value={organization.url} />
              <TextInput id="org-logo" label="Logo address" onChange={(logoUrl) => setForm("organization", { ...organization, logoUrl })} value={organization.logoUrl} />
              <TextInput id="org-description" label="Description" maxLength={1000} multiline onChange={(description) => setForm("organization", { ...organization, description })} value={organization.description} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                <TextInput id="org-email" label="Email" onChange={(email) => setForm("organization", { ...organization, email })} value={organization.email} />
                <TextInput id="org-phone" label="Phone number" onChange={(telephone) => setForm("organization", { ...organization, telephone })} value={organization.telephone} />
              </Box>
              <TextInput helperText="Pages about the organization elsewhere, one on each line." id="org-profiles" label="Profile links" multiline onChange={(profiles) => setForm("organization", { ...organization, profiles })} value={organization.profiles} />
            </>
          ) : null}

          {type === "breadcrumbs" ? (
            <Rows
              addLabel="Add a step"
              empty={{ name: "", url: "" }}
              minimum={2}
              onChange={(items) => setForm("breadcrumbs", { items })}
              removeLabel="Remove step"
              renderRow={(row, index, update) => (
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                  <TextInput id={`crumb-name-${index}`} label={`Step ${index + 1} name`} onChange={(name) => update({ ...row, name })} value={row.name} />
                  <TextInput helperText={index === forms.breadcrumbs.items.length - 1 ? "The last step may leave this out." : undefined} id={`crumb-url-${index}`} label={`Step ${index + 1} address`} onChange={(url) => update({ ...row, url })} value={row.url} />
                </Box>
              )}
              rows={forms.breadcrumbs.items}
            />
          ) : null}
        </Stack>

        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <IssueList issues={result.issues} />
          <CodeOutput id="schema-output" label="Script tag" placeholder="Fill in the form and the markup appears here. Paste it into the page it describes." value={result.script} />
        </Stack>
      </Box>
    </ToolWorkspace>
  );
}
