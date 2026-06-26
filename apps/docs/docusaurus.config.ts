import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { readFileSync } from "node:fs";

let apiVersions: string[] = [];
try {
  apiVersions = JSON.parse(readFileSync("./api_versions.json", "utf-8"));
} catch (e) {
  // Fails gracefully if this is a fresh clone and the file doesn't exist yet
}

const latestApiVersion = apiVersions[0] ?? "current";

const dynamicVersions: Record<string, any> = {};

// If a stable version exists, automatically strip the legacy banner from it
if (latestApiVersion !== "current") {
  dynamicVersions[latestApiVersion] = {
    label: latestApiVersion,
    path: "",
    banner: "none",
    badge: true,
  };
}

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// @ts-ignore
const config: Config = {
  title: "Stoatx Documentation",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
  },

  url: "https://stoatx-ts.github.io",
  baseUrl: "/stoatx/",

  organizationName: "stoatx-ts",
  projectName: "stoatx",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          id: "default",
          path: "guide",
          routeBasePath: "guide",
          sidebarPath: "./sidebarsGuide.ts",
          editUrl: "https://github.com/stoatx-ts/stoatx/tree/main/apps/docs/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Stoatx Documentation",
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          docsPluginId: "default",
          position: "left",
          label: "Tutorial",
        },
        {
          to: "/docs/client",
          position: "left",
          label: "API Reference",
          activeBaseRegex: `/docs/`,
        },
        {
          type: "docsVersionDropdown",
          docsPluginId: "api",
          position: "right",
          dropdownActiveClassDisabled: true,
        },
        {
          href: "https://github.com/stoatx-ts/stoatx",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/stoatx-ts/stoatx",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Stoatx, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "api",
        path: "docs",
        routeBasePath: "docs",
        sidebarPath: "./sidebars.ts",

        includeCurrentVersion: false,

        lastVersion: latestApiVersion,
        versions: dynamicVersions,

        //@ts-expect-error - defaultSidebarItemsGenerator doesn't have any proper types afaik
        sidebarItemsGenerator: async function ({ defaultSidebarItemsGenerator, ...args }) {
          const sidebarItems = await defaultSidebarItemsGenerator(args);

          function formatCategories(items: any[]) {
            return items.map((item) => {
              if (item.type === "category") {
                const targetFolders = ["classes", "interfaces", "type-aliases", "variables", "enums", "functions"];

                if (targetFolders.includes(item.label)) {
                  item.label = item.label
                    .split("-")
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                }

                item.items = formatCategories(item.items);
              }
              return item;
            });
          }

          return formatCategories(sidebarItems);
        },
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        id: "client-api",
        entryPoints: ["../../packages/client/src/index.ts"],
        tsconfig: "../../packages/client/tsconfig.json",

        out: "docs/client",

        name: "Overview",

        excludeExternals: true,
        excludeInternal: true,
        excludePrivate: true,
        readme: "none",
        disableSources: true,

        parametersFormat: "table",
        enumMembersFormat: "table",
        typeDeclarationFormat: "table",

        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
        hideBreadcrumbs: true,
        hidePageHeader: true,
      },
    ],
  ],
};

export default config;
