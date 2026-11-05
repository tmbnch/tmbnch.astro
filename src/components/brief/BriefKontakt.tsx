import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react';
import { leseBriefRef } from '@/lib/briefRef';
import { streckeAusPfad } from '@/lib/funnelTracking';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/form/Button/button.variants';
import { Input } from '@/components/ui/form/Input/Input';
import {
  ergaenzeMetaCookies,
  erzeugeEventId,
  pushEvent,
  sammleAttribution,
  trackMetaLead,
} from '@/lib/leadTracking';

/**
 * Kontaktformular des Brief-Kanals (/b/).
 *
 * Bewusst nicht `FunnelQuiz` mit `questions={[]}`: Die Komponente traegt
 * Quiz-State, Progressbar, Auto-Advance und `funnel_quiz_start`-Events, die
 * hier alle sinnlos waeren — und ihre Texte duzen. Geteilt ist nur die
 * Tracking-Mechanik (`@/lib/leadTracking`), wo Divergenz ein echter Bug waere.
 *
 * Der Brief-Leser hat bereits gelesen und gescannt; er bekommt ein einstufiges
 * Formular ohne weitere Huerde.
 */

interface BriefKontaktProps {
  /** Funnel-Kennung fuer Auswertung, z. B. "brief-fertigung". */
  funnel: string;
  kontakt: { heading: string; text: string };
  /** Bewusst ohne Cal-Felder: Die Buchung steht auf der Seite weiter oben. */
  erfolg: { heading: string; text: string };
  privacyUrl?: string;
  endpoint?: string;
}

export function BriefKontakt({
  funnel,
  kontakt,
  erfolg,
  privacyUrl = '/datenschutz/',
  endpoint = '/api/funnel-lead',
}: BriefKontaktProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const attributionRef = useRef<Record<string, string>>({});
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
    if (letterRefRef.current) formData.set('letterRef', letterRefRef.current);
    // Der Endpoint erwartet das Feld; im Brief-Kanal gibt es keine Quiz-Antworten.
    formData.set('answers', '[]');

    const eventId = erzeugeEventId();
    formData.set('eventId', eventId);
    formData.set('utm', JSON.stringify(ergaenzeMetaCookies(attributionRef.current)));

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        pushEvent('brief_lead', { funnel, letterRef: letterRefRef.current || undefined });
        trackMetaLead(eventId);
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const errors = data.errors
          ? (Object.values(data.errors).flat().join(' ') as string)
          : 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.';
        setFormError(errors);
      }
    } catch {
      setFormError(
        'Senden fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={cardRef} className="scroll-mt-24">
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
        {submitted ? (
          // Bewusst ohne Termin-Button: Der Kalender steht auf dieser Seite
          // bereits weiter oben. Wer stattdessen geschrieben hat, wollte ihn
          // nicht — ihn hier erneut anzubieten, ignoriert diese Entscheidung.
          <div className="text-center">
            <div className="bg-brand-500/10 text-brand-600 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
              <Check aria-hidden="true" />
            </div>
            <h2 className="font-display text-foreground mt-4 text-xl font-bold tracking-tight sm:text-2xl">
              {erfolg.heading}
            </h2>
            <p className="text-foreground-secondary mx-auto mt-3 max-w-md text-sm leading-6 sm:text-base">
              {erfolg.text}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {kontakt.heading}
            </h2>
            <p className="text-foreground-secondary mt-2 text-sm leading-6 sm:text-base">
              {kontakt.text}
            </p>

            {/* Zweispaltig ab sm: Vier gestapelte Felder wirken wie ein
                Antragsformular. Auf dem Handy bleibt es einspaltig, dort ist
                Nebeneinander unlesbar. */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" type="text" required autoComplete="name" size="lg" />
                <Input
                  label="Telefon"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  size="lg"
                />
                <Input
                  label="E-Mail"
                  name="email"
                  type="email"
                  required
                  className="sm:col-span-2"
                  autoComplete="email"
                  inputMode="email"
                  size="lg"
                />
              </div>

              {/* Unter dem Raster statt am Feld: als Feld-Hint würde er die
                  Spaltenhöhen ungleich machen. */}
              <p className="text-foreground-muted text-xs leading-5">
                Wir rufen an, um mit euch einen Termin zu finden.
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
                  Ihre Daten nutzen wir ausschließlich zur Bearbeitung Ihrer Anfrage. Details in der{' '}
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
