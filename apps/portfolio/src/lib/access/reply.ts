import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

import { LOCATION } from "@/lib/constants";

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function formatExpiry(date: Date) {
  return `${format(new TZDate(date, LOCATION.timeZone), "MMM d, yyyy, HH:mm")} JST`;
}

export function copyReplyText({
  name,
  projectNames,
  password,
  expiresAt,
}: {
  name: string;
  projectNames: string[];
  password: string;
  expiresAt: Date | null;
}) {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const expiry = expiresAt
    ? `It works until ${formatExpiry(expiresAt)}.\n`
    : "";

  return `Hi ${firstName},

Thanks for your interest. Here's your password for ${joinNames(projectNames)}:

${password}

${expiry}Open the project, enter the password, and you're in. It's asked again after you close your browser.

Kiran`;
}
