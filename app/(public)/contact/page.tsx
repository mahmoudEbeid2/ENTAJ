import type { Metadata } from "next";
import { getDivisions } from "@/lib/data/content";
import { getHeroSlides, getPageSection } from "@/lib/data/home";
import { getOffices, getSeoMeta, getSiteSettings } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/layout/page-hero";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { ContactInfoCard } from "@/components/ui/contact-info-card";
import { ContactForm } from "@/features/contact/contact-form";
import { Reveal } from "@/components/ui/reveal";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("contact");
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords ?? undefined,
    openGraph: seo.ogImagePath ? { images: [storageUrl(seo.ogImagePath)!] } : undefined,
  };
}

export default async function ContactPage() {
  const [slides, getInTouch, settings, offices, divisions] = await Promise.all([
    getHeroSlides("contact"),
    getPageSection("contact", "get_in_touch"),
    getSiteSettings(),
    getOffices(),
    getDivisions(),
  ]);

  const hero = slides[0];
  const logoLockupSrc = storageUrl(settings?.logoLockupPath);

  return (
    <>
      {hero ? (
        <PageHero title={hero.title} imageSrc={storageUrl(hero.imagePath) ?? ""} imageAlt={hero.title} titleVariant="stroke" />
      ) : null}

      <Section>
        <Container narrow>
          <Reveal>
            <ContactInfoCard
              email={settings?.contactEmail}
              website={settings?.contactWebsite}
              offices={offices}
            />
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container narrow className="text-center">
          {logoLockupSrc ? (
            <Image
              src={logoLockupSrc}
              alt={settings?.siteName ?? "ENTAJ"}
              width={216}
              height={71}
              className="mx-auto mb-8 h-auto w-[180px]"
            />
          ) : null}

          {getInTouch ? (
            <Reveal>
              <GradientHeading as="h2" className="mb-4 text-5xl lg:text-[99px]">
                {getInTouch.heading}
              </GradientHeading>
              {getInTouch.subheading ? (
                <p className="text-gradient-entaj mb-10 border-b border-entaj-blue/15 pb-10 font-expanded text-2xl font-bold">
                  {getInTouch.subheading}
                </p>
              ) : null}
            </Reveal>
          ) : null}

          <ContactForm
            divisions={divisions.map((division) => ({ id: division.id, name: division.shortName ?? division.name }))}
          />
        </Container>
      </Section>
    </>
  );
}
