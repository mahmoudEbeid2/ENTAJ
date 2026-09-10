import Image from "next/image";

const HELMET_ICON_SRC = "/assets/icons/icon-safety-helmet.svg";
const BANNER_STRIPES_SRC = "/assets/illustrations/safety-banner-stripes.svg";
const HARDHAT_PHOTO_SRC = "/assets/illustrations/safety-hardhat-photo.png";

const INTRO_PARAGRAPHS = [
  "At ENTAJ, safety is an essential part of how we source, store, handle, and deliver raw materials. We understand that every product requires careful management throughout its journey—from the supplier's facility to the customer's operations.",
  "Our approach begins with selecting reliable suppliers and reviewing the relevant product specifications and safety documentation. During storage and handling, we follow responsible practices designed to preserve material quality, reduce operational risks, and maintain suitable conditions for each product category.",
  "We also coordinate appropriate packaging, loading, and transportation procedures to help ensure that materials reach their destination safely, securely, and in dependable condition. By maintaining clear documentation and traceability throughout the supply process, we provide our customers with greater confidence in every shipment.",
];

const SAFETY_APPROACH_ITEMS = [
  {
    title: "Supplier & Material Verification",
    description:
      "We work with reliable suppliers and review available technical specifications, safety data, and supporting documentation before materials enter our supply chain.",
    iconSrc: "/assets/icons/icon-safety-supplier-verification.svg",
  },
  {
    title: "Controlled Storage",
    description:
      "Raw materials are managed under suitable storage conditions according to their characteristics and handling requirements, helping preserve product quality and reduce potential risks.",
    iconSrc: "/assets/icons/icon-safety-controlled-storage.svg",
  },
  {
    title: "Responsible Handling",
    description:
      "Careful procedures are followed during receiving, movement, loading, and unloading to help protect employees, products, facilities, and the surrounding environment.",
    iconSrc: "/assets/icons/icon-safety-responsible-handling.svg",
  },
  {
    title: "Secure Transportation",
    description:
      "We coordinate suitable packaging, load securing, and dependable logistics solutions based on the nature of each material and its transportation requirements.",
    iconSrc: "/assets/icons/icon-safety-secure-transportation.svg",
  },
  {
    title: "Documentation & Traceability",
    description:
      "Relevant product information and shipment documentation are maintained throughout the supply process, supporting transparency, accountability, and efficient communication.",
    iconSrc: "/assets/icons/icon-safety-documentation-traceability.svg",
  },
  {
    title: "Continuous Responsibility",
    description:
      "We continuously encourage safety awareness across our operations and work with our suppliers, logistics partners, and customers to support responsible practices at every stage.",
    iconSrc: "/assets/icons/icon-safety-continuous-responsibility.svg",
  },
];

/** Home page "Safety & Responsibility" section, sourced pixel-for-pixel from Figma file
 * FN3JXlqZI66ZzGFGnZaTv9 (node 18:2, page "SAFETY & RESPONSIBILITY"). Replaces the old
 * "Safety Equipment & PPE" DIVISIONS category, which moved here 2026-09-09. */
export function SafetyResponsibilitySection() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-entaj-light-grey">
      <div className="relative h-9 w-full bg-entaj-blue sm:h-[37px]">
        <Image src={BANNER_STRIPES_SRC} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-4 sm:mb-8">
          <span className="flex size-12 shrink-0 items-center justify-center sm:size-14">
            <Image src={HELMET_ICON_SRC} alt="" width={56} height={38} className="h-auto w-full" aria-hidden="true" />
          </span>
          <span className="rounded-full border border-entaj-light-blue px-6 py-3 font-expanded text-base font-medium text-gradient-entaj sm:px-8 sm:py-3.5 sm:text-xl">
            SAFETY &amp; RESPONSIBILITY
          </span>
        </div>

        <h2 className="font-expanded text-3xl font-semibold leading-tight text-entaj-blue sm:text-4xl lg:text-[40px]">
          Safety Across Every Step of the Supply Chain
        </h2>
        <p className="mt-3 font-expanded text-xl text-entaj-dark-grey sm:text-2xl">
          Safe Materials. Responsible Handling. Secure Delivery.
        </p>

        <div className="mt-6 flex max-w-[934px] flex-col-reverse gap-6 sm:mt-8 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex flex-1 flex-col gap-4 text-sm font-light leading-relaxed text-entaj-dark-grey">
            {INTRO_PARAGRAPHS.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="relative aspect-[241/333] w-full max-w-[241px] shrink-0 self-center overflow-hidden rounded-[24px] lg:self-start">
            <Image
              src={HARDHAT_PHOTO_SRC}
              alt="ENTAJ-branded hard hat held by a site worker"
              fill
              sizes="(min-width: 1024px) 241px, 60vw"
              className="object-cover"
            />
          </div>
        </div>

        <h3 className="mt-10 font-expanded text-2xl text-entaj-blue sm:mt-12">Our Safety Approach</h3>

        <div className="mt-6 flex max-w-[857px] flex-col gap-6 sm:mt-8 sm:gap-7">
          {SAFETY_APPROACH_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-4 sm:gap-5">
              <span className="flex size-10 shrink-0 items-center justify-center sm:size-11">
                <Image src={item.iconSrc} alt="" width={44} height={44} className="h-auto w-full" aria-hidden="true" />
              </span>
              <div>
                <p className="font-expanded text-sm font-bold text-entaj-dark-grey sm:text-base">{item.title}</p>
                <p className="mt-1 text-sm font-light leading-relaxed text-entaj-dark-grey">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
