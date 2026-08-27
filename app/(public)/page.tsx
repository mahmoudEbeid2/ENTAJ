import type { Metadata } from "next";
import Image from "next/image";
import { getCtaPanel, getHomeDivisions, getMarketRegions, getPageSection, getStats, getValueProps, getWhyUsFeatures, getHeroSlides } from "@/lib/data/home";
import { getOffices, getSeoMeta, getSiteSettings } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Reveal } from "@/components/ui/reveal";
import { HeroCarousel } from "@/components/features/home/hero-carousel";
import { AboutShowcase } from "@/components/features/home/about-showcase";
import { WhyEntajBanner } from "@/components/features/home/why-entaj-banner";
import { StatBlock } from "@/components/ui/stat-block";
import { DivisionCard } from "@/components/ui/division-card";
import { WhyUsCard } from "@/components/ui/why-us-card";
import { RegionBlock } from "@/components/ui/region-block";
import { CtaPanel } from "@/components/ui/cta-panel";
import { WhatSetsApartPanel } from "@/components/features/home/what-sets-apart-panel";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("home");
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords ?? undefined,
    openGraph: seo.ogImagePath ? { images: [storageUrl(seo.ogImagePath)!] } : undefined,
  };
}

export default async function HomePage() {
  const [
    slides,
    stats,
    aboutSummary,
    valueProps,
    divisions,
    whatSetsApart,
    whyEntajIntro,
    whyUsFeatures,
    marketRegions,
    qualityPanel,
    contactPanel,
    settings,
    offices,
  ] = await Promise.all([
    getHeroSlides("home"),
    getStats("home", "counter"),
    getPageSection("home", "about_summary"),
    getValueProps(),
    getHomeDivisions(),
    getPageSection("home", "what_sets_apart"),
    getPageSection("home", "why_entaj_intro"),
    getWhyUsFeatures(),
    getMarketRegions(),
    getCtaPanel("quality_compliance"),
    getCtaPanel("home_contact_cta"),
    getSiteSettings(),
    getOffices(),
  ]);

  const contactAddressLine = offices.map((office) => office.address).join(" | ");

  const heroImages = slides.map((slide) => ({
    id: slide.id,
    src: storageUrl(slide.imagePath) ?? "",
    alt: slide.title,
  }));
  const primarySlide = slides[0];

  return (
    <>
      <HeroCarousel
        images={heroImages}
        title={primarySlide?.title ?? "ENTAJ"}
        subtitle={primarySlide?.subtitle}
        ctaPrimaryLabel={primarySlide?.ctaPrimaryLabel}
        ctaPrimaryHref={primarySlide?.ctaPrimaryHref}
        ctaSecondaryLabel={primarySlide?.ctaSecondaryLabel}
        ctaSecondaryHref={primarySlide?.ctaSecondaryHref}
      />

      <Section className="pb-0 pt-12 lg:pt-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal key={stat.id} delay={index * 80}>
                <StatBlock value={stat.value} label={stat.label} iconSrc={stat.iconPath} />
              </Reveal>
            ))}
          </div>
          <div
            className="mx-auto mt-[63px] h-[2.667px] w-full max-w-[1254px]"
            style={{ background: "linear-gradient(90deg, #2c388e, #73abd2)" }}
            aria-hidden="true"
          />
        </Container>
      </Section>

      {aboutSummary ? (
        <div className="py-10 lg:py-11">
          <Container>
            <Reveal>
              <AboutShowcase
                eyebrow={aboutSummary.eyebrow ?? "ABOUT US"}
                heading={aboutSummary.heading ?? "Who We Are"}
                body={aboutSummary.body ?? ""}
                imageSrc={storageUrl(aboutSummary.imagePath) ?? ""}
                imageAlt="ENTAJ headquarters"
                blobSrc={(aboutSummary.extra as { decorativeBlobPath?: string } | null)?.decorativeBlobPath}
              />
            </Reveal>
            <div className="mx-auto mt-10 h-px w-full max-w-[543px] bg-entaj-medium-grey/30" aria-hidden="true" />
          </Container>
        </div>
      ) : null}

      {whatSetsApart ? (
        <Section className="pb-8 lg:pb-10">
          <Container>
            <Reveal>
              <GradientHeading as="h2" className="mb-12 text-center text-5xl font-thin leading-none sm:text-7xl lg:text-[96px]">
                {whatSetsApart.heading}
              </GradientHeading>
            </Reveal>
            {whatSetsApart.imagePath ? (
              <Reveal variant="scale">
                <WhatSetsApartPanel
                  photoSrc={storageUrl(whatSetsApart.imagePath) ?? ""}
                  logoSrc={storageUrl(settings?.logoPath)}
                  items={valueProps.map((prop) => ({
                    id: prop.id,
                    title: prop.title,
                    description: prop.description,
                    iconSrc: prop.homeIconPath,
                  }))}
                />
              </Reveal>
            ) : null}
          </Container>
        </Section>
      ) : null}

      <Section className="pt-8 pb-8 lg:pt-10 lg:pb-10">
        <Container>
          <Reveal>
            <GradientHeading as="h2" className="mb-12 text-center text-5xl font-thin leading-none sm:text-7xl lg:text-[96px]">
              Divisions
            </GradientHeading>
          </Reveal>
          <div className="flex flex-col gap-10">
            {divisions.map((division, index) => (
              <Reveal key={division.id} delay={index * 100}>
                <DivisionCard
                  numeral={division.numeral}
                  name={division.name}
                  subtitle={division.subtitle}
                  imageSrc={storageUrl(division.imagePath)}
                  href={`/divisions#${division.slug}`}
                  ctaLabel={division.ctaLabel}
                  valueProps={valueProps}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-8 pb-8 lg:pt-10 lg:pb-10">
        <Container>
          {whyEntajIntro ? (
            <Reveal>
              <WhyEntajBanner
                label={whyEntajIntro.heading ?? "WHY ENTAJ"}
                heading={whyEntajIntro.subheading}
                imageSrc={storageUrl(whyEntajIntro.imagePath)}
              />
            </Reveal>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:gap-x-[100px] lg:gap-y-16">
            {whyUsFeatures.map((feature, index) => (
              <Reveal key={feature.id} delay={(index % 2) * 90}>
                <WhyUsCard
                  number={feature.number}
                  title={feature.title}
                  description={feature.description}
                  imageSrc={storageUrl(feature.imagePath)}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-8 pb-8 lg:pt-10 lg:pb-10">
        <Container>
          <Reveal>
            <GradientHeading as="h2" className="mb-12 text-center text-5xl font-thin leading-none sm:text-7xl lg:text-[96px]">
              Markets We Serve
            </GradientHeading>
          </Reveal>
          <Reveal variant="scale" className="relative mx-auto mb-14 aspect-[666.78/421.53] w-full max-w-[666.78px]">
            <Image
              src="/assets/illustrations/markets-we-serve-map.png"
              alt="Map of the markets ENTAJ serves across the Middle East, Africa, and Asia"
              fill
              sizes="(min-width: 1024px) 667px, 90vw"
              className="object-contain"
            />
          </Reveal>
          <div className="mx-auto flex max-w-[541px] flex-col gap-10 lg:gap-[49px]">
            {marketRegions.map((region, index) => (
              <Reveal key={region.id} delay={index * 90}>
                <RegionBlock name={region.name} countries={region.countries} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="flex flex-col gap-10 pt-8 lg:gap-[109px] lg:pt-10">
        <Container>
          {qualityPanel ? (
            <Reveal>
              <CtaPanel
                variant={qualityPanel.variant}
                heading={qualityPanel.heading}
                body={qualityPanel.body}
                illustrationSrc={qualityPanel.iconPath}
              />
            </Reveal>
          ) : null}
        </Container>
        <Container>
          {contactPanel ? (
            <Reveal>
              <CtaPanel
                variant={contactPanel.variant}
                heading={contactPanel.heading}
                subheading={contactPanel.subheading}
                body={contactPanel.body}
                illustrationSrc={storageUrl(contactPanel.illustrationPath)}
                buttonLabel={contactPanel.buttonLabel}
                buttonHref={contactPanel.buttonHref}
                email={settings?.contactEmail}
                address={contactAddressLine}
              />
            </Reveal>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
