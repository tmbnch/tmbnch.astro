/**
 * Zustellung eines Funnel-Leads ans Sales-Backend (rcktbs-sales).
 *
 * Geteilt zwischen `funnel-lead` (Sofort-Zustellung) und `funnel-redeliver`
 * (Nachlieferung): Der Vertrag mit dem CRM steht genau einmal, sonst driften die beiden
 * auseinander, sobald ein Feld dazukommt.
 *
 * **Warum server-zu-server und nicht aus dem Browser:** Nur hier kann ein Fehlschlag bemerkt
 * und wiederholt werden. Der Browser-Pfad (`src/lib/funnelTracking.ts`) bleibt daneben
 * bestehen — er meldet Verhalten (Seitenaufruf, Quiz-Schritte) und darf alles verschlucken.
 */

export interface StoredLead {
	receivedAt: string;
	funnel: string;
	company: string;
	name: string;
	email?: string;
	phone?: string;
	answers: {
		questionId: string;
		question: string;
		optionId: string;
		answer: string;
		detail?: string;
	}[];
	/** Rohe Query-Parameter der Einstiegsseite, inkl. `_fbp`/`_fbc`. */
	attribution?: Record<string, string>;
	letterRef?: string;
	page?: string;
	geo?: { city?: string; country?: string; subdivision?: string };
	userAgent?: string;
	/**
	 * Welche Art Abgabe das war. Steht im Blob und nicht als Konstante in dieser Datei,
	 * weil `funnel-redeliver` den gespeicherten Stand erneut zustellt: Eine Konstante
	 * machte aus jeder nachgelieferten Kontaktanfrage ein `quiz_lead`, und im Board wäre
	 * der Unterschied genau dann weg, wenn das CRM kurz nicht erreichbar war.
	 *
	 * Fehlt das Feld, ist es ein Blob von vor dieser Änderung — und die gab es nur aus
	 * dem Quiz.
	 */
	event?: 'quiz_lead' | 'form_submit';
	/**
	 * Freitext des Absenders (Kontaktformular). Das Quiz hat ihn nicht: Dort ist jede
	 * Aussage eine Antwort mit Frage daneben.
	 */
	message?: string;
	/** Betreff des Kontaktformulars, sofern ausgefüllt. */
	subject?: string;
	/** Gesetzt, sobald das CRM den Lead bestätigt hat. `null`/fehlend = noch offen. */
	deliveredAt?: string | null;
	/**
	 * Vom Kontaktformular-Prüfer gesetzt: `true` wenn `suspicionOf` Flaggen
	 * lieferte — vor allem "kein JavaScript" = Bots ohne JS-Ausführung.
	 * Steht direkt im Blob-JSON, damit `funnel-redeliver` und das Board
	 * den Grund nachlesen können statt `deliveredAt: null` zu raten.
	 */
	hasSpamVerdacht?: boolean;
}

/**
 * Was im Board unter „Antworten" steht.
 *
 * <p>Beim Quiz sind das die Frage/Antwort-Paare. Beim Kontaktformular gibt es keine Fragen,
 * sondern einen getippten Text — der reist als ein Paar mit, statt ein eigenes Feld zu
 * bekommen: Das CRM zeigt diese Liste bereits an, und ein zweites Textfeld quer durch
 * Vertrag, Tabelle und Sheet zu ziehen, hätte denselben Satz an einer zweiten Stelle
 * angezeigt. Der Betreff steht davor, weil er die Überschrift der Nachricht ist.
 */
const answersFor = (lead: StoredLead) => {
	if (lead.event === 'form_submit') {
		const rows: { q: string; label: string; a: string; answerLabel: string }[] = [];
		if (lead.subject) {
			rows.push({ q: 'subject', label: 'Betreff', a: lead.subject, answerLabel: lead.subject });
		}
		if (lead.message) {
			rows.push({
				q: 'message',
				label: 'Nachricht',
				a: lead.message,
				answerLabel: lead.message,
			});
		}
		return rows;
	}
	return lead.answers.map((a) => ({
		q: a.questionId,
		label: a.question,
		a: a.optionId,
		// Der Freitext gehört zur Antwort, nicht daneben: Wer "Sonstiges" wählt und
		// ausschreibt, hat genau das geantwortet.
		answerLabel: a.detail ? `${a.answer} — ${a.detail}` : a.answer,
	}));
};

/**
 * Baut den Request-Body für `POST /api/public/funnel-events`.
 *
 * Die Kontaktangaben werden hier ins Standard-Shape überführt, nicht im Backend: Sonst
 * müsste das CRM jedes Formular dieser Seite kennen, und ein umbenanntes Feld ginge still
 * verloren.
 */
export const buildSalesPayload = (lead: StoredLead, submissionId: string) => {
	const utm = lead.attribution ?? {};
	return {
		// Ohne Angabe `quiz_lead`: Blobs von vor dem Kontaktformular-Pfad tragen das Feld
		// nicht, und die kamen alle aus dem Quiz.
		event: lead.event ?? 'quiz_lead',
		funnel: lead.funnel,
		submissionId,
		receivedAt: lead.receivedAt,
		// Die Brief-Kennung ist der `?r=`-Wert. Das Backend löst sie auf, wenn sie eine
		// TSID ist, und speichert sie sonst roh — verworfen wird sie nie.
		companyId: lead.letterRef,
		contact: {
			email: lead.email,
			name: lead.name,
			company: lead.company || undefined,
			phone: lead.phone,
		},
		attribution: {
			source: utm.utm_source,
			medium: utm.utm_medium,
			campaign: utm.utm_campaign,
			content: utm.utm_content,
			term: utm.utm_term,
			// fbclid bevorzugt, sonst Googles gclid.
			clickId: utm.fbclid || utm.gclid,
		},
		answers: answersFor(lead),
		payload: {
			path: lead.page,
			referrer: utm.referrer,
			geoCity: lead.geo?.city,
			// Der Verdacht reist mit, sonst steht er nur im Blob: Seit Abgaben mit Verdacht
			// trotzdem zugestellt werden, sieht eine Karte ohne dieses Feld genauso aus wie
			// eine echte Anfrage — und „kein JavaScript" ist die einzige Auskunft darüber,
			// ob ein Mensch das Formular ausgefüllt hat. Im `payload`, weil der frei getypt
			// ist und das Board ihn schon aufklappbar anzeigt; ein eigenes Vertragsfeld
			// hätte Tabelle, DTO und Sheet angefasst für eine Angabe, die man beim
			// Nachsehen braucht, nicht beim Überfliegen.
			...(lead.hasSpamVerdacht ? { spamVerdacht: true } : {}),
		},
	};
};

export type DeliveryResult =
	| { ok: true }
	/** Der Lead ist nicht angekommen — der Blob behält `deliveredAt: null`. */
	| { ok: false; reason: string };

/**
 * Stellt einen Lead zu. Wirft nie — der Aufrufer entscheidet anhand des Ergebnisses.
 *
 * Ein `201` heißt angenommen, `503` heißt "später nochmal". Jede andere Antwort wird
 * ebenfalls als Fehlschlag gewertet: Lieber ein überflüssiger Wiederholungsversuch (der
 * über `submissionId` idempotent ist) als ein stillschweigend verlorener Lead.
 */
export const deliverToSales = async (
	lead: StoredLead,
	submissionId: string,
	timeoutMs = 8000,
): Promise<DeliveryResult> => {
	// `PUBLIC_SALES_API_URL` ist dieselbe Adresse, die `funnelTracking.ts` im Browser
	// benutzt — eine zweite Variable für denselben Wert wäre Doppelpflege, und eine davon
	// würde beim nächsten Umzug vergessen. Das `PUBLIC_`-Präfix ist Astros Marker für
	// "darf ins Browser-Bundle" und stört hier nicht: Die Function läuft serverseitig und
	// liest jede Variable, der Wert ist ohnehin öffentlich. `SALES_API_URL` bleibt als
	// Override, falls die Zustellung einmal auf einen anderen Host zeigen soll.
	const base = Netlify.env.get('SALES_API_URL') || Netlify.env.get('PUBLIC_SALES_API_URL');
	if (!base) {
		return { ok: false, reason: 'neither SALES_API_URL nor PUBLIC_SALES_API_URL configured' };
	}

	const token = Netlify.env.get('SALES_API_TOKEN');
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(`${base.replace(/\/+$/, '')}/api/public/funnel-events`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token ? { 'X-Api-Token': token } : {}),
			},
			body: JSON.stringify(buildSalesPayload(lead, submissionId)),
			signal: controller.signal,
		});
		// Nur 201 heißt angekommen. **204 ist bewusst ein Fehlschlag**, obwohl der alte
		// Endpunkt genau das antwortete: Ein Backend, das die Abgabe versteht, bestätigt sie
		// mit 201 — ein 204 kommt von einem Stand vor dem Rückmeldungs-Board, der den Lead
		// als nacktes Ereignis behandelt und ihn ohne `?r=` sogar verwirft. Würden wir das
		// als Erfolg stempeln, wäre der Lead weg und der Nachlieferer käme nie wieder
		// darauf zurück. Lieber wiederholen, bis das Backend deployed ist — das ist über
		// `submissionId` ohnehin folgenlos.
		if (res.status === 201) {
			return { ok: true };
		}
		if (res.status === 204) {
			return { ok: false, reason: 'HTTP 204 — backend predates the submission contract' };
		}
		return { ok: false, reason: `HTTP ${res.status}` };
	} catch (error) {
		return { ok: false, reason: error instanceof Error ? error.message : String(error) };
	} finally {
		clearTimeout(timeout);
	}
};
