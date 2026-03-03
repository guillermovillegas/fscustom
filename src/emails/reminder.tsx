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

interface ReminderEmailProps {
  customerName: string;
  projectType: string;
  appointmentDate: string;
  appointmentTime: string;
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

export function ReminderEmail({
  customerName,
  projectType,
  appointmentDate,
  appointmentTime,
}: ReminderEmailProps) {
  const previewText = `Reminder: Your ${capitalize(projectType)} walkthrough is on ${formatDate(appointmentDate)}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading as="h1" style={styles.businessName}>
              FS Custom Flooring
            </Heading>
            <Text style={styles.tagline}>Design + Build</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Greeting */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {customerName},</Text>
            <Text style={styles.paragraph}>
              This is a friendly reminder about your upcoming{" "}
              <span style={styles.bold}>{capitalize(projectType)}</span> walkthrough.
            </Text>
          </Section>

          {/* Appointment Details Box */}
          <Section style={styles.detailsBox}>
            <Heading as="h2" style={styles.detailsHeading}>
              Your Appointment
            </Heading>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Date:</Column>
              <Column style={styles.detailValue}>{formatDate(appointmentDate)}</Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Time:</Column>
              <Column style={styles.detailValue}>{appointmentTime}</Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Service:</Column>
              <Column style={styles.detailValue}>
                {capitalize(projectType)} Flooring Walkthrough
              </Column>
            </Row>
          </Section>

          {/* Reschedule Notice */}
          <Section style={styles.content}>
            <Text style={styles.rescheduleText}>
              If you need to reschedule, please call us at{" "}
              <span style={styles.bold}>(515) 414-4145</span>
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerBusiness}>FS Custom Flooring</Text>
            <Text style={styles.footerText}>
              Questions? Reply to this email or call us at (515) 414-4145
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
  bold: {
    fontWeight: "700" as const,
    color: "#1a1a1a",
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
  rescheduleText: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#4a4a4a",
    margin: "0 0 24px",
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "6px",
    padding: "12px 16px",
  },
  divider: {
    borderColor: "#e9ecef",
    borderWidth: "1px",
    margin: "0 40px",
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

export default ReminderEmail;
