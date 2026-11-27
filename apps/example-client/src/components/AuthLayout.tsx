import type { ReactNode } from "react";
import { Center, Container, Paper, Stack, Text, Title } from "@mantine/core";

interface AuthLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Shown under the card, e.g. a security note. */
  footer?: ReactNode;
}

/** A centered card for the login and onboarding screens. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <Center mih="100dvh" p="md">
      <Container size={420} w="100%" p={0}>
        <Stack gap="lg">
          <Stack gap={4} ta="center">
            <Title order={2}>{title}</Title>
            {description && (
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            )}
          </Stack>
          <Paper withBorder shadow="sm" p="xl" radius="md">
            {children}
          </Paper>
          {footer}
        </Stack>
      </Container>
    </Center>
  );
}
