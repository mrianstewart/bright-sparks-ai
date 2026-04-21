import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { SpeechDraft, SpeechSection } from '@/lib/types';

export interface SpeechPdfProps {
  draft: SpeechDraft;
  coupleName1: string;
  coupleName2: string;
  speakerRole: string;
  editedSections: Record<string, string>;
  draftIndex: number;
}

const CREAM = '#FEFCF7';
const DARK = '#2C1810';
const MUTED = '#7A6659';
const RULE = '#D4C4B0';
const GOLD = '#C9A84C';

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    paddingTop: 64,
    paddingBottom: 72,
    paddingHorizontal: 72,
    fontFamily: 'Times-Roman',
  },

  // ── Header ──────────────────────────────────────
  header: {
    marginBottom: 36,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 22,
    color: DARK,
    marginBottom: 6,
  },
  headerCouple: {
    fontFamily: 'Times-Italic',
    fontSize: 13,
    color: MUTED,
    marginBottom: 3,
  },
  headerRole: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: MUTED,
    letterSpacing: 0.5,
  },

  // ── Section ─────────────────────────────────────
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionBody: {
    fontFamily: 'Times-Roman',
    fontSize: 13,
    color: DARK,
    lineHeight: 1.85,
  },
  paragraph: {
    marginBottom: 9,
  },
  divider: {
    marginVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },

  // ── Pause note ───────────────────────────────────
  pauseNote: {
    fontFamily: 'Times-Italic',
    fontSize: 10.5,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 4,
  },

  // ── Footer ───────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 72,
    right: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: RULE,
    paddingTop: 8,
  },
  footerBrand: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: MUTED,
  },
  footerPage: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: MUTED,
  },
});

function getSectionText(
  section: SpeechSection,
  editedSections: Record<string, string>,
  draftIndex: number
): string {
  const key = `${draftIndex}:${section.id}`;
  return editedSections[key] ?? section.content;
}

function isTransitionSection(section: SpeechSection): boolean {
  return section.id === 'transition' || section.id.includes('transition');
}

export function SpeechPdfDocument({
  draft,
  coupleName1,
  coupleName2,
  speakerRole,
  editedSections,
  draftIndex,
}: SpeechPdfProps) {
  const couple = [coupleName1, coupleName2].filter(Boolean).join(' & ');
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const ROLE_TITLES = [
    'best man', 'maid of honour', 'maid of honor', 'matron of honour',
    'matron of honor', 'father of the bride', 'mother of the bride',
    'father of the groom', 'mother of the groom', 'bride', 'groom',
    'bridesmaid', 'groomsman', 'usher',
  ];
  const titleLower = draft.title.toLowerCase();
  const displayTitle = ROLE_TITLES.some(r => titleLower.includes(r))
    ? draft.title
    : 'Wedding Speech';

  return (
    <Document
      title={draft.title}
      author="Bright Sparks AI"
      subject={`Wedding speech${couple ? ` for ${couple}` : ''}`}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>{displayTitle}</Text>
          {couple ? (
            <Text style={styles.headerCouple}>{couple} · {today}</Text>
          ) : (
            <Text style={styles.headerCouple}>{today}</Text>
          )}
          {speakerRole ? (
            <Text style={styles.headerRole}>{speakerRole.toUpperCase()}</Text>
          ) : null}
        </View>

        {/* Sections */}
        {draft.sections.map((section, idx) => {
          const text = getSectionText(section, editedSections, draftIndex);
          const paragraphs = text.split('\n\n').filter(p => p.trim());
          const showPause = isTransitionSection(section) && idx > 0;

          return (
            <View key={section.id}>
              {idx > 0 && <View style={styles.divider} />}

              {showPause && (
                <Text style={styles.pauseNote}>[Pause. Take a breath.]</Text>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{section.title}</Text>
                <View style={styles.sectionBody}>
                  {paragraphs.map((para, pi) => (
                    <Text key={pi} style={styles.paragraph}>{para}</Text>
                  ))}
                </View>
              </View>
            </View>
          );
        })}

        {/* Delivery time note */}
        <View style={{ marginTop: 12, borderTopWidth: 0.5, borderTopColor: RULE, paddingTop: 10 }}>
          <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: MUTED }}>
            {draft.word_count.toLocaleString()} words · estimated delivery time: ~{Math.round(draft.word_count / 170)} minutes at a comfortable pace
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>
            Created with Bright Sparks AI — brightsparks.ai/speech-writer
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
