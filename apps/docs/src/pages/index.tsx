import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import CodeBlock from "@theme/CodeBlock";

import styles from "./index.module.css";
import { JSX } from "react";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      className={clsx("hero hero--primary", styles.heroBanner)}
      style={{ padding: "4rem 0", textAlign: "center" }}
    >
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">
          A high-performance, fully-typed, and memory-efficient client library for the Stoat API.
        </p>

        <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
          <CodeBlock language="bash">pnpm add @stoatx/client</CodeBlock>
        </div>

        <div className={styles.buttons} style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link className="button button--secondary button--lg" to="/docs/client">
            View API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Home | ${siteConfig.title}`} description="Official documentation for the @stoatx/client library">
      <HomepageHeader />
      <main>{/* Maybe add features here? */}</main>
    </Layout>
  );
}
