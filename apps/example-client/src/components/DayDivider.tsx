import { Divider } from "@mantine/core";

const format = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

/** Separates messages from different days. */
export function DayDivider({ date }: { date: Date }) {
  return <Divider label={format.format(date)} labelPosition="center" mx="md" my="sm" />;
}
