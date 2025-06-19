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
} from "@react-email/components";
import * as React from "react";

type ContactUserConfirmationEmailProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  submissionId: string;
  submissionDate: string;
  adminEmail: string;
};

export const ContactUserConfirmationEmail = ({
  firstName,
  lastName,
  email,
  phone,
  subject,
  submissionId,
  submissionDate,
  adminEmail,
}: ContactUserConfirmationEmailProps) => {
  const previewText = `Mulțumim pentru mesajul tău, ${firstName}! Am primit cererea ta și te vom contacta în curând.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>
              ✅ Mulțumim pentru mesajul tău!
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={greeting}>Salut {firstName}! 👋</Heading>

            <Text style={paragraph}>
              Am primit mesajul tău cu subiectul{" "}
              <strong>&quot;{subject}&quot;</strong> și îți mulțumim pentru
              interesul acordat TBSA.
            </Text>

            {/* Summary Box */}
            <Section style={summaryBox}>
              <Heading style={summaryTitle}>
                📋 Rezumatul mesajului tău:
              </Heading>
              <ul style={summaryList}>
                <li style={summaryItem}>
                  <strong>Nume:</strong> {firstName} {lastName}
                </li>
                <li style={summaryItem}>
                  <strong>Email:</strong> {email}
                </li>
                {phone && (
                  <li style={summaryItem}>
                    <strong>Telefon:</strong> {phone}
                  </li>
                )}
                <li style={summaryItem}>
                  <strong>Subiect:</strong> {subject}
                </li>
                <li style={summaryItem}>
                  <strong>Data trimiterii:</strong> {submissionDate}
                </li>
              </ul>
            </Section>

            {/* Next Steps */}
            <Heading style={sectionTitle}>🕐 Ce urmează?</Heading>
            <Text style={paragraph}>
              Echipa noastră va analiza cererea ta și te va contacta în cel mai
              scurt timp posibil la adresa de email <strong>{email}</strong>
              {phone && (
                <>
                  &nbsp; sau la numărul de telefon <strong>{phone}</strong>
                </>
              )}
              .
            </Text>

            <Text style={paragraph}>
              <strong>Timpul de răspuns:</strong> De obicei, răspundem în
              maximum 24 de ore în zilele lucrătoare (Luni - Vineri, 09:00 -
              18:00).
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={ctaButton} href="https://tbsa.ro">
                🏠 Vizitează site-ul TBSA
              </Button>
            </Section>

            {/* While You Wait */}
            <Section style={tipsBox}>
              <Heading style={tipsTitle}>
                💡 În timp ce aștepți răspunsul nostru:
              </Heading>
              <ul style={tipsList}>
                <li style={tipsItem}>
                  Explorează&nbsp;
                  <Link href="https://tbsa.ro#features" style={link}>
                    funcționalitățile TBSA
                  </Link>
                </li>
                <li style={tipsItem}>
                  Citește despre&nbsp;
                  <Link href="https://tbsa.ro#subscription" style={link}>
                    planurile de abonament
                  </Link>
                </li>
                <li style={tipsItem}>
                  Urmărește-ne pe social media pentru noutăți
                </li>
              </ul>
            </Section>

            <Hr style={hr} />

            {/* Signature */}
            <Text style={signature}>
              <strong>Cu respect,</strong>
              <br />
              <strong>Echipa TBSA</strong> 🏢
              <br />
              <em>Soluția modernă pentru administrarea asociațiilor</em>
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Dacă nu ai trimis acest mesaj, te rugăm să ignori acest email.
            </Text>
            <Text style={footerText}>
              Pentru întrebări urgente:&nbsp;
              <Link href={`mailto:${adminEmail}`} style={link}>
                {adminEmail}
              </Link>
            </Text>
            <Text style={footerText}>ID Referință: {submissionId}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f0fdf4",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const header = {
  backgroundColor: "#10b981",
  borderRadius: "8px 8px 0 0",
  padding: "30px 20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "30px 40px",
};

const greeting = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "30px 0 16px 0",
};

const summaryBox = {
  backgroundColor: "#dcfce7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const summaryTitle = {
  color: "#166534",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const summaryList = {
  color: "#166534",
  fontSize: "14px",
  margin: "0",
  paddingLeft: "20px",
};

const summaryItem = {
  margin: "8px 0",
  lineHeight: "1.5",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const ctaButton = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const tipsBox = {
  backgroundColor: "#dbeafe",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 0",
};

const tipsTitle = {
  color: "#1e40af",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const tipsList = {
  color: "#1e40af",
  fontSize: "14px",
  margin: "0",
  paddingLeft: "20px",
};

const tipsItem = {
  margin: "12px 0",
  lineHeight: "1.5",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "30px 0",
};

const signature = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "24px 0",
  textAlign: "left" as const,
};

const footer = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  margin: "8px 0",
  lineHeight: "1.4",
};

export default ContactUserConfirmationEmail;
