import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
} from "@react-email/components";

interface AppointmentConfirmationProps {
  customerName: string;
  customerPhone: string;
  projectType: string;
  propertyType: string;
  appointmentDate: string;
  appointmentTime: string;
  description?: string;
}

function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function AppointmentConfirmation({
  customerName,
  customerPhone,
  projectType,
  propertyType,
  appointmentDate,
  appointmentTime,
  description,
}: AppointmentConfirmationProps) {
  const previewText = `Your ${capitalize(projectType)} walkthrough is confirmed for ${formatDate(appointmentDate)}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading as="h1" style={styles.businessName}>
              Premier Remodeling
            </Heading>
            <Text style={styles.tagline}>Quality Craftsmanship, Trusted Results</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Greeting */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {customerName},</Text>
            <Text style={styles.paragraph}>
              Thank you for scheduling your walkthrough! Here are your appointment details:
            </Text>
          </Section>

          {/* Appointment Details Box */}
          <Section style={styles.detailsBox}>
            <Heading as="h2" style={styles.detailsHeading}>
              Appointment Details
            </Heading>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Project Type:</Column>
              <Column style={styles.detailValue}>{capitalize(projectType)}</Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Property Type:</Column>
              <Column style={styles.detailValue}>{capitalize(propertyType)}</Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Date:</Column>
              <Column style={styles.detailValue}>{formatDate(appointmentDate)}</Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Time:</Column>
              <Column style={styles.detailValue}>{appointmentTime}</Column>
            </Row>
          </Section>

          {/* Project Notes */}
          {description && description.trim() !== "" && (
            <Section style={styles.content}>
              <Text style={styles.notesLabel}>Project Notes:</Text>
              <Text style={styles.notesValue}>{description}</Text>
            </Section>
          )}

          <Hr style={styles.divider} />

          {/* What Happens Next */}
          <Section style={styles.content}>
            <Heading as="h2" style={styles.sectionHeading}>
              What happens next?
            </Heading>

            <Row style={styles.stepRow}>
              <Column style={styles.stepNumber}>1</Column>
              <Column style={styles.stepText}>
                We&apos;ll call you at{" "}
                <span style={styles.bold}>{customerPhone}</span> to confirm and
                get your address
              </Column>
            </Row>

            <Row style={styles.stepRow}>
              <Column style={styles.stepNumber}>2</Column>
              <Column style={styles.stepText}>
                Our team will visit at the scheduled time for a free walkthrough
              </Column>
            </Row>

            <Row style={styles.stepRow}>
              <Column style={styles.stepNumber}>3</Column>
              <Column style={styles.stepText}>
                You&apos;ll receive a detailed estimate within 48 hours
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerBusiness}>Premier Remodeling</Text>
            <Text style={styles.footerText}>
              Questions? Reply to this email or call us at (555) 123-4567
            </Text>
            <Text style={styles.footerDisclaimer}>
              You received this email because you scheduled an appointment through our
              booking system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: "0",
    padding: "0",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    borderRadius: "8px",
    overflow: "hidden" as const,
    marginTop: "40px",
    marginBottom: "40px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  },
  header: {
    backgroundColor: "#1a1a1a",
    padding: "32px 40px 24px",
    textAlign: "center" as const,
  },
  businessName: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700" as const,
    margin: "0 0 4px",
    letterSpacing: "0.5px",
  },
  tagline: {
    color: "#a0a0a0",
    fontSize: "13px",
    margin: "0",
    letterSpacing: "0.3px",
  },
  content: {
    padding: "0 40px",
  },
  greeting: {
    fontSize: "16px",
    color: "#1a1a1a",
    marginTop: "28px",
    marginBottom: "4px",
    fontWeight: "600" as const,
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#4a4a4a",
    margin: "8px 0 20px",
  },
  detailsBox: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "6px",
    padding: "20px 24px",
    margin: "0 40px 24px",
  },
  detailsHeading: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#1a1a1a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    margin: "0 0 16px",
  },
  detailRow: {
    marginBottom: "10px",
  },
  detailLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500" as const,
    width: "120px",
    verticalAlign: "top" as const,
    paddingBottom: "4px",
  },
  detailValue: {
    fontSize: "14px",
    color: "#1a1a1a",
    fontWeight: "600" as const,
    verticalAlign: "top" as const,
    paddingBottom: "4px",
  },
  notesLabel: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  notesValue: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#4a4a4a",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "6px",
    padding: "12px 16px",
    marginTop: "4px",
    marginBottom: "24px",
  },
  divider: {
    borderColor: "#e9ecef",
    borderWidth: "1px",
    margin: "0 40px",
  },
  sectionHeading: {
    fontSize: "18px",
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginTop: "24px",
    marginBottom: "16px",
  },
  stepRow: {
    marginBottom: "14px",
  },
  stepNumber: {
    width: "28px",
    height: "28px",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    borderRadius: "50%",
    fontSize: "13px",
    fontWeight: "700" as const,
    textAlign: "center" as const,
    lineHeight: "28px",
    verticalAlign: "top" as const,
  },
  stepText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#4a4a4a",
    paddingLeft: "12px",
    verticalAlign: "top" as const,
    paddingTop: "3px",
  },
  bold: {
    fontWeight: "700" as const,
    color: "#1a1a1a",
  },
  footer: {
    padding: "24px 40px 32px",
    textAlign: "center" as const,
  },
  footerBusiness: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#1a1a1a",
    margin: "0 0 8px",
  },
  footerText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 8px",
    lineHeight: "20px",
  },
  footerDisclaimer: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "12px 0 0",
    lineHeight: "18px",
  },
} as const;

export default AppointmentConfirmation;
