import Link from 'next/link'
import { LeadCaptureForm } from './LeadCaptureForm'
import type { MarketingAction, MarketingPageConfig, MarketingResource } from './types'
import styles from './MarketingPage.module.css'

type MarketingPageProps = {
  config: MarketingPageConfig
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function ActionLink({ action }: { action: MarketingAction }) {
  const variant = action.variant || 'primary'

  return (
    <Link className={cx(styles.action, styles[variant])} href={action.href}>
      {action.label}
    </Link>
  )
}

function ResourceCard({ resource }: { resource: MarketingResource }) {
  const content = (
    <>
      <span className={styles.resourceLabel}>{resource.label || (resource.isComingSoon ? 'Coming soon' : 'Resource')}</span>
      <h3>{resource.title}</h3>
      <p>{resource.description}</p>
      {resource.disclosure ? <small>{resource.disclosure}</small> : null}
    </>
  )

  if (!resource.href || resource.isComingSoon) {
    return <article className={cx(styles.resourceCard, styles.disabledResource)}>{content}</article>
  }

  if (resource.isExternal) {
    return (
      <a className={styles.resourceCard} href={resource.href} target="_blank" rel="noreferrer sponsored noopener">
        {content}
      </a>
    )
  }

  return (
    <Link className={styles.resourceCard} href={resource.href}>
      {content}
    </Link>
  )
}

export function MarketingPage({ config }: MarketingPageProps) {
  const accent = config.accent || 'blue'

  return (
    <main className={cx(styles.page, styles[accent])}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className={styles.description}>{config.description}</p>

          {config.heroBadges?.length ? (
            <div className={styles.badges} aria-label="Page highlights">
              {config.heroBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          ) : null}

          {config.primaryAction || config.secondaryAction ? (
            <div className={styles.actions}>
              {config.primaryAction ? <ActionLink action={config.primaryAction} /> : null}
              {config.secondaryAction ? <ActionLink action={config.secondaryAction} /> : null}
            </div>
          ) : null}
        </div>

        <aside className={styles.heroPanel} aria-label="WaveNation page summary">
          <div className={styles.signal} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>AMPLIFY YOUR VIBE</p>
          <strong>Culture. Creators. Community. Connected.</strong>
        </aside>
      </section>

      {config.stats?.length ? (
        <section className={styles.stats} aria-label="WaveNation highlights">
          {config.stats.map((stat) => (
            <article key={`${stat.label}-${stat.value}`}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              {stat.detail ? <p>{stat.detail}</p> : null}
            </article>
          ))}
        </section>
      ) : null}

      {config.sections?.length ? (
        <div className={styles.sections}>
          {config.sections.map((section) => (
            <section key={section.title} className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                {section.eyebrow ? <p>{section.eyebrow}</p> : null}
                <h2>{section.title}</h2>
                {section.description ? <span>{section.description}</span> : null}
              </div>

              {section.items?.length ? (
                <div className={styles.cardGrid}>
                  {section.items.map((item) => (
                    <article key={item.title} className={styles.infoCard}>
                      {item.meta ? <span>{item.meta}</span> : null}
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      {config.resources?.length ? (
        <section className={styles.resourceSection}>
          <div className={styles.sectionHeader}>
            <p>Creator resources</p>
            <h2>Tools, storefronts, and affiliate links</h2>
            <span>Use this section for future storefronts, recommended creator tools, and disclosed affiliate links.</span>
          </div>
          <div className={styles.resourceGrid}>
            {config.resources.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} />
            ))}
          </div>
        </section>
      ) : null}

      {config.form ? (
        <section className={styles.formSection} id="request-form">
          <div className={styles.formIntro}>
            <p>Start the conversation</p>
            <h2>Send your request to WaveNation.</h2>
            <span>
              Submissions route to the WaveNation team for review. A team member can follow up by email when the request is a fit.
            </span>
          </div>
          <LeadCaptureForm config={config.form} pageTitle={config.title} />
        </section>
      ) : null}

      {config.faqs?.length ? (
        <section className={styles.faqs}>
          <div className={styles.sectionHeader}>
            <p>Support notes</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div className={styles.faqGrid}>
            {config.faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {config.footerCta ? (
        <section className={styles.footerCta}>
          {config.footerCta.eyebrow ? <p>{config.footerCta.eyebrow}</p> : null}
          <h2>{config.footerCta.title}</h2>
          {config.footerCta.description ? <span>{config.footerCta.description}</span> : null}
          {config.footerCta.actions?.length ? (
            <div className={styles.actions}>
              {config.footerCta.actions.map((action) => (
                <ActionLink key={action.href} action={action} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}
