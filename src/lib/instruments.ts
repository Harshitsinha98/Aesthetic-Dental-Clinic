/**
 * The instrument tray — equipment photographed inside the clinic.
 *
 * Each entry records the source photo (photos/originals/INDEX.txt number) and
 * whether the identification is confirmed. Identification was made from the
 * photographs: a device whose label is legible or whose form is unambiguous is
 * `confirmed: true`. Anything else stays `confirmed: false` and is NOT rendered
 * until the clinic confirms what it is — naming the wrong machine on a medical
 * site is worse than leaving it out.
 *
 * Descriptions are general, researched explanations of what each class of
 * device does; brand-specific specifications are deliberately not claimed.
 */

export type Instrument = {
  id: string;
  name: string;
  category: "Diagnostics" | "Endodontics" | "Restorative" | "Soft tissue" | "Surgery" | "Infection control" | "Chairside";
  what: string;
  why: string;
  spec: [string, string][];
  image: string;
  sourcePhotos: number[];
  confirmed: boolean;
};

export const instruments: Instrument[] = [
  {
    id: "intraoral-camera",
    name: "Intraoral Camera",
    category: "Diagnostics",
    what:
      "A slim, pen-shaped camera with its own light that shows the inside of your mouth, magnified, on the chairside screen.",
    why:
      "You see exactly what the dentist sees — a crack, a cavity, a worn filling — so every recommendation comes with evidence, not just a description.",
    spec: [
      ["Used for", "Examination · patient explanation · records"],
      ["Feels like", "A smooth wand, no discomfort"],
      ["Seen in", "Every check-up"],
    ],
    image: "/images/technology/intraoral-camera.jpg",
    sourcePhotos: [20, 25, 39, 60, 99],
    confirmed: true,
  },
  {
    id: "handheld-xray",
    name: "Portable Dental X-ray",
    category: "Diagnostics",
    what:
      "A compact handheld X-ray unit that takes images of individual teeth right at the chair.",
    why:
      "No walking to another room or another lab. The dentist can check roots, bone and hidden decay during the same visit, with a lead apron worn for protection.",
    spec: [
      ["Used for", "Root canals · implants · hidden decay"],
      ["Protection", "Lead apron provided"],
      ["Where", "At the treatment chair"],
    ],
    image: "/images/technology/handheld-xray.jpg",
    sourcePhotos: [42, 98, 14],
    confirmed: true,
  },
  {
    id: "diode-laser",
    name: "Soft-tissue Dental Laser",
    category: "Soft tissue",
    what:
      "A touchscreen laser unit that delivers focused light through a fine fibre tip to cut and seal gum tissue at the same time.",
    why:
      "Sealing as it works means typically less bleeding, often no stitches and comfortable healing for procedures such as gum contouring.",
    spec: [
      ["Used for", "Gum contouring · minor soft-tissue surgery"],
      ["Benefit", "Less bleeding · faster healing"],
      ["Safety", "Protective eyewear for everyone"],
    ],
    image: "/images/technology/diode-laser.jpg",
    sourcePhotos: [35, 95],
    confirmed: true,
  },
  {
    id: "endo-motor",
    name: "Cordless Endodontic Motor",
    category: "Endodontics",
    what:
      "A cordless, motor-driven handpiece that turns root canal files at a controlled speed and torque.",
    why:
      "Controlled rotation cleans and shapes the canals more predictably than hand filing alone — typically meaning shorter, more comfortable root canal sittings.",
    spec: [
      ["Used for", "Root canal cleaning & shaping"],
      ["Control", "Set speed and torque limits"],
      ["Design", "Cordless, on a charging stand"],
    ],
    image: "/images/technology/endo-motor-apex.jpg",
    sourcePhotos: [56, 18],
    confirmed: true,
  },
  {
    id: "apex-locator",
    name: "Electronic Apex Locator",
    category: "Endodontics",
    what:
      "A small screen unit that measures, electronically, how far a root canal file has travelled to the tip of the root.",
    why:
      "It tells the dentist the working length of each canal accurately, reducing the number of X-rays needed during a root canal.",
    spec: [
      ["Used for", "Measuring root canal length"],
      ["Benefit", "Precision · fewer X-rays"],
      ["Works with", "The endodontic motor"],
    ],
    image: "/images/technology/endo-motor-apex.jpg",
    sourcePhotos: [56],
    confirmed: true,
  },
  {
    id: "curing-light",
    name: "LED Curing Light",
    category: "Restorative",
    what:
      "A cordless blue-light wand that hardens tooth-coloured filling and bonding materials in seconds.",
    why:
      "Tooth-coloured fillings, bonded brackets and composite smile work are set hard before you leave the chair.",
    spec: [
      ["Used for", "Fillings · bonding braces · composites"],
      ["Light", "High-intensity blue LED"],
      ["Design", "Cordless, on a charging base"],
    ],
    image: "/images/technology/curing-light.jpg",
    sourcePhotos: [87],
    confirmed: true,
  },
  {
    id: "amalgamator",
    name: "Capsule Amalgamator",
    category: "Restorative",
    what:
      "A sealed, lidded mixer that shakes pre-measured material capsules at high speed for a set time.",
    why:
      "Filling materials supplied in capsules are mixed to the manufacturer’s exact ratio every time — consistent, clean and inside a closed chamber.",
    spec: [
      ["Used for", "Mixing capsule restorative materials"],
      ["Control", "Timed digital mixing"],
      ["Design", "Closed chamber"],
    ],
    image: "/images/technology/amalgamator.jpg",
    sourcePhotos: [63],
    confirmed: true,
  },
  {
    id: "extraction-forceps",
    name: "Extraction Forceps Set",
    category: "Surgery",
    what:
      "Stainless-steel forceps, each shaped for a particular tooth and position in the jaw, laid out in sterilised trays.",
    why:
      "The right instrument for each tooth means a controlled, gentle extraction under local anaesthesia — and every set is sterilised before use.",
    spec: [
      ["Material", "Surgical stainless steel"],
      ["Handling", "Sterilised, tray-organised"],
      ["Used for", "Gentle extractions"],
    ],
    image: "/images/technology/extraction-forceps.jpg",
    sourcePhotos: [12, 92],
    confirmed: true,
  },
  {
    id: "dental-chair",
    name: "Treatment Chair with Chairside Display",
    category: "Chairside",
    what:
      "A fully adjustable treatment chair with an overhead LED light, integrated instrument delivery and a mounted screen for the camera.",
    why:
      "You lie comfortably supported, the dentist has a clear, shadow-free view, and you can watch your own teeth on screen as they are explained.",
    spec: [
      ["Light", "Overhead LED"],
      ["Display", "Chairside monitor"],
      ["Comfort", "Fully adjustable, cushioned"],
    ],
    image: "/images/clinic/operatory.jpg",
    sourcePhotos: [13, 45, 64, 23],
    confirmed: true,
  },
  {
    id: "instrument-cassettes",
    name: "Sealed Instrument Trays",
    category: "Infection control",
    what:
      "Clear, lidded trays that keep each set of cleaned instruments organised and covered until they are opened for a patient.",
    why:
      "Instruments stay covered between sterilisation and use, and each patient’s set is opened fresh.",
    spec: [
      ["Used for", "Storage between sterilisation and use"],
      ["Design", "Clear, lidded, labelled"],
      ["Principle", "One patient, one set"],
    ],
    image: "/images/technology/instrument-trays.jpg",
    sourcePhotos: [19, 42, 98],
    confirmed: true,
  },
  {
    id: "uv-cabinet",
    name: "UV Storage Cabinet (to confirm)",
    category: "Infection control",
    what: "A wall-mounted cabinet with a glass door beside the instrument counter.",
    why: "",
    spec: [],
    image: "/images/technology/instrument-trays.jpg",
    sourcePhotos: [42, 98],
    confirmed: false,
  },
  {
    id: "blue-pen-device",
    name: "Blue pen-shaped device (to confirm)",
    category: "Endodontics",
    what: "A small blue pen-shaped cordless device stored with the curing light.",
    why: "",
    spec: [],
    image: "/images/technology/curing-light.jpg",
    sourcePhotos: [87],
    confirmed: false,
  },
];

export const publishedInstruments = instruments.filter((i) => i.confirmed);
export const pendingInstruments = instruments.filter((i) => !i.confirmed);
