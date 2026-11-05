import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { deliverToSales, type StoredLead } from '../lib/sales-delivery';

/**
 * Liefert Leads nach, die das CRM beim ersten Versuch nicht angenommen hat.
 *
 * Das ist die Hälfte, die Ausfälle überlebt: Der Blob-Store liegt außerhalb der
 * Fehlerdomäne des Backends, also kostet ein Redeploy von zwei Minuten oder ein Ausfall
 * von zwei Stunden nichts — er verzögert nur. Ein Puffer *im* Backend wäre genau dann weg,
 * wenn er gebraucht wird.
 *
 * Wiederholen ist gefahrlos: Die Blob-Id reist als `submissionId` mit, und das Backend
 * hält sie `UNIQUE`. Ein Lead, der in Wahrheit längst angekommen war (nur der Stempel
 * fehlte), wird dort kein zweiter.
 */

/**
 * Höchstens so viele Leads je Lauf. Ein langer Ausfall soll den Zehn-Minuten-Takt nicht in
 * einen Timeout laufen lassen — der Rest folgt beim nächsten Lauf.
 */
const MAX_PER_RUN = 50;

/**
 * Wie weit zurück gesucht wird. Blob-Keys beginnen mit dem Tag (`2026-10-09/…`), die Liste
 * ist also nach Datum sortiert; alles Ältere ist ein Fall für die Hand, nicht für einen
 * Automatismus, der ewig gegen dieselbe kaputte Zeile läuft.
 */
const MAX_AGE_DAYS = 14;

export default async () => {
	const store = getStore('funnel-leads');
	const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString().slice(0, 10);

	const { blobs } = await store.list();
	// Neueste zuerst: Ein frischer Lead ist der, bei dem ein Anruf noch etwas bringt.
	const candidates = blobs
		.map((blob) => blob.key)
		.filter((key) => key.slice(0, 10) >= cutoff)
		.sort()
		.reverse();

	let delivered = 0;
	let pending = 0;
	let failed = 0;

	for (const key of candidates) {
		if (delivered + failed >= MAX_PER_RUN) break;

		let lead: StoredLead | null;
		try {
			lead = await store.get(key, { type: 'json' });
		} catch (error) {
			console.error(`funnel-redeliver: cannot read ${key}:`, error);
			failed++;
			continue;
		}
		// Schon zugestellt oder unlesbar: nichts zu tun.
		if (!lead || lead.deliveredAt) continue;

		pending++;
		const result = await deliverToSales(lead, key);
		if (!result.ok) {
			console.error(`funnel-redeliver: ${key} still failing: ${result.reason}`);
			failed++;
			continue;
		}
		try {
			await store.setJSON(key, { ...lead, deliveredAt: new Date().toISOString() });
			delivered++;
		} catch (error) {
			// Zugestellt, aber nicht gestempelt — der nächste Lauf schickt ihn erneut, was
			// das Backend über `submissionId` verwirft. Kein Datenverlust, nur ein
			// überflüssiger Request.
			console.error(`funnel-redeliver: delivered ${key} but could not stamp it:`, error);
		}
	}

	// Eine Zeile je Lauf, auch wenn nichts zu tun war: Stille heißt sonst entweder "alles
	// gut" oder "die Funktion läuft nicht mehr", und die beiden wären nicht zu unterscheiden.
	console.log(
		`funnel-redeliver: ${pending} pending, ${delivered} delivered, ${failed} failed (of ${candidates.length} blobs)`,
	);
};

export const config: Config = {
	schedule: '*/10 * * * *',
};
