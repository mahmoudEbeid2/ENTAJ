import type { Metadata } from "next";
import Image from "next/image";
import { getCtaPanel, getHeroSlides, getPageSection, getStats, getValueProps } from "@/lib/data/home";
import { getOffices, getSeoMeta, getSiteSettings } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/layout/page-hero";
import { StatTimeline } from "@/components/ui/stat-timeline";
import { CtaPanel } from "@/components/ui/cta-panel";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("about");
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords ?? undefined,
    openGraph: seo.ogImagePath ? { images: [storageUrl(seo.ogImagePath)!] } : undefined,
  };
}

export default async function AboutPage() {
  const [slides, intro, story, timelineStats, valueProps, ctaPanel, settings, offices] = await Promise.all([
    getHeroSlides("about"),
    getPageSection("about", "intro"),
    getPageSection("about", "story"),
    getStats("about", "timeline"),
    getValueProps(),
    getCtaPanel("about_contact_cta"),
    getSiteSettings(),
    getOffices(),
  ]);

  const hero = slides[0];
  const extra = (story?.extra ?? {}) as { timelineLinePath?: string; timelineDotPath?: string };
  const contactAddressLine = offices.map((office) => office.address).join(" | ");

  return (
    <>
      {hero ? <PageHero title={hero.title} imageSrc={storageUrl(hero.imagePath) ?? ""} imageAlt={hero.title} /> : null}

      {intro ? (
        <Section className="pt-16 pb-0 lg:pt-[180px] lg:pb-0">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                {intro.eyebrow ? (
                  <p className="mb-3 font-expanded text-sm font-semibold tracking-widest text-entaj-blue">{intro.eyebrow}</p>
                ) : null}
                <h2 className="mb-6 font-expanded text-3xl font-semibold text-entaj-dark-grey lg:text-5xl">{intro.heading}</h2>
                <p className="text-entaj-medium-grey leading-relaxed">{intro.body}</p>
              </Reveal>
              {settings?.logoLockupPath ? (
                <Reveal variant="scale" delay={120}>
                  <Image
                    src={storageUrl(settings.logoLockupPath) ?? ""}
                    alt={settings.siteName ?? "ENTAJ"}
                    width={432}
                    height={142}
                    className="mx-auto h-auto w-full max-w-[380px]"
                  />
                </Reveal>
              ) : null}
            </div>

            {story ? (
              <div className="mt-16 grid items-start gap-12 lg:mt-[131px] lg:grid-cols-2">
                <Reveal>
                  <p className="text-entaj-dark-grey leading-relaxed lg:text-lg">{story.body}</p>
                </Reveal>
                <Reveal delay={120}>
                  <StatTimeline items={timelineStats} linePath={extra.timelineLinePath} dotPath={extra.timelineDotPath} />
                </Reveal>
              </div>
            ) : null}
          </Container>
        </Section>
      ) : null}

      <Section className="pt-16 pb-16 lg:pt-[84px] lg:pb-0">
        <Container>
          <Reveal>
            <GradientHeading as="h2" className="mb-4 text-5xl font-thin leading-none lg:text-[96px]">
              What Sets Us Apart
            </GradientHeading>
          </Reveal>
          <div className="mb-10 h-[6px] w-full max-w-[1120px] rounded-full bg-gradient-entaj" aria-hidden="true" />
          <div className="flex flex-col gap-8 lg:gap-[44px]">
            {valueProps.map((prop, index) => (
              <Reveal key={prop.id} delay={index * 80}>
                <div className="flex items-center gap-3">
                  <span className="font-expanded text-lg text-entaj-dark-grey">{String(index + 1).padStart(2, "0")}</span>
                  {prop.aboutIconPath ? (
                    <Image src={storageUrl(prop.aboutIconPath)!} alt="" width={40} height={40} className="size-9" aria-hidden="true" />
                  ) : null}
                </div>
                <h3 className="mt-2 font-expanded text-lg font-bold text-entaj-dark-grey">
                  {prop.aboutTitle ?? prop.title}
                </h3>
                <p className="mt-1 text-entaj-medium-grey leading-relaxed">{prop.aboutDescription ?? prop.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {ctaPanel ? (
        <Section className="pt-16 pb-16 lg:pt-[136px] lg:pb-[167px]">
          <Container>
            <Reveal>
              <CtaPanel
                variant={ctaPanel.variant}
                heading={ctaPanel.heading}
                subheading={ctaPanel.subheading}
                body={ctaPanel.body}
                illustrationSrc={storageUrl(ctaPanel.illustrationPath)}
                buttonLabel={ctaPanel.buttonLabel}
                buttonHref={ctaPanel.buttonHref}
                email={settings?.contactEmail}
                address={contactAddressLine}
              />
            </Reveal>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
