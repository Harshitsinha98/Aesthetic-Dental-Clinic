/**
 * Treatments offered. The list comes from the clinic signboard
 * ("Orthodontics · Smile Design · Advanced Dentistry — Aligners, Braces,
 * Smile Design, Implants, Root Canal, Laser") and the illuminated tooth sign
 * ("Aligner | Implants | Cosmetic"), plus the in-clinic standee for Illusion
 * zirconia crowns that names Dr. Nikita Soni.
 *
 * The explanatory copy is general patient education — it describes what each
 * procedure is, not a promise about any individual outcome.
 */

export type Treatment = {
  slug: string;
  no: string;
  name: string;
  kind: "Orthodontics" | "Smile design" | "Advanced dentistry";
  short: string;
  intro: string;
  forWhom: string[];
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  image: string;
};

export const treatments: Treatment[] = [
  {
    slug: "clear-aligners",
    no: "01",
    name: "Clear Aligners",
    kind: "Orthodontics",
    short: "Near-invisible, removable trays that move teeth a fraction of a millimetre at a time.",
    intro:
      "Clear aligners are a series of thin, custom-made plastic trays. Each set is worn for a short period and nudges the teeth slightly further towards the planned position. Because they come out for eating and brushing, and are hard to notice when worn, they suit adults and teenagers who would rather not wear fixed braces.",
    forWhom: [
      "Crowded or spaced front teeth",
      "Mild to moderate bite problems",
      "Teeth that have shifted after old braces",
      "People who want a discreet option",
    ],
    steps: [
      { title: "Consultation", body: "Examination, photographs and a conversation about what you want to change." },
      { title: "Digital plan", body: "Your teeth are recorded and the movement is planned stage by stage before anything is made." },
      { title: "Wearing the trays", body: "Aligners are worn most of the day and changed on schedule, with periodic check-ins." },
      { title: "Retention", body: "Retainers hold the new position — the step that keeps the result." },
    ],
    faqs: [
      { q: "How many hours a day do I wear them?", a: "Aligners only work while they are in, so most plans ask for them to be worn for the large majority of the day and removed only to eat and clean. Dr. Nikita will give you the exact schedule for your plan." },
      { q: "Do aligners hurt?", a: "Most people feel pressure for a day or two when they switch to a new set. It usually settles quickly." },
      { q: "Can every case be treated with aligners?", a: "Not always. Some bite problems move more predictably with fixed braces. An orthodontic examination is the only honest way to tell." },
    ],
    image: "/images/clinic/camera-on-screen.jpg",
  },
  {
    slug: "braces",
    no: "02",
    name: "Braces",
    kind: "Orthodontics",
    short: "Fixed brackets and wires — the most versatile way to straighten teeth and correct a bite.",
    intro:
      "Braces are small brackets bonded to the teeth and linked by a wire that is adjusted over the course of treatment. They can handle a wide range of problems — crowding, gaps, deep or open bites, and teeth that need to rotate or move a long way — which is why they remain the backbone of orthodontics.",
    forWhom: [
      "Children and teenagers during growth",
      "Moderate to severe crowding or bite problems",
      "Cases where precise control of each tooth matters",
      "Adults — there is no upper age limit for healthy teeth",
    ],
    steps: [
      { title: "Records", body: "Examination, photographs and X-rays to understand teeth, jaws and bite." },
      { title: "Bonding", body: "Brackets are fixed to the teeth in a single, painless sitting." },
      { title: "Adjustments", body: "Regular visits to adjust the wire and track progress." },
      { title: "Retainers", body: "Once the braces come off, retainers keep the teeth where they now belong." },
    ],
    faqs: [
      { q: "What is the right age for braces?", a: "An orthodontic check around age 7–8 lets growth-related problems be spotted early. Many children start treatment between 10 and 14, but adults are treated routinely too." },
      { q: "How often are the visits?", a: "Adjustment visits are usually spaced a few weeks apart; your schedule depends on the plan." },
      { q: "Can I eat normally?", a: "Mostly, yes. Very hard and very sticky foods are best avoided because they can break a bracket." },
    ],
    image: "/images/clinic/treatment-chair.jpg",
  },
  {
    slug: "smile-design",
    no: "03",
    name: "Smile Design",
    kind: "Smile design",
    short: "Planning a smile around your face — tooth shape, proportion, colour and gum line together.",
    intro:
      "Smile design is a plan, not a single procedure. It looks at how your teeth relate to your lips, face and gums, and then combines the treatments needed — alignment, whitening, reshaping, veneers or crowns — to reach a smile that looks like it belongs to you. Dr. Nikita’s postgraduate research was on exactly these smile proportions.",
    forWhom: [
      "Chipped, worn or uneven teeth",
      "Discoloured teeth or old, dark fillings",
      "Gaps or teeth of mismatched size",
      "Anyone preparing for a wedding or big occasion",
    ],
    steps: [
      { title: "Smile analysis", body: "Photographs and measurements of your face, lips and teeth." },
      { title: "The plan", body: "A sequence of treatments, explained in plain language, with options." },
      { title: "Treatment", body: "Carried out in the least invasive order that achieves the plan." },
      { title: "Review", body: "A final check of fit, bite and appearance." },
    ],
    faqs: [
      { q: "Is smile design only cosmetic?", a: "It often improves function too — a better bite and easier cleaning — but the goal is a healthy smile that also looks balanced." },
      { q: "Will my teeth look fake?", a: "The aim is the opposite. Proportions and shade are chosen to suit your face, not a template." },
    ],
    image: "/images/doctor/portrait-desk.jpg",
  },
  {
    slug: "dental-implants",
    no: "04",
    name: "Dental Implants",
    kind: "Advanced dentistry",
    short: "A fixed, natural-looking replacement for a missing tooth, anchored in the jaw.",
    intro:
      "A dental implant is a small titanium post placed in the jawbone where a tooth is missing. Once the bone has bonded to it, a crown is fixed on top. Implants do not rely on neighbouring teeth for support, and they look and chew like a natural tooth.",
    forWhom: [
      "One or more missing teeth",
      "People tired of a loose removable denture",
      "Avoiding cutting down healthy teeth for a bridge",
    ],
    steps: [
      { title: "Assessment", body: "Examination and imaging to check the bone and plan the position." },
      { title: "Placement", body: "The implant is placed under local anaesthesia." },
      { title: "Healing", body: "The bone bonds to the implant over the following weeks." },
      { title: "Crown", body: "A custom crown is fixed on top to complete the tooth." },
    ],
    faqs: [
      { q: "Is the procedure painful?", a: "It is done under local anaesthesia. Most people describe mild soreness afterwards that is managed with routine painkillers." },
      { q: "How long do implants last?", a: "With good oral hygiene and regular check-ups, implants are a long-term solution. Smoking and uncontrolled diabetes raise the risk of problems." },
    ],
    image: "/images/clinic/operatory.jpg",
  },
  {
    slug: "root-canal",
    no: "05",
    name: "Root Canal Treatment",
    kind: "Advanced dentistry",
    short: "Saving an infected or badly decayed tooth instead of removing it.",
    intro:
      "When decay or injury reaches the soft tissue inside a tooth, it becomes painful and infected. Root canal treatment removes that tissue, cleans and shapes the canals, and seals them. The tooth is then usually protected with a crown. Modern motor-driven instruments and electronic length measurement make the process more precise and more comfortable than its reputation suggests.",
    forWhom: [
      "Lingering pain to hot or cold",
      "Pain on biting, or a swelling near a tooth",
      "Deep decay close to the nerve",
      "A cracked or darkened tooth",
    ],
    steps: [
      { title: "Diagnosis", body: "Examination and an X-ray to confirm the tooth can be saved." },
      { title: "Cleaning", body: "Under local anaesthesia, the infected tissue is removed and the canals are cleaned." },
      { title: "Sealing", body: "The canals are filled and sealed to stop re-infection." },
      { title: "Crown", body: "A crown is often advised to protect the treated tooth." },
    ],
    faqs: [
      { q: "Does a root canal hurt?", a: "The procedure is done under local anaesthesia and is designed to relieve pain, not cause it. Some tenderness for a few days afterwards is normal." },
      { q: "How many sittings does it take?", a: "It depends on the tooth and the infection — some are completed in one sitting, others need more." },
    ],
    image: "/images/technology/endo-motor-apex.jpg",
  },
  {
    slug: "laser-dentistry",
    no: "06",
    name: "Laser Dentistry",
    kind: "Advanced dentistry",
    short: "Precise light energy for gum procedures — typically with less bleeding and quicker healing.",
    intro:
      "A soft-tissue dental laser uses focused light to cut and seal gum tissue at the same time. It is used for procedures such as reshaping an uneven gum line, removing small growths, uncovering teeth and treating some gum conditions. Because it seals as it works, there is typically less bleeding and often no need for stitches.",
    forWhom: [
      "Gummy smiles and uneven gum lines",
      "Small soft-tissue procedures",
      "Exposing a tooth for orthodontic treatment",
    ],
    steps: [
      { title: "Assessment", body: "Deciding whether a laser is the right tool for the job." },
      { title: "Procedure", body: "Usually quick, with local anaesthetic gel or injection as needed." },
      { title: "Healing", body: "Simple aftercare instructions; most people return to normal routine quickly." },
    ],
    faqs: [
      { q: "Is laser treatment safe?", a: "Yes, when used by a trained dentist with protective eyewear for everyone in the room. Dr. Nikita has completed hands-on training in laser dentistry." },
    ],
    image: "/images/technology/diode-laser.jpg",
  },
  {
    slug: "crowns-bridges",
    no: "07",
    name: "Crowns & Zirconia",
    kind: "Smile design",
    short: "Strong, tooth-coloured caps that restore broken, worn or root-treated teeth.",
    intro:
      "A crown covers a damaged tooth to restore its shape, strength and appearance. Zirconia crowns are metal-free, tooth-coloured and very strong, which makes them a good choice for both front and back teeth. Align Aesthetic offers Illusion zirconia crowns.",
    forWhom: [
      "Teeth after root canal treatment",
      "Broken or heavily filled teeth",
      "Replacing old metal or discoloured crowns",
    ],
    steps: [
      { title: "Preparation", body: "The tooth is shaped and a record is taken." },
      { title: "Temporary", body: "A temporary crown protects the tooth while the final one is made." },
      { title: "Fitting", body: "The final crown is checked for fit, bite and shade, then cemented." },
    ],
    faqs: [
      { q: "Will a zirconia crown look natural?", a: "Zirconia is tooth-coloured and metal-free, so there is no dark line at the gum. The shade is matched to your neighbouring teeth." },
    ],
    image: "/images/clinic/reception-tooth.jpg",
  },
  {
    slug: "general-dentistry",
    no: "08",
    name: "Check-ups, Fillings & Extractions",
    kind: "Advanced dentistry",
    short: "The everyday dentistry that keeps problems small — examinations, fillings and gentle extractions.",
    intro:
      "Most dental problems are cheaper, quicker and more comfortable to treat when they are caught early. A check-up looks at teeth, gums and bite; small cavities are restored with fillings; and when a tooth genuinely cannot be saved, it is removed gently under local anaesthesia.",
    forWhom: [
      "Routine check-ups for the whole family",
      "Cavities and sensitivity",
      "Broken or painful teeth",
      "Wisdom teeth and teeth that cannot be saved",
    ],
    steps: [
      { title: "Examination", body: "A thorough look at teeth and gums, with the intraoral camera so you can see too." },
      { title: "Advice", body: "Clear options — including doing nothing, where that is reasonable." },
      { title: "Treatment", body: "Carried out with sterile instruments, one patient at a time." },
    ],
    faqs: [
      { q: "How often should I get a check-up?", a: "Many people are advised to visit every six months, but the right interval depends on your teeth and gums." },
    ],
    image: "/images/clinic/examination.jpg",
  },
];

export function treatmentBySlug(slug: string) {
  return treatments.find((t) => t.slug === slug);
}
