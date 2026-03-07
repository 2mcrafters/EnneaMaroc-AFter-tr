import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

export type ConfirmationDocxData = {
  courseTitle: string;
  daysText?: string;

  nom: string;
  prenom: string;
  adresse?: string;
  telephonePersonnel?: string;
  email: string;
  diplomeObtenu?: string;
  professionExercee?: string;

  isEntreprise?: boolean;
  entreprise?: string;
  bonDeCommande?: "oui" | "non";
  adresseFacturation?: string;
  contactDossier?: string;
  telephoneContact?: string;
  emailContact?: string;

  dateText?: string;
  lieuText?: string;

  // Optional: show prices
  tarifEntrepriseText?: string;
  tarifParticuliersText?: string;

  // Optional: logo (png/jpg/svg as data url)
  logoDataUrl?: string;

  // Optional: logo from public assets (e.g. "/assets/logo/Coaching HRH.png")
  logoSrc?: string;
};

const dottedLine = (label: string, value?: string, opts?: { hideIfEmpty?: boolean }) => {
  const v = (value ?? "").toString().trim();
  if (opts?.hideIfEmpty && !v) return null;
  return new Paragraph({
    children: [
      new TextRun({ text: `${label} : `, bold: true }),
      new TextRun({ text: v.length ? v : ".........................................................................................." }),
    ],
    spacing: { after: 120 },
  });
};

const keep = <T,>(v: T | null | undefined): v is T => v !== null && v !== undefined;

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function guessImageTypeFromDataUrl(dataUrl: string): "png" | "jpg" | "gif" | "bmp" | "svg" {
  const mime = (dataUrl.split(",")[0] || "").toLowerCase();
  if (mime.includes("image/svg")) return "svg";
  if (mime.includes("image/jpeg") || mime.includes("image/jpg")) return "jpg";
  if (mime.includes("image/gif")) return "gif";
  if (mime.includes("image/bmp")) return "bmp";
  return "png";
}

export async function exportConfirmationDocx(data: ConfirmationDocxData) {
  const selectedTitle = (data.courseTitle || "").trim();
  const title = selectedTitle ? `DOSSIER DE CANDIDATURE POUR ${selectedTitle}` : "DOSSIER DE CANDIDATURE POUR";
  const subtitle1 = "La formation Horizon RH";
  const subtitle2 = selectedTitle || "Niveau Fondamental en Ennéagramme (5 jours)";

  const defaultLieu = "Tanger";
  const computedLieuText = (data.lieuText || "").trim() || defaultLieu;
  const computedDateText = (data.dateText || "").trim() || new Date().toLocaleDateString("fr-FR");

  const headerLeftLogo: Paragraph[] = [];
  if (data.logoDataUrl && data.logoDataUrl.startsWith("data:")) {
    try {
      const imageType = guessImageTypeFromDataUrl(data.logoDataUrl);
      headerLeftLogo.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: dataUrlToUint8Array(data.logoDataUrl),
              type: imageType === 'svg' ? 'png' : imageType,
              transformation: { width: 130, height: 70 },
              // docx requires a fallback for SVG; we keep it simple by forcing non-SVG types.
            }),
          ],
          alignment: AlignmentType.LEFT,
        })
      );
    } catch {
      // ignore logo errors
    }
  } else if (data.logoSrc) {
    try {
      // Load logo from public assets (served by Vite) and embed it.
      const res = await fetch(data.logoSrc);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        headerLeftLogo.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(buf),
                type: "png",
                transformation: { width: 130, height: 70 },
              }),
            ],
            alignment: AlignmentType.LEFT,
          })
        );
      } else {
        headerLeftLogo.push(
          new Paragraph({
            children: [new TextRun({ text: "HORIZON RH", bold: true })],
          })
        );
      }
    } catch {
      headerLeftLogo.push(
        new Paragraph({
          children: [new TextRun({ text: "HORIZON RH", bold: true })],
        })
      );
    }
  } else {
    headerLeftLogo.push(
      new Paragraph({
        children: [new TextRun({ text: "HORIZON RH", bold: true })],
      })
    );
  }

  const headerTitleBox = new Table({
    width: { size: 98, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            children: [
              new Paragraph({
                text: title,
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                heading: HeadingLevel.HEADING_3,
              }),
              new Paragraph({
                text: subtitle1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: subtitle2,
                    bold: true,
                    color: "0070C0",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: headerLeftLogo,
          }),
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [headerTitleBox],
          }),
        ],
      }),
    ],
  });

  const entrepriseBox = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Entreprise :", bold: true })],
                spacing: { before: 200, after: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Bon de commande pour la facturation : ", bold: true }),
                  new TextRun({ text: data.bonDeCommande === "oui" ? "Oui" : "Non" }),
                ],
                spacing: { after: 120 },
              }),
              ...( [
                dottedLine("Adresse de facturation", data.adresseFacturation, { hideIfEmpty: true }),
                dottedLine("Contact pour le dossier", data.contactDossier, { hideIfEmpty: true }),
              ].filter(keep) ),
              new Paragraph({
                children: [
                  new TextRun({ text: "Tél : ", bold: true }),
                  new TextRun({ text: data.telephoneContact || "................................" }),
                  new TextRun({ text: "    E-mail : ", bold: true }),
                  new TextRun({ text: data.emailContact || "................................" }),
                ],
                spacing: { after: 120 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Bigger tariffs table
  const tarifsTable = new Table({
    width: { size: 78, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Pour Entreprise", bold: true, size: 24 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: data.tarifEntrepriseText || "4533 DH. HT", size: 24 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Pour Particuliers", bold: true, size: 24 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: data.tarifParticuliersText || "3400 DH", size: 24 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Simple, centered Tarifs section (heading + centered table)
  const tarifsSection = [
    new Paragraph({
      children: [new TextRun({ text: "Tarifs du cycle", bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 160 },
    }),
    // Use a 1x1 borderless wrapper table to reliably center the tarifs table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                // Center by putting the table in a centered paragraph-like container
                // (docx tables don't have direct alignment, wrapper cell handles centering)
                tarifsTable,
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "HORIZON Ressources Humaines : Recrutement, Formation et Accompagnement",
                    color: "9E9E9E",
                    bold: true,
                    size: 28,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 140, after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Av Moulay Youssef, Immb Hamza, Entresol, N°2 – Tanger -",
                    color: "9E9E9E",
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Tél : (00212) 0539944816 - Gsm : 0661246647 - Email: coaching@horizonrh.ma - Site web: www.horizonrh.ma",
                    color: "9E9E9E",
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          headerTable,
          new Paragraph({ text: "", spacing: { after: 220 } }),

          ...([
            dottedLine("Nom", data.nom),
            dottedLine("Prénom", data.prenom),
            dottedLine("Adresse", data.adresse),
          ].filter(keep)),
          new Paragraph({
            children: [
              new TextRun({ text: "Tél. personnel : ", bold: true }),
              new TextRun({ text: data.telephonePersonnel || "................................" }),
              new TextRun({ text: "    E-mail : ", bold: true }),
              new TextRun({ text: data.email || "................................" }),
            ],
            spacing: { after: 120 },
          }),
          ...([
            dottedLine("Diplôme obtenu", data.diplomeObtenu),
            dottedLine("Profession exercée", data.professionExercee),
            // Only show 'Entreprise' line if entreprise mode or if a value exists
            dottedLine("Entreprise", data.entreprise, { hideIfEmpty: !data.isEntreprise }),
          ].filter(keep)),

          // Space before entreprise section (if any)
          ...(data.isEntreprise ? [new Paragraph({ text: "", spacing: { before: 140 } })] : []),

          // Enterprise block
          ...(data.isEntreprise ? [entrepriseBox] : []),

          new Paragraph({
            children: [new TextRun({ text: "Conditions d’inscription :", bold: true })],
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "•  Toute inscription est prise en compte dès réception de la convention de formation signée et du bon de commande de l’entreprise (en cas de prise en charge) et/ou du règlement de l’avance." })],
            indent: { left: 720 },
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "•  Un entretien préalable avec le responsable pédagogique du cycle est nécessaire pour valider toute participation." })],
            indent: { left: 720 },
            spacing: { after: 220 },
          }),

          // Space before tarifs
          new Paragraph({ text: "", spacing: { before: 140 } }),
          // Tarifs section (simple)
          ...tarifsSection,

          // Space before signature area
          new Paragraph({ text: "", spacing: { before: 240, after: 80 } }),
          // Bottom layout: left A/Date, right Signature (using tabs)
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "A : ", bold: true }),
              new TextRun({ text: computedLieuText || "......................." }),
              new TextRun({ text: "\t" }),
              new TextRun({ text: "Signature", bold: true }),
            ],
            spacing: { after: 180 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Date : ", bold: true }),
              new TextRun({ text: computedDateText || "......................." }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `dossier-candidature-${(data.nom || "").trim() || "inscription"}.docx`);
}
