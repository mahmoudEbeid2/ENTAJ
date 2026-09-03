import Image from "next/image";
import { storageUrl } from "@/lib/utils/asset-url";

export interface ContactOffice {
  id: number;
  label: string;
  flagIconPath?: string | null;
}

export function ContactInfoCard({
  email,
  website,
  offices,
}: {
  email?: string | null;
  website?: string | null;
  offices: ContactOffice[];
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[32px] sm:flex-row sm:rounded-[45px]">
      <div className="flex flex-col justify-center gap-6 bg-white px-8 py-10 sm:pl-14 sm:pr-10">
        {email ? (
          <div className="flex items-center gap-4">
            <Image
              src="/assets/icons/icon-email-circled.svg"
              alt=""
              width={48}
              height={48}
              className="size-11 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-expanded text-lg text-entaj-blue">E-Mail</p>
              <a href={`mailto:${email}`} className="text-[#272727] hover:underline">
                {email}
              </a>
            </div>
          </div>
        ) : null}
        {website ? (
          <div className="flex items-center gap-4">
            <Image
              src="/assets/icons/icon-website-circled.svg"
              alt=""
              width={48}
              height={48}
              className="size-11 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-expanded text-lg text-entaj-blue">Website</p>
              <span className="text-[#272727]">{website}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex-1 bg-entaj-light-grey px-8 py-10">
        <div className="mb-6 flex items-center justify-center gap-6">
          <span className="h-px flex-1 bg-entaj-blue/15" aria-hidden="true" />
          <div className="flex shrink-0 flex-col items-center gap-2">
            <Image
              src="/assets/icons/icon-location-circled.svg"
              alt=""
              width={44}
              height={44}
              className="size-10"
              aria-hidden="true"
            />
            <span className="font-expanded text-entaj-blue">Office</span>
          </div>
          <span className="h-px flex-1 bg-entaj-blue/15" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-center divide-x divide-entaj-blue/15">
          {offices.map((office) => (
            <div key={office.id} className="flex flex-col items-center gap-2 px-8 text-center">
              {office.flagIconPath ? (
                <Image
                  src={storageUrl(office.flagIconPath)!}
                  alt=""
                  width={40}
                  height={28}
                  className="h-7 w-10 rounded-sm object-cover"
                  aria-hidden="true"
                />
              ) : null}
              <span className="text-[#272727]">{office.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
