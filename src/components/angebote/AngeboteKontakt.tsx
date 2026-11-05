import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { leseBriefRef } from '@/lib/briefRef';
import { streckeAusPfad } from '@/lib/funnelTracking';
import { buttonVariants } from '@/components/ui/form/Button/button.variants';
import { Input } from '@/components/ui/form/Input/Input';
import {
  ergaenzeMetaCookies,
  erzeugeEventId,
  pushEvent,
  sammleAttribution,
  trackMetaLead,
  trackPlausible,
} from '@/lib/leadTracking';

/**
 * Kontaktformular der Angebotsbaustein-Seite (/f/angebote/).
 *
 * Schwester von `BriefKontakt.tsx`, nur in Ihr-Form und ohne Brief-Kennung:
 * Wer hier ankommt, kommt aus einem Social-Post oder der Suche, nicht aus
 * einem Anschreiben. Ein gemeinsames Formular hätte die Anrede durch jede
 * Zeile geschleift (siehe die Begründung in `briefLandings.ts`). Geteilt ist
 * nur die Tracking-Mechanik aus `@/lib/leadTracking`.
 */

interface AngeboteKontaktProps {
  /** Funnel-Kennung für die Auswertung in der Lead-Mail. */
  funnel?: string;
  heading: string;
  /** Leer lassen, wenn der Kontext darüber schon alles sagt. */
  text?: string;
  erfolg: { heading: string; text: string };
  privacyUrl?: string;
  /** Ohne eigenen Kartenrahmen, wenn das Formular schon in einer Karte sitzt. */
  plain?: boolean;
  endpoint?: string;
}

export function AngeboteKontakt({
  funnel = 'angebote',
  heading,
  text,
  erfolg,
  privacyUrl = '/datenschutz/',
  endpoint = '/api/funnel-lead',
  plain = false,
}: AngeboteKontaktProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const attributionRef = useRef<Record<string, string>>({});
  // Die `?r=`-Kennung aus Brief oder persoenlicher Mail, ueber `sessionStorage` auch nach
  // mehreren internen Klicks noch da.
  const letterRefRef = useRef<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attributionRef.current = sammleAttribution();
    letterRefRef.current = leseBriefRef();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    // Der Streckenname kommt aus dem Pfad, damit Abgabe und Öffnung im Board
    // dieselbe Strecke tragen. Die `funnel`-Prop bleibt für Plausible und die
    // fachliche Beschriftung zuständig.
    formData.set('funnel', streckeAusPfad());
    formData.set('page', window.location.href);
    // Der Endpoint erwartet das Feld; hier gibt es kein Quiz.
    formData.set('answers', '[]');

    const eventId = erzeugeEventId();
    formData.set('eventId', eventId);
    formData.set('utm', JSON.stringify(ergaenzeMetaCookies(attributionRef.current)));
    // Ohne das Feld kommt der Lead im CRM firmenlos an, obwohl der Brief ihn benennt.
    if (letterRefRef.current) formData.set('letterRef', letterRefRef.current);

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        pushEvent('angebote_lead', { funnel });
        trackPlausible('Lead', { funnel });
        trackMetaLead(eventId);
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const errors = data.errors
          ? (Object.values(data.errors).flat().join(' ') as string)
          : 'Etwas ist schiefgelaufen. Bitte versucht es noch einmal.';
        setFormError(errors);
      }
    } catch {
      setFormError('Senden fehlgeschlagen. Bitte prüft eure Verbindung und versucht es erneut.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={cardRef} className="scroll-mt-24">
      <div className={plain ? '' : 'border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8'}>
        {submitted ? (
          <div className="text-center">
            <div className="bg-brand-500/10 text-brand-600 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
              <Check aria-hidden="true" />
            </div>
            <h3 className="font-display text-foreground mt-4 text-xl font-bold tracking-tight sm:text-2xl">
              {erfolg.heading}
            </h3>
            <p className="text-foreground-secondary mx-auto mt-3 max-w-md text-sm leading-6 sm:text-base">
              {erfolg.text}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {heading}
            </h3>
            {text && (
              <p className="text-foreground-secondary mt-2 text-sm leading-6 sm:text-base">{text}</p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  size="lg"
                  requiredMark
                />
                <Input
                  label="Telefon"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  size="lg"
                  requiredMark
                />
                <Input
                  label="E-Mail"
                  name="email"
                  type="email"
                  required
                  requiredMark
                  className="sm:col-span-2"
                  autoComplete="email"
                  inputMode="email"
                  size="lg"
                />
              </div>

              <p className="text-foreground-muted text-xs leading-5">
                <span className="text-brand-500">*</span> Pflichtfeld. Die Telefonnummer für eine kurze
                Rückfrage. Wir rufen an, wenn es hilft.
              </p>

              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
              </div>

              {formError && (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={cn(buttonVariants({ size: 'lg', fullWidth: true }))}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Wird gesendet …
                  </>
                ) : (
                  <>
                    Nachricht senden
                    <ArrowRight aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="text-foreground-muted flex items-start gap-2 text-xs leading-5">
                <ShieldCheck
                  className="text-brand-500 mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Eure Daten nutzen wir nur, um diese Anfrage zu beantworten. Kein Newsletter, keine
                  Weitergabe. Details in der{' '}
                  <a
                    href={privacyUrl}
                    className="hover:text-foreground underline underline-offset-2"
                  >
                    Datenschutzerklärung
                  </a>
                  .
                </span>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
