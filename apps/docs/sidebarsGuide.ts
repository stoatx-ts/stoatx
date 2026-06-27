// apps/docs/sidebarsGuide.ts
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "migrating-to-v1",
    {
      type: "category",
      label: "Getting Started",
      items: ["intro", "installation-and-setup", "events-and-managers"],
    },
    {
      type: "category",
      label: "Creating Your First App",
      collapsed: false,
      items: [
        "creating-your-first-app/project-setup",
        "creating-your-first-app/the-main-file",
        "creating-your-first-app/event-handling",
        "creating-your-first-app/creating-commands",
      ],
    },
  ],
};

export default sidebars;
