/**
 * Landingpages für den Brief-Kanal (/b/[slug]).
 *
 * Bewusst getrennt von `funnels.ts` (/f/), obwohl beide "Landingpage mit
 * Lead-Formular" sind:
 *
 * | | /f/ (Anzeigen) | /b/ (Brief) |
 * |---|---|---|
 * | Einstieg | Quiz, dann Kontakt | Video → Referenzen → Termin |
 * | Ansprache | Ihr/euch | Sie |
 * | Vorwissen | keins, kalter Klick | hat gerade einen Brief gelesen |
 *
 * Ein gemeinsamer Typ hätte `questions` als Pflichtfeld (die Brief-Seite hat
 * kein Quiz) und würde die Texte über ein `formal`-Flag durch jede Zeile
 * schleifen. Die Duplikation der Struktur ist hier billiger als die
 * Verzweigung.
 *
 * Eine Variante pro **Branchencluster**, nicht pro Firma: Die Brief-ID hängt
 * als `?r=` an der URL und wird nur getrackt, nie aufgelöst — auf der Seite
 * steht nichts Empfängerbezogenes.
 */

export interface BriefLandingDefinition {
  /** URL-Segment: /b/<slug> */
  slug: string;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    subline: string;
  };
  /**
   * Dieselben Belegzahlen wie auf Seite 2 des Briefes.
   *
   * Wer hier ankommt, hat den Brief gerade gelesen — die Kacheln stellen die
   * Wiedererkennung her und ersetzen den Fließtext, der die Argumentation des
   * Briefes sonst ein zweites Mal ausbreitet. Drei Stück, sonst wird aus dem
   * Beleg eine Statistikseite.
   */
  belege?: { zahl: string; aussage: string; quelle: string }[];
  /**
   * Kurzer Screencast aus echten Projekten. Solange `src` fehlt, zeigt die
   * Seite einen sichtbaren Platzhalter — die Sektion steht dann schon.
   */
  video: {
    heading: string;
    text?: string;
    src?: string;
    poster?: string;
    /**
     * Ungekürzte Fassung als Link unter dem Player. Die Kurzfassung läuft
     * eingebettet (90 Sekunden, stumm mit Musik) — wer nach dem Brief wirklich
     * wissen will, wie es funktioniert, bekommt die lange mit Originalton.
     */
    langSrc?: string;
    langLabel?: string;
    /**
     * Weiterführende Seite unter dem Player — für Leser, die nach dem Video
     * mehr sehen wollen, bevor sie buchen. Bewusst ein Link, kein zweiter
     * Primärweg: Der Termin bleibt das Ziel der Seite.
     */
    weiter?: { href: string; label: string };
  };
  referenzen: {
    heading: string;
    intro?: string;
    /**
     * Case-Slugs aus `cases`/`additionalCases` in `rocketbase.ts`. Nur die
     * Auswahl steht hier — die Texte bleiben an einer Stelle gepflegt.
     */
    slugs: string[];
  };
  /**
   * Terminbuchung — der Primärweg. Steht vor dem Kontaktformular, weil der
   * Brief-Leser vorqualifiziert ist: Beim Formular folgen noch zwei Schritte
   * mit je eigenem Abbruchrisiko, bei der Buchung steht der Slot.
   */
  termin: {
    heading: string;
    text?: string;
    calUrl: string;
    calLabel: string;
  };
  /** Sekundärer Weg für alle, die erst schreiben statt buchen wollen. */
  kontakt: {
    heading: string;
    text: string;
  };
  erfolg: {
    heading: string;
    text: string;
  };
}

/**
 * Eigener Event-Typ „Erstgespräch-Anschreiben", getrennt vom allgemeinen
 * `erstgesprach`: Die Limits (Vorlaufzeit, Buchungen pro Tag) gelten pro
 * Event-Typ. Ein gemeinsamer Typ würde die strengeren Brief-Regeln auch
 * Empfehlungen und Anzeigen-Traffic aufzwingen.
 *
 * Achtung beim Slug: `erstgesprach-anschreiben` — ohne „ae", so wie Cal.com
 * ihn beim Anlegen erzeugt hat. Ein Tippfehler hier führt zu einer 404 auf
 * einem gedruckten QR-Code, der sich nicht mehr korrigieren lässt.
 *
 * Einstellungen in Cal.com unter „Limits & Puffer":
 *   Vorlaufzeit          48 h   (Zeit, einen durchgerutschten Privattermin
 *                                zu bemerken; später auf 24 h verkürzbar)
 *   Puffer davor/danach  15 min (Vorbereitung bzw. Notizen)
 *   Buchungen pro Tag    2      (ein Erstgespräch aus Kaltakquise kostet mehr
 *                                als ein Kundentermin)
 *   Buchbar bis          30 Tage im Voraus
 *
 * Buchungsformular: Name, Geschäfts-E-Mail und Unternehmen als Pflicht —
 * letzteres, weil bei abgetippter URL (ohne `?r=`) die Firma die einzige
 * Zuordnung zum Brief ist. Telefon optional.
 */
const CAL_URL = 'https://cal.com/rocketbase-marten/erstgesprach-anschreiben';

export const briefLandings: BriefLandingDefinition[] = [
  {
    /**
     * Hebel B — wie das Angebot entsteht.
     *
     * Für Prüf- und Wartungsbetriebe, die nach Norm und Zyklus kalkulieren:
     * Der Prüfumfang steht fest, die Frage ist nur der Aufwand. Diese Leser
     * messen Aufwand, nicht Optik — deshalb zeigt die Seite den Weg von der
     * fälligen Prüfung bis zum versendeten Angebot, nicht die Darstellung
     * beim Kunden.
     *
     * Der frühere Slug hieß `fertigung` und stammte aus der abgeschlossenen
     * Handwerks-Zielgruppe. Er hat nie getragen: Die Zielgruppe sind Prüf-,
     * Wartungs- und Zertifizierungsbetriebe, und die Headline
     * ("Software, die Ihrem Ablauf folgt") hätte über jeder der drei Seiten
     * stehen können.
     */
    slug: 'ablauf',
    meta: {
      title: 'Vom Prüfzyklus zum Angebot — RocketBase',
      description:
        'Prüffrist, Anlagenzahl und Sätze liegen im System, das Angebot rechnet sich daraus — samt Deckungsbeitrag, bevor es rausgeht. Kurz gezeigt an einer laufenden Lösung.',
    },
    hero: {
      eyebrow: 'Sie haben Post von uns bekommen',
      headline: 'Der Prüfzyklus steht fest.',
      headlineAccent: 'Warum dauert das Angebot dann so lange?',
      subline:
        'Bei wiederkehrenden Prüfungen und Wartungen ist der Aufwand je Anlage bekannt, bevor jemand ein Angebot schreibt. Trotzdem passieren die Schritte dazwischen von Hand: Stunden aus der Vorjahresdatei, Sätze aus der Erinnerung, die Marge erst in der Nachkalkulation. Liegen Norm, Anlagendaten und Sätze im System, rechnet sich das Angebot daraus — und der Deckungsbeitrag steht daneben, bevor es rausgeht.',
    },
    video: {
      heading: 'So entsteht ein Wartungsangebot',
      text: 'Marten Prieß zeigt die Strecke an einer laufenden Lösung: fällige Prüfung, Kalkulation aus Norm und Anlagendaten, Deckungsbeitrag, Versand und Wiedervorlage — keine Folien, echte Oberflächen.',
    },
    referenzen: {
      heading: 'Aus vergleichbaren Betrieben',
      intro:
        'Die beiden Projekte aus dem Brief — und ein drittes, das zeigt, dass dieselben Prinzipien auch in Konzerngröße tragen.',
      slugs: ['schlosserei-diezinger', 'fkc-consulting', 'statista'],
    },
    termin: {
      heading: 'Suchen Sie sich einen Termin aus',
      text: '30 Minuten mit Marten Prieß — ohne Präsentation. Wir schauen uns an, wo bei Ihnen im Ablauf Zeit liegen bleibt, und Sie bekommen eine ehrliche Einschätzung, ob sich da etwas lohnt.',
      calUrl: CAL_URL,
      calLabel: '30-Minuten-Gespräch buchen',
    },
    kontakt: {
      heading: 'Lieber erst schreiben?',
      text: 'Hinterlassen Sie Ihre Kontaktdaten — Marten Prieß meldet sich werktags persönlich. Kein Newsletter, keine Weitergabe Ihrer Daten.',
    },
    erfolg: {
      heading: 'Danke, Ihre Nachricht ist angekommen.',
      text: 'Marten Prieß meldet sich werktags bei Ihnen.',
    },
  },
  {
    /**
     * Hebel A — was der Kunde sieht.
     *
     * Für Häuser, die ihren Angebotsumfang frei zuschneiden: Optionen sind
     * der Hebel, und das Angebot arbeitet die meiste Zeit ohne den Absender
     * (17 %, HBR 2022). Die Seite zeigt deshalb die Kundensicht — Optionen
     * wählen, Summe läuft mit, zusagen — und was davon beim Absender
     * sichtbar wird.
     *
     * Slug vorher `beratung`; umbenannt, weil die Trennung am Hebel hängt,
     * nicht an der Branche.
     */
    slug: 'angebot',
    meta: {
      title: 'Was Ihr Kunde sieht, wenn Ihr Angebot ankommt — RocketBase',
      description:
        'Statt eines PDF-Anhangs eine Seite: Der Kunde wählt Optionen, die Summe läuft mit, er sagt per Klick zu — und Sie sehen, wann er hineingeschaut hat. In knapp zwei Minuten an einer laufenden Lösung gezeigt.',
    },
    hero: {
      eyebrow: 'Sie haben Post von uns bekommen',
      headline: 'Was sieht Ihr Kunde, wenn er',
      headlineAccent: 'ein Angebot von Ihnen bekommt?',
      subline:
        'Sie haben den Brief gelesen. Hier sehen Sie, was Ihr Kunde beim Angebot vor sich hat — und zum Schluss, wie es bei Ihnen entsteht.',
    },
    belege: [
      {
        zahl: '17 %',
        aussage:
          'ihres Kaufprozesses verbringen Kunden im Gespräch mit Anbietern. In den anderen 83 Prozent arbeitet Ihr Angebot allein.',
        quelle: 'Harvard Business Review 2022',
      },
      {
        zahl: 'Doppelt',
        aussage:
          'so oft berichten Käufer von einem guten Abschluss, wenn sie sicher waren, was sie kaufen — verglichen mit denen, die unsicher blieben.',
        quelle: 'Gartner 2026, 646 Befragte',
      },
      {
        zahl: '13 Personen',
        aussage:
          'sind im Schnitt an einer B2B-Kaufentscheidung beteiligt. Die meisten davon lesen nur das Dokument.',
        quelle: 'Forrester 2024, über 16.000 Einkäufer',
      },
    ],
    video: {
      heading: 'So kommt Ihr Angebot beim Kunden an',
      text: 'Knapp zwei Minuten aus einem laufenden Projekt: wie der Kunde das Angebot öffnet, Optionen wählt und zusagt — und zum Schluss, wie es bei Ihnen entsteht und sich kalkuliert. Mit Untertiteln, auch ohne Ton.',
      src: '/screencasts/angebotsprozess-9x16.mp4',
      poster: '/screencasts/angebotsprozess-9x16.jpg',
      weiter: {
        href: '/f/angebote/',
        label: 'Alle Funktionen des Angebotsbausteins ansehen',
      },
    },
    referenzen: {
      heading: 'Aus vergleichbaren Häusern',
      intro:
        'Das Projekt aus dem Brief, dazu zwei weitere, in denen Planung und Zahlen aus Excel in einen belastbaren Prozess gewandert sind.',
      slugs: ['fkc-consulting', 'schlosserei-diezinger', 'statista'],
    },
    termin: {
      heading: 'Suchen Sie sich einen Termin aus',
      text: '30 Minuten mit Marten Prieß — ohne Präsentation. Wir schauen uns an, wie bei Ihnen ein Angebot entsteht und wo dabei Zeit liegen bleibt. Sie bekommen eine ehrliche Einschätzung, ob sich da etwas lohnt — und wenn nicht, sagen wir das genauso.',
      calUrl: CAL_URL,
      calLabel: '30-Minuten-Gespräch buchen',
    },
    kontakt: {
      heading: 'Lieber erst schreiben?',
      text: 'Hinterlassen Sie Ihre Kontaktdaten — Marten Prieß meldet sich werktags persönlich. Kein Newsletter, keine Weitergabe Ihrer Daten.',
    },
    erfolg: {
      heading: 'Danke, Ihre Nachricht ist angekommen.',
      text: 'Marten Prieß meldet sich werktags bei Ihnen.',
    },
  },
  {
    /**
     * Dritte Variante, für Betriebe, die alt genug für eine Übergabe wären.
     *
     * Bewusst ohne das Wort Nachfolge: Diese Geschäftsführer bekommen
     * regelmäßig Post von Aufkäufern. Wer damit anfängt, wird als einer von
     * ihnen gelesen und ist weg, bevor der zweite Satz drankommt. Es geht um
     * Steuerbarkeit — ob der Betrieb ohne den Inhaber lesbar ist. Wer daraus
     * eine Nachfolge ableiten will, tut das selbst; der Blog-Beitrag dazu
     * steht für die, die weiterlesen.
     */
    slug: 'steuerbarkeit',
    meta: {
      title: 'Die vier Zahlen, nach denen zuerst gefragt wird — RocketBase',
      description:
        'Vertragswert im Folgejahr, Marge je Vertrag, Abhängigkeit vom Inhaber, Forderungslaufzeit: vier Zahlen, die jeder Dienstleister über sich kennen will. Kurz gezeigt, wie sie aus dem System kommen statt aus dem Kopf.',
    },
    hero: {
      eyebrow: 'Sie haben Post von uns bekommen',
      headline: 'Die vier Zahlen, nach denen',
      headlineAccent: 'zuerst gefragt wird',
      subline:
        'Welche Verträge laufen nächstes Jahr aus und was ist das wert? Was verdienen Sie an jedem einzelnen? Wie viel davon hängt an Ihnen persönlich? Und wann kommt das Geld? Vier Fragen, die ein Betrieb mit Betreuungs- oder Wartungsverträgen über sich beantworten können sollte — ob für die Bank, den neuen Bereichsleiter oder den eigenen Urlaub.',
    },
    video: {
      heading: 'So sieht das bei uns aus',
      text: 'Marten Prieß zeigt das Cockpit einer laufenden Lösung: Vertragswert-Wegfall ins Folgejahr, Deckungsbeitrag je Vertrag, Auslastung je Team. Keine Folien, echte Oberflächen.',
    },
    referenzen: {
      heading: 'Aus vergleichbaren Häusern',
      intro:
        'Ein Beratungshaus, das seine Zahlen aus der Standardsoftware herausgeholt hat, dazu zwei Projekte, in denen Planung und Controlling aus Excel in einen belastbaren Prozess gewandert sind.',
      slugs: ['fkc-consulting', 'stage-cml', 'statista'],
    },
    termin: {
      heading: 'Suchen Sie sich einen Termin aus',
      text: '30 Minuten mit Marten Prieß — ohne Präsentation. Wir gehen die vier Fragen an Ihren Zahlen durch und sagen Ihnen, welche davon heute aus dem System kommen und welche aus dem Kopf. Ohne Bewertung, ohne Verkaufsabsicht.',
      calUrl: CAL_URL,
      calLabel: '30-Minuten-Gespräch buchen',
    },
    kontakt: {
      heading: 'Lieber erst schreiben?',
      text: 'Hinterlassen Sie Ihre Kontaktdaten — Marten Prieß meldet sich werktags persönlich. Kein Newsletter, keine Weitergabe Ihrer Daten.',
    },
    erfolg: {
      heading: 'Danke, Ihre Nachricht ist angekommen.',
      text: 'Marten Prieß meldet sich werktags bei Ihnen.',
    },
  },
];

export function getBriefLandingBySlug(slug: string): BriefLandingDefinition | undefined {
  return briefLandings.find((l) => l.slug === slug);
}
