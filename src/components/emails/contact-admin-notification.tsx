import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

type ContactAdminNotificationEmailProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submissionId: string;
  submissionDate: string;
};

export const ContactAdminNotificationEmail = ({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
  submissionId,
  submissionDate,
}: ContactAdminNotificationEmailProps) => {
  const previewText = `Mesaj nou de contact de la ${firstName} ${lastName}: ${subject}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>📧 Mesaj nou de contact</Heading>
            <Text style={headerSubtitle}>ID Submisie: {submissionId}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={sectionTitle}>Detalii contact:</Heading>

            {/* Contact Details Table */}
            <Section style={table}>
              <Row style={tableRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Nume complet:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>
                    {firstName} {lastName}
                  </Text>
                </Column>
              </Row>

              <Row style={tableRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Email:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Link href={`mailto:${email}`} style={emailLink}>
                    {email}
                  </Link>
                </Column>
              </Row>

              {phone && (
                <Row style={tableRow}>
                  <Column style={labelColumn}>
                    <Text style={label}>Telefon:</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Link href={`tel:${phone}`} style={phoneLink}>
                      {phone}
                    </Link>
                  </Column>
                </Row>
              )}

              <Row style={tableRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Subiect:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{subject}</Text>
                </Column>
              </Row>

              <Row style={tableRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Data:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{submissionDate}</Text>
                </Column>
              </Row>
            </Section>

            {/* Message */}
            <Heading style={sectionTitle}>Mesaj:</Heading>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>

            {/* Action Items */}
            <Section style={actionBox}>
              <Heading style={actionTitle}>🚀 Acțiuni recomandate:</Heading>
              <ul style={actionList}>
                <li style={actionItem}>Răspunde în maximum 24 ore</li>
                <li style={actionItem}>
                  Folosește &quot;Reply&quot; pentru a răspunde direct
                </li>
                <li style={actionItem}>
                  Adaugă contactul în CRM dacă este necesar
                </li>
              </ul>
            </Section>

            {/* Quick Actions */}
            <Section style={buttonSection}>
              <Button
                style={replyButton}
                href={`mailto:${email}?subject=Re: ${subject}`}
              >
                📧 Răspunde direct
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Acest email a fost generat automat de sistemul TBSA
            </Text>
            <Text style={footerText}>ID Submisie: {submissionId}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px 8px 0 0",
  padding: "20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const headerSubtitle = {
  color: "#dbeafe",
  fontSize: "14px",
  margin: "0",
};

const content = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "0 0 8px 8px",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const table = {
  width: "100%",
  margin: "20px 0",
};

const tableRow = {
  borderBottom: "1px solid #e2e8f0",
};

const labelColumn = {
  width: "30%",
  backgroundColor: "#e2e8f0",
  padding: "12px",
  verticalAlign: "top" as const,
};

const valueColumn = {
  width: "70%",
  padding: "12px",
  verticalAlign: "top" as const,
};

const label = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
};

const value = {
  color: "#1f2937",
  fontSize: "14px",
  margin: "0",
};

const emailLink = {
  color: "#3b82f6",
  textDecoration: "none",
  fontSize: "14px",
};

const phoneLink = {
  color: "#3b82f6",
  textDecoration: "none",
  fontSize: "14px",
};

const messageBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const messageText = {
  color: "#1f2937",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const actionBox = {
  backgroundColor: "#dbeafe",
  borderRadius: "8px",
  padding: "20px",
  margin: "30px 0",
};

const actionTitle = {
  color: "#1e40af",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const actionList = {
  color: "#1e40af",
  fontSize: "14px",
  margin: "0",
  paddingLeft: "20px",
};

const actionItem = {
  margin: "8px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const replyButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "30px 0",
};

const footer = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  margin: "8px 0",
};

export default ContactAdminNotificationEmail;
