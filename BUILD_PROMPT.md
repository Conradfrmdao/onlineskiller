# Codex Prompt

# Build OnlineSkiller

You are an expert full-stack SaaS engineer. Build a production-ready MVP for a subscription-based platform called OnlineSkiller.

OnlineSkiller helps creators launch their online digital product, business, or course using professional templates and ready marketing strategies.

Tagline:

“Launch your online digital product, business, and get marketing strategies to sell it.”

This is not a marketplace.

This is a SaaS platform where users pay $20–$50/month to keep their digital product or business page live.

The platform does not take commission from user earnings in version one.

Use this tech stack:

Next.js App Router
JavaScript
Clerk authentication
Neon PostgreSQL
Drizzle ORM
shadcn/ui
Tailwind CSS
Vercel deployment structure

Do not use TypeScript unless the project already uses TypeScript.

Use simple, readable JavaScript.

Prefer clear if statements instead of ternary operators.

## Core Product Flow

A user signs up.
The user completes onboarding.
The user creates a digital product or business page.
The user chooses a template.
The user adds page information.
The user embeds videos.
The user previews the page.
The user chooses a subscription plan.
The page goes live after active subscription.
The user accesses marketing videos, captions, hooks, hashtags, sales scripts, and marketing strategies.

## 1. Authentication

Use Clerk for:

Sign up
Sign in
Protected dashboard routes
Current user identity
User menu
Basic role checks

After sign in:

If the user has no creator profile, redirect to /dashboard/onboarding.

If the user has a creator profile, redirect to /dashboard.

## 2. Database

Use Neon PostgreSQL with Drizzle ORM.

Create schemas for:

users
creator_profiles
pages
page_sections
page_videos
course_modules
course_lessons
templates
subscriptions
payments
marketing_assets
marketing_captions
marketing_strategies
saved_marketing_assets
saved_marketing_strategies
content_calendar_items
instagram_accounts

Every table should have created_at and updated_at where needed.

Use proper foreign keys and relations.

## 3. User Roles

Support roles:

creator
admin

Default new users to creator.

Admin role can be manually set in the database for MVP.

Admin routes must be protected.

## 4. Creator Onboarding

Create route:

/dashboard/onboarding

Collect:

Display name
Business name
Bio
Country
Niche
Phone number
WhatsApp number
Instagram handle
TikTok handle
Website URL
Logo URL
Brand color
Creator slug

Save this to creator_profiles.

After onboarding, redirect to /dashboard.

## 5. Dashboard Layout

Create protected dashboard layout at:

/dashboard

Include:

Sidebar
Topbar
User menu
Subscription status badge
Quick action button
Mobile responsive navigation

Sidebar links:

Dashboard
Pages
Create Page
Marketing
Strategies
Calendar
Billing
Settings
Integrations

## 6. Dashboard Home

Create:

/dashboard

Show:

Welcome message
Subscription status
Number of pages
Number of live pages
Marketing assets saved
Strategies saved
Calendar items
Quick action cards

Quick actions:

Create new page
Choose template
View marketing library
Go to billing
Preview live pages

## 7. Page Builder System

Create routes:

/dashboard/pages
/dashboard/pages/new
/dashboard/pages/[pageId]/edit
/dashboard/pages/[pageId]/builder
/dashboard/pages/[pageId]/videos
/dashboard/pages/[pageId]/preview

A user can create different page types:

Online course
Digital product
Ebook
Coaching program
Service
Workshop
Paid community
Template pack
Consultation page
Other

Page fields:

Title
Slug
Subtitle
Description
Page type
Category
Price text
CTA text
CTA URL
WhatsApp enabled
Hero image URL
Intro video URL
Intro video provider
Template ID
Status
Is live
Published at

Statuses:

draft
preview
live
paused
expired

Only the owner can view or edit their page.

## 8. Page Sections

Create editable sections using page_sections.

Section types:

hero
benefits
features
what_you_get
who_it_is_for
testimonials
faq
pricing
creator_bio
curriculum
custom

Store flexible section content in content_json.

Allow users to show/hide sections and change sort order.

## 9. Video Embedding

Create page video management.

Route:

/dashboard/pages/[pageId]/videos

Allow users to add:

Video title
Video description
Video URL
Video provider
Duration
Preview flag
Sort order

Detect common providers:

YouTube
Vimeo
Bunny Stream
Cloudflare Stream
Mux
Generic URL

For online course page type, also support modules and lessons.

Routes can be simple:

/dashboard/pages/[pageId]/lessons

Each course page can have modules.

Each module can have lessons.

Lessons include:

Title
Description
Video URL
Video provider
Duration
Resource URL
Preview flag
Sort order

## 10. Templates

Create templates table.

Template fields:

Name
Slug
Description
Preview image URL
Config JSON
Page type
Premium flag
Active flag

Seed these templates:

Digital Hustle
Luxury Coach
Clean Academy
Creator Pro
Bold Seller
Tech Mentor
Service Expert
Ebook Launch
Workshop Page
Premium Consultant

Create admin template management.

Create user template selection inside page builder.

The MVP can render templates using simple layout variations.

## 11. Public Page

Create public route:

/p/[pageSlug]

Only show the page if:

Page status is live
Page is_live is true
Creator has active or trialing subscription

If not, show:

“This page is currently unavailable.”

The public page should render:

Hero
Title
Subtitle
Description
Intro video
Benefits
What buyer gets
Pricing
CTA
WhatsApp button
Testimonials
FAQ
Creator bio
Footer

Use the selected template and creator brand color where possible.

## 12. Preview Page

Create private preview route:

/dashboard/pages/[pageId]/preview

The owner can preview the page even without active subscription.

Show a top preview banner:

“Preview mode. This page is not live yet.”

## 13. Subscription and Billing

Create route:

/dashboard/billing

Show plans:

Starter — $20/month
Growth — $35/month
Pro — $50/month

For MVP, implement subscription records in database.

If Stripe is not configured, use placeholder buttons and admin manual activation.

Subscription statuses:

active
inactive
trialing
past_due
canceled
expired

A creator with active or trialing subscription can publish pages.

A creator without active or trialing subscription cannot publish pages.

## 14. Publishing Gate

When user clicks “Publish”:

Check subscription status.

If active or trialing:

Update page status to live
Set is_live to true
Set published_at to now

If not active:

Redirect to /dashboard/billing
Show message: “Choose a plan to make your page live.”

When a subscription is expired, public pages must not show.

## 15. Marketing Library

Create routes:

/dashboard/marketing
/dashboard/marketing/videos
/dashboard/marketing/[assetId]

Marketing asset fields:

Title
Description
Category
Niche
Tags
Video URL
Thumbnail URL
Source
License type
Duration
Orientation
Premium flag
Active flag

Marketing caption fields:

Hook
Caption
Hashtags
CTA
Voiceover script

Marketing asset detail should show:

Video preview
Title
Category
Hook
Caption
Hashtags
CTA
Voiceover script
Copy buttons
Download button
Save button

## 16. Marketing Strategies

Create routes:

/dashboard/marketing/strategies
/dashboard/marketing/strategies/[strategyId]

Marketing strategy fields:

Title
Slug
Category
Description
Steps JSON
Example captions JSON
Example posts JSON
Recommended CTA
Best platform
Difficulty level
Recommended page type
Premium flag
Active flag

Strategy categories:

Launch strategy
Instagram growth strategy
WhatsApp selling strategy
TikTok short-form strategy
Personal brand strategy
Content calendar strategy
DM closing strategy
Offer positioning strategy
Pricing strategy
Trust-building strategy

Strategy detail page should show:

Overview
Step-by-step plan
Example captions
Example posts
Recommended CTA
Best platform
Save strategy button

## 17. Content Calendar

Create route:

/dashboard/calendar

For MVP, allow users to create content calendar items manually.

Fields:

Title
Page
Marketing asset
Strategy
Caption
Platform
Scheduled date/time
Status

Statuses:

draft
scheduled
posted
failed
canceled

This does not need to publish to Instagram in MVP.

## 18. Instagram Integration Placeholder

Create route:

/dashboard/integrations/instagram

Show:

Instagram scheduling coming soon
Explanation that official Meta APIs will be used
Connect button disabled or beta
Professional account requirement text
Scheduled posting preview

Do not build username/password Instagram automation.

## 19. Admin Area

Create protected admin routes:

/admin
/admin/users
/admin/pages
/admin/templates
/admin/marketing-assets
/admin/marketing-strategies
/admin/subscriptions
/admin/settings

Admin can:

View users
View pages
Create templates
Edit templates
Activate/deactivate templates
Create marketing assets
Edit marketing assets
Create marketing captions
Create marketing strategies
Edit marketing strategies
Activate/deactivate assets and strategies
View subscriptions
Manually update subscription status

## 20. Landing Page

Create public landing page at:

/

Use this copy direction:

Headline:

“Launch your online digital product or business.”

Subheadline:

“OnlineSkiller helps creators build a professional page, publish it online, and get ready marketing strategies to sell.”

CTA:

“Start building your page”

Sections:

Hero
How it works
Supported page types
Templates
Marketing strategies
Marketing video library
Pricing
FAQ
Final CTA

Supported page types section should include:

Online courses
Ebooks
Coaching programs
Services
Workshops
Template packs
Paid communities
Consultation pages

## 21. Pricing Page

Create:

/pricing

Show:

Starter — $20/month
Growth — $35/month
Pro — $50/month

Each plan should include feature comparison.

CTA should send logged-out users to sign up.

Logged-in users should go to billing.

## 22. Settings

Create:

/dashboard/settings

Allow user to edit:

Display name
Business name
Bio
Country
Niche
Phone
WhatsApp
Instagram
TikTok
Website URL
Logo URL
Brand color
Slug

## 23. Security Requirements

Every dashboard route must require Clerk authentication.

Every server action must verify the current Clerk user.

Every user-specific query must filter by owner.

Admin pages must check role admin.

Public pages must only display live pages with active subscriptions.

Never trust client-side-only checks.

## 24. UI Requirements

Use shadcn/ui components:

Button
Card
Input
Textarea
Select
Badge
Tabs
Dialog
Dropdown
Table
Separator
Avatar
Alert
Sheet
Skeleton

Design style:

Modern SaaS
Clean dashboard
Mobile responsive
Premium cards
Clear CTAs
Good empty states
Simple forms
Beautiful template previews
Professional marketing library
Creator-friendly layout

## 25. Suggested Folder Structure

app/
page.js
pricing/page.js
p/[pageSlug]/page.js
dashboard/
layout.js
page.js
onboarding/page.js
pages/
marketing/
calendar/
billing/
settings/
integrations/
admin/
components/
dashboard/
marketing/
pages/
templates/
public-page/
ui/
db/
schema.js
index.js
queries/
lib/
auth.js
subscription.js
video-provider.js
slugs.js
utils.js
actions/
onboarding-actions.js
page-actions.js
template-actions.js
marketing-actions.js
billing-actions.js
admin-actions.js

## 26. MVP Completion Checklist

The MVP is complete when:

A user can sign up
A user can complete onboarding
A user can create a page
A user can choose a page type
A user can choose a template
A user can edit page content
A user can add embedded videos
A user can preview their page
A user can see billing plans
An admin can activate a subscription
A user with active subscription can publish a page
A public visitor can view the live page
A user without active subscription cannot publish
A user can browse marketing videos
A user can copy captions, hooks, hashtags, and scripts
A user can browse marketing strategies
A user can save marketing assets and strategies
A user can create content calendar items
An admin can manage templates, assets, strategies, users, and subscriptions

## 27. Final Instruction

Build the app step by step in a clean, maintainable way.

Do not over-engineer.

Prioritize the full user flow over advanced features.

The goal is a working SaaS MVP for OnlineSkiller:

Sign up
Build page
Choose template
Embed videos
Preview
Subscribe
Go live
Use marketing strategies to sell
