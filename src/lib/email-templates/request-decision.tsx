import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { clientDecisionMessage } from "../request-response";

interface Props { name?: string; service?: string; decision?: "approved" | "rejected"; message?: string }

function RequestDecision({ name = "mteja", service = "huduma", decision = "approved", message = "" }: Props) {
  return (
    <Html lang="sw"><Head /><Preview>Jibu la ombi lako la kazi — {decision === "approved" ? "Approved" : "Rejected"}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif", color: "#182139" }}>
        <Container style={{ padding: "32px 24px", maxWidth: "560px" }}>
          <Text>Midnight Graphics Enterprises</Text>
          <Heading>{decision === "approved" ? "Ombi limekubaliwa / Approved" : "Ombi limekataliwa / Rejected"}</Heading>
          <Text style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}>{clientDecisionMessage(name, service, decision, message)}</Text>
          <Text>Huu ni ujumbe wa moja kwa moja; usijibu email hii.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: RequestDecision,
  subject: (data) => `${data.decision === "approved" ? "Approved" : "Rejected"}: Ombi lako — Midnight Graphics`,
  displayName: "Service request decision",
  previewData: { name: "Amina", service: "Graphic Design", decision: "approved", message: "Tutawasiliana kuhusu hatua zinazofuata." },
} satisfies TemplateEntry;