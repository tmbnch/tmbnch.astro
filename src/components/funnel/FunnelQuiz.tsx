import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, Check, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/form/Button/button.variants';
import { Input } from '@/components/ui/form/Input/Input';
import type { FunnelQuizQuestion } from '@/data/funnels';
import {
  ergaenzeMetaCookies,
  erzeugeEventId,
  pushEvent,
  sammleAttribution,
  trackMetaLead,
  trackPlausible,
} from '@/lib/leadTracking';
import { meldeEreignis, streckeAusPfad, type FunnelEreignis } from '@/lib/funnelTracking';
import { leseBriefRef } from '@/lib/briefRef';
import { einordnungFuer, type EinordnungsStrecke } from '@/lib/quizEinordnung';
import { rechnungFuer, type RechnungsStrecke } from '@/lib/quizRechnung';

interface FunnelQuizProps {
  /**
   * Label für Plausible und das Meta-Pixel. Ans Sales-Backend geht immer die
   * Strecke aus dem Pfad (`streckeAusPfad`), nie dieser Wert — sonst trügen
   * Öffnung und Abgabe im Board zwei verschiedene Namen. Ohne Angabe ist beides
   * dasselbe, und genau das ist der Normalfall.
   */
  funnel?: string;
  questions: FunnelQuizQuestion[];
  contact: { heading: string; text: string };
  success: { heading: string; text: string; calUrl?: string; calLabel?: string };
  privacyUrl?: string;
  endpoint?: string;
  /** Text des Absende-Knopfs. */
  submitLabel?: string;
  /** Hinweis unter dem Telefonfeld. */
  phoneHint?: string;
  /** Eigener dataLayer-Event für den Lead, zusätzlich als Plausible-Event „Lead“. */
  leadEvent?: string;
  /**
   * Kompakte Form für ein Quiz neben dem Hero-Text: kleinere Abstände und Optionen,
   * Kontaktfelder zu zweit nebeneinander, damit der Hero in eine Bildschirmhöhe passt.
   */
  compact?: boolean;
  /** Pflichtfelder mit Sternchen markieren, dazu der Hinweis „* Pflichtfeld“. */
  markRequired?: boolean;
  /**
   * Zeigt im Kontaktschritt über dem Formular eine Schnell-Einschätzung aus den Antworten: die
   * Überschrift der passenden Aussage aus `src/data/quizEinordnung.json`, den Rest klärt das
   * Gespräch. Kein eigener Schritt und kein Absatz Text: Jeder Klick und jede Zeile mehr kurz
   * vor dem Abschicken kostet Leute.
   */
  einordnung?: EinordnungsStrecke;
  /**
   * Zeigt im Kontaktschritt die Stunden-Rechnung aus den Antworten (`src/lib/quizRechnung.ts`).
   * Hat Vorrang vor `einordnung`.
   */
  rechnung?: RechnungsStrecke;
  /** Wer zurückruft: Foto, Name und Erfahrung direkt über den Formularfeldern. */
  kontaktPerson?: { bild: string; name: string; rolle: string };
}

interface QuizAnswer {
  questionId: string;
  question: string;
  optionId: string;
  answer: string;
  detail?: string;
}

/**
 * Quiz-Ereignisse, die das Sales-Backend pro Firma festhält — und das ist nur die Abgabe.
 *
 * Start, Schritt und erreichter Kontaktschritt gehen ausschließlich an Plausible: Das sind
 * Trichter-Fragen über alle Besucher ("an welcher Frage steigen die Leute aus"), und genau
 * dafür ist Plausible da. Im CRM wäre jeder Schritt eine eigene Zeile und eine eigene
 * Slack-Meldung — ein einziger Besucher löste damit fünf aus, und ein Kanal, den man
 * stummschaltet, meldet gar nichts mehr.
 *
 * Was das CRM braucht, sind zwei Tatsachen: Die Firma hat den Link geöffnet (`page_view`,
 * gemeldet vom `FunnelLayout`) und sie hat abgeschickt (`quiz_lead`, hier).
 */
/**
 * Pflicht sind Name, Telefon und E-Mail, auf jeder Strecke gleich: Marten ruft zurück, und wen
 * er nicht erreicht, dem schreibt er. `netlify/functions/funnel-lead.ts` prüft dasselbe.
 * Diese Felder bekommen eigenes Tracking, so zeigt `formular_feld`, an welchem jemand aufhört.
 */
const PFLICHTFELDER = new Set(['name', 'phone', 'email']);

const BACKEND_EVENTS: Record<string, FunnelEreignis> = {
  funnel_lead: 'quiz_lead',
};

export function FunnelQuiz({
  funnel: funnelLabel,
  questions,
  contact,
  success,
  privacyUrl = '/datenschutz/',
  endpoint = '/api/funnel-lead',
  submitLabel = 'Ersteinschätzung anfordern',
  phoneHint = 'Für eine kurze Rückfrage - wir rufen nur an, wenn es hilft.',
  leadEvent,
  compact = false,
  markRequired = false,
  einordnung: einordnungsStrecke,
  rechnung: rechnungsStrecke,
  kontaktPerson,
}: FunnelQuizProps) {
  // Schritte: 0..questions.length-1 = Fragen, questions.length = Kontakt
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [freeText, setFreeText] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const utmRef = useRef<Record<string, string>>({});
  // Die `?r=`-Kennung aus Brief oder persoenlicher Mail. Einmal beim Mount gelesen und in
  // einem Ref gehalten: `leseBriefRef` sichert sie in `sessionStorage`, also ueberlebt sie
  // auch mehrere interne Klicks bis hierher.
  const letterRefRef = useRef<string>('');
  // Ohne eigene Beschriftung ist das Plausible-Label die Strecke selbst, damit eine
  // Aufrufstelle nicht aus Versehen einen dritten Namen einführt. Erst im Effect
  // gesetzt: beim statischen Render gibt es keinen Pfad, und ein dort berechneter
  // Wert wäre für jede Seite derselbe.
  const funnelRef = useRef<string>(funnelLabel ?? '');
  const cardRef = useRef<HTMLDivElement>(null);

  const totalSteps = questions.length + 1;
  const progress = submitted ? 100 : Math.round((step / totalSteps) * 100);
  const contactStep = step === questions.length;
  const currentQuestion = contactStep ? null : questions[step];
  const rechnung =
    contactStep && rechnungsStrecke ? rechnungFuer(rechnungsStrecke, answers) : null;
  const einordnung =
    contactStep && einordnungsStrecke && !rechnung
      ? einordnungFuer(einordnungsStrecke, answers)
      : null;

  useEffect(() => {
    utmRef.current = sammleAttribution();
    letterRefRef.current = leseBriefRef();
    funnelRef.current = funnelLabel ?? streckeAusPfad();
  }, [funnelLabel]);

  // Jedes Quiz-Ereignis geht an alle Senken: dataLayer (GTM/Meta, falls
  // konfiguriert), Plausible (immer, cookieless) und — nur mit `?r=`-Kennung
  // aus Brief oder persönlicher Mail — ans Sales-Backend, damit im CRM steht,
  // welche Antworten die Firma gegeben hat, auch wenn sie nicht absendet.
  // Ohne Plausible wären die Schritte unsichtbar, sobald kein GTM läuft — und
  // genau dann fehlt die Antwort auf "an welcher Frage steigen die Leute aus".
  function melde(event: string, props: Record<string, string | number> = {}) {
    const funnel = funnelRef.current;
    pushEvent(event, { funnel, ...props });
    trackPlausible(event, { funnel, ...props });
    const backend = BACKEND_EVENTS[event];
    if (backend) {
      // Ans Backend mit dem Pfad-Namen, zu Plausible oben mit der `funnel`-Prop: Das CRM
      // soll Öffnung und Abgabe unter derselben Strecke führen, Plausible behält seine
      // fachliche Beschriftung.
      meldeEreignis(streckeAusPfad(), backend, props, {
        plausible: false,
        schluessel: String(props.step ?? ''),
      });
    }
  }

  function trackStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    melde('funnel_quiz_start');
  }

  // Was im Kontaktformular passiert, ohne Inhalte: angefangen, Pflichtfeld gefüllt oder leer
  // verlassen, Absenden versucht, vom Browser blockiert. Ohne das ist "Kontaktschritt
  // erreicht, nicht abgeschickt" eine Blackbox: Wer vor dem Telefonfeld aufhört, wer
  // ausfüllt und am Knopf zögert und wen die Browser-Prüfung stoppt, sieht gleich aus.
  // Server- und Netzfehler meldet `funnel_fehler` in `handleSubmit`. Jedes Ereignis
  // einmal je Feld und Aktion.
  const formularRef = useRef<Set<string>>(new Set());
  function meldeFormular(event: string, props: Record<string, string> = {}) {
    const key = [event, ...Object.values(props)].join(':');
    if (formularRef.current.has(key)) return;
    formularRef.current.add(key);
    melde(event, props);
  }
  function feldVerlassen(ev: FocusEvent<HTMLFormElement>) {
    const feld = ev.target as unknown as HTMLInputElement;
    if (!PFLICHTFELDER.has(feld.name)) return;
    meldeFormular('formular_feld', {
      feld: feld.name,
      aktion: feld.value.trim() ? 'ausgefuellt' : 'leer_verlassen',
    });
  }
  function feldUngueltig(ev: FormEvent<HTMLFormElement>) {
    const feld = ev.target as unknown as HTMLInputElement;
    if (feld.name) meldeFormular('formular_ungueltig', { feld: feld.name });
  }

  // Erreichte Schritte als eigene Ereignisse: Plausible zeigt pro Ereignis
  // eindeutige Besucher, damit liest sich der Abbruch direkt als Differenz
  // zwischen "Schritt 2 erreicht" und "Schritt 3 erreicht". Der Kontaktschritt
  // ist der kritische — wer ihn sieht und nicht absendet, ist der Verlust, den
  // Formular-Änderungen beeinflussen können.
  const erreichtRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (erreichtRef.current.has(step)) return;
    erreichtRef.current.add(step);
    if (step === 0) return; // Schritt 1 ist der Seitenaufruf, den zählt Plausible selbst
    melde(contactStep ? 'funnel_kontakt_erreicht' : 'funnel_schritt_erreicht', {
      step: step + 1,
      ...(currentQuestion ? { question: currentQuestion.id } : {}),
      // Welche Einschätzung jemand gesehen hat: In Plausible lässt sich damit je Kombination
      // ablesen, wie viele danach abschicken (`funnel_lead`).
      ...(einordnung ? { einordnung: `${einordnung.antwortA}|${einordnung.antwortB}` } : {}),
      ...(rechnung ? { stunden: rechnung.stunden } : {}),
    });
  }, [step]);

  // Nur scrollen, wenn der Kartenkopf aus dem Bild gerutscht ist (etwa mobil nach einer langen
  // Frage). Sonst springt die Seite bei jeder Auswahl ein Stück, obwohl die Karte schon sichtbar ist.
  function scrollToCard() {
    const card = cardRef.current;
    if (!card) return;
    if (card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function goToStep(next: number) {
    setStep(next);
    setTextMode(false);
    setFreeText('');
    // Mobil rückt die Karte ab der ersten Antwort ganz nach oben: So sind alle Antworten und
    // am Ende Formular und Knopf ohne Scrollen im Bild.
    if (kontaktPerson && window.innerWidth < 1024) {
      window.setTimeout(
        () => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        50
      );
      return;
    }
    scrollToCard();
  }

  function selectOption(optionId: string) {
    if (!currentQuestion) return;
    trackStart();
    const option = currentQuestion.options.find((o) => o.id === optionId);
    if (!option) return;

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      optionId: option.id,
      answer: option.label,
    };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));

    if (option.allowText) {
      setTextMode(true);
      return;
    }

    melde('funnel_step_complete', {
      step: step + 1,
      question: currentQuestion.id,
      answer: option.id,
    });
    // Kurze Pause, damit die Auswahl sichtbar wird (Perspective-Feeling)
    window.setTimeout(() => goToStep(step + 1), 220);
  }

  function confirmFreeText() {
    if (!currentQuestion) return;
    const existing = answers[currentQuestion.id];
    if (!existing) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...existing, detail: freeText.trim() },
    }));
    melde('funnel_step_complete', {
      step: step + 1,
      question: currentQuestion.id,
      answer: existing.optionId,
      detail: freeText.trim() ? 'ja' : 'nein',
    });
    goToStep(step + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    // Der Streckenname kommt aus dem Pfad, damit Abgabe und Öffnung im Board
    // dieselbe Strecke tragen. Die `funnel`-Prop bleibt für Plausible und die
    // fachliche Beschriftung zuständig.
    formData.set('funnel', streckeAusPfad());
    formData.set('page', window.location.href);

    const eventId = erzeugeEventId();
    formData.set('eventId', eventId);

    const attribution = ergaenzeMetaCookies(utmRef.current);

    formData.set(
      'answers',
      JSON.stringify(questions.map((q) => answers[q.id]).filter(Boolean))
    );
    formData.set('utm', JSON.stringify(attribution));
    // Ohne das Feld kommt der Lead im CRM firmenlos an, obwohl der Brief ihn benennt.
    if (letterRefRef.current) formData.set('letterRef', letterRefRef.current);

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        melde('funnel_lead', {
          problem: answers[questions[0]?.id]?.optionId ?? '',
          impact: answers[questions[1]?.id]?.optionId ?? '',
        });
        if (leadEvent) {
          pushEvent(leadEvent, { funnel: funnelRef.current });
          trackPlausible('Lead', { funnel: funnelRef.current });
        }
        // Browser-Pixel-Lead mit derselben eventId wie das CAPI-Event (Dedup)
        trackMetaLead(eventId);
        scrollToCard();
      } else {
        const errors = data.errors
          ? (Object.values(data.errors).flat().join(' ') as string)
          : 'Etwas ist schiefgelaufen. Bitte versucht es erneut.';
        setFormError(errors);
        melde('funnel_fehler', { art: 'validierung' });
      }
    } catch {
      setFormError('Senden fehlgeschlagen. Bitte prüft eure Verbindung und versucht es erneut.');
      melde('funnel_fehler', { art: 'netz' });
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOptionId = currentQuestion ? answers[currentQuestion.id]?.optionId : undefined;

  return (
    <div ref={cardRef} className="scroll-mt-3 sm:scroll-mt-24">
      <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-lg">
        {/* Fortschritt */}
        <div className="bg-background-secondary h-1.5 w-full">
          <div
            className="bg-brand-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>

        <div className={compact ? 'p-5 sm:p-6' : 'p-5 sm:p-8'}>
          {submitted ? (
            <div className="flex flex-col items-center py-6 text-center sm:py-10">
              <div className="bg-brand-500 text-on-invert flex h-14 w-14 items-center justify-center rounded-full">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="font-display text-foreground mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                {success.heading}
              </h2>
              <p className="text-foreground-secondary mt-4 max-w-md text-base leading-7">
                {success.text}
              </p>
              {success.calUrl && (
                <>
                  <p className="text-foreground mt-8 text-sm font-medium">
                    Ihr wollt nicht warten?
                  </p>
                  <a
                    href={success.calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: 'lg' }), 'mt-3')}
                  >
                    <CalendarClock aria-hidden="true" />
                    {success.calLabel || 'Termin buchen'}
                  </a>
                </>
              )}
            </div>
          ) : contactStep ? (
            <div>
              <StepHeader
                step={step}
                totalSteps={totalSteps}
                onBack={() => goToStep(step - 1)}
              />
              {rechnung && (
                <div className="bg-brand-500/5 mt-1 rounded-2xl px-4 py-3">
                  <p className="font-display text-foreground text-xl leading-6 font-bold tracking-tight">
                    Rund {rechnung.stunden.toLocaleString('de-DE')} Stunden im Monat
                  </p>
                  <p className="text-foreground-secondary mt-1 text-sm leading-5">
                    {rechnung.wofuer} Das sind etwa {rechnung.euroJahr.toLocaleString('de-DE')} €
                    Arbeitszeit im Jahr.
                  </p>
                  <p className="text-foreground-muted mt-1 text-xs leading-4">
                    {rechnung.weg}, 30 € je Stunde.
                  </p>
                </div>
              )}
              {einordnung && (
                <div className="bg-brand-500/5 mt-3 rounded-2xl px-4 py-3">
                  <p className="text-brand-600 dark:text-brand-300 font-mono text-[0.6875rem] font-semibold tracking-[0.18em] uppercase">
                    Erste Schnell-Einschätzung
                  </p>
                  <p className="font-display text-foreground mt-1.5 text-base leading-6 font-bold text-balance">
                    {einordnung.titel}
                  </p>
                  {!kontaktPerson && (
                    <p className="text-foreground-secondary mt-1 text-sm leading-6">
                      Genaueres klärt ihr mit Marten im Gespräch.
                    </p>
                  )}
                </div>
              )}
              {kontaktPerson && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={kontaktPerson.bild}
                    alt={kontaktPerson.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-full object-cover object-[center_22%]"
                  />
                  <p className="text-sm leading-5">
                    <span className="text-foreground font-semibold sm:block">
                      {rechnung
                        ? 'Marten zeigt euch im Gespräch, wie viel davon ihr sparen könnt.'
                        : 'Genaueres klärt ihr mit Marten im Gespräch.'}
                    </span>{' '}
                    <span className="text-foreground-secondary">{kontaktPerson.rolle}.</span>
                  </p>
                </div>
              )}
              <h2
                className={cn(
                  'font-display text-foreground font-bold tracking-tight',
                  kontaktPerson ? 'mt-3 text-lg' : 'text-xl sm:text-2xl',
                  !kontaktPerson && (einordnung || rechnung ? 'mt-5' : compact ? 'mt-3' : 'mt-4')
                )}
              >
                {contact.heading}
              </h2>
              {contact.text && (
                <p className="text-foreground-secondary mt-2 text-sm leading-6 sm:text-base">
                  {contact.text}
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                onFocus={() => meldeFormular('formular_angefangen')}
                onBlur={feldVerlassen}
                onInvalidCapture={feldUngueltig}
                className={kontaktPerson ? 'mt-2 space-y-3' : compact ? 'mt-5 space-y-4' : 'mt-6 space-y-4'}
                noValidate={false}
              >
                {compact ? (
                  <>
                    {/*
                      size="lg" ist hier Pflicht, nicht Geschmack: md rendert 14 px
                      Schrift, und unter 16 px zoomt iOS Safari beim Fokus die ganze
                      Seite. Betrifft das wichtigste Formular der Funnel-Seiten.
                    */}
                    {/* Mit Kontaktperson auch mobil zu zweit: Name, Telefon und Knopf sollen auf
                        einen Bildschirm passen, sonst sieht man nur Rechnung und Foto. */}
                    <div
                      className={cn(
                        'grid gap-x-3 gap-y-2',
                        kontaktPerson ? 'grid-cols-2' : 'sm:grid-cols-2'
                      )}
                    >
                      <Input label="Name" name="name" type="text" size="lg" required autoComplete="name" requiredMark={markRequired} />
                      <Input
                        label="Telefon"
                        name="phone"
                        type="tel"
                        size="lg"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        requiredMark={markRequired}
                      />
                      <Input
                        label="E-Mail"
                        name="email"
                        type="email"
                        size="lg"
                        required
                        requiredMark={markRequired}
                        className={kontaktPerson ? 'col-span-2' : 'sm:col-span-2'}
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                    {(phoneHint || markRequired) && (
                      <p className="text-foreground-muted text-xs leading-5">
                        {markRequired && (
                          <>
                            <span className="text-brand-500">*</span> Pflichtfeld.{' '}
                          </>
                        )}
                        {phoneHint}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Input label="Name" name="name" type="text" required autoComplete="name" size="lg" />
                    <Input
                      label="Telefon"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      size="lg"
                      hint={phoneHint}
                    />
                    <Input label="E-Mail" name="email" type="email" required autoComplete="email" inputMode="email" size="lg" />
                  </>
                )}

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
                  onClick={() => melde('formular_absenden_versucht')}
                  className={cn(buttonVariants({ size: 'lg', fullWidth: true }))}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Wird gesendet …
                    </>
                  ) : (
                    <>
                      {submitLabel}
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </button>

                <p className="text-foreground-muted flex items-start gap-2 text-xs leading-5">
                  <ShieldCheck className="text-brand-500 mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Eure Daten nutzen wir ausschließlich zur Bearbeitung eurer Anfrage. Details in
                    der{' '}
                    <a href={privacyUrl} className="hover:text-foreground underline underline-offset-2">
                      Datenschutzerklärung
                    </a>
                    .
                  </span>
                </p>
              </form>
            </div>
          ) : currentQuestion ? (
            <div>
              <StepHeader
                step={step}
                totalSteps={totalSteps}
                onBack={step > 0 ? () => goToStep(step - 1) : undefined}
              />
              <h2
                className={cn(
                  'font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl',
                  compact ? 'mt-3' : 'mt-4'
                )}
              >
                {currentQuestion.question}
              </h2>
              {currentQuestion.hint && (
                <p className="text-foreground-muted mt-2 text-sm leading-6">
                  {currentQuestion.hint}
                </p>
              )}

              <div className={cn('flex flex-col', compact ? 'mt-4 gap-2' : 'mt-6 gap-3')}>
                {currentQuestion.options.map((option) => {
                  const selected = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectOption(option.id)}
                      aria-pressed={selected}
                      className={cn(
                        'group w-full rounded-2xl border-2 text-left transition-all duration-150',
                        compact ? 'px-4 py-3' : 'p-4 sm:p-5',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                        'active:scale-[0.99]',
                        selected
                          ? 'border-brand-500 bg-brand-500/5'
                          : 'border-border bg-background hover:border-brand-300 hover:bg-brand-500/[0.03]'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                            selected
                              ? 'border-brand-500 bg-brand-500 text-on-invert'
                              : 'border-border-strong group-hover:border-brand-400'
                          )}
                          aria-hidden="true"
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="text-foreground block text-base font-semibold">
                            {option.label}
                          </span>
                          {option.description && (
                            <span
                              className={cn(
                                'text-foreground-muted mt-0.5 block text-sm leading-5',
                                // Mobil fehlt der Platz: Mit Beschreibung ist eine Antwort rund 100 px
                                // hoch, ohne 52. Die Labels tragen allein, Ausnahmen setzen das Flag.
                                !option.descriptionOnMobile && 'hidden sm:block'
                              )}
                            >
                              {option.description}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {textMode && (
                <div className="mt-4">
                  <textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder={
                      currentQuestion.options.find((o) => o.id === selectedOptionId)
                        ?.textPlaceholder || 'Kurz beschreiben …'
                    }
                    className="border-border bg-background text-foreground placeholder:text-foreground-muted focus-visible:ring-ring w-full rounded-xl border-2 p-4 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                  <button
                    type="button"
                    onClick={confirmFreeText}
                    className={cn(buttonVariants({ size: 'lg', fullWidth: true }), 'mt-3')}
                  >
                    Weiter
                    <ArrowRight aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  step,
  totalSteps,
  onBack,
}: {
  step: number;
  totalSteps: number;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-foreground-muted hover:text-foreground -ml-2 flex min-h-11 items-center gap-1 rounded-md px-2 py-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück
        </button>
      ) : (
        <span />
      )}
      <span className="text-foreground-muted font-mono text-xs tracking-[0.18em] uppercase">
        Schritt {step + 1} / {totalSteps}
      </span>
    </div>
  );
}

export default FunnelQuiz;
