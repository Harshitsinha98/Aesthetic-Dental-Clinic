/**
 * Treatments offered, in the clinic's own order. Copy is general patient
 * education — it describes what each procedure is, not a promise about any
 * individual outcome. Kinds group the treatments for the homepage index.
 */

export type Treatment = {
  slug: string;
  no: string;
  name: string;
  kind: "Preventive" | "Orthodontics" | "Smile design" | "Restorative" | "Surgical";
  short: string;
  intro: string;
  forWhom: string[];
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  image: string;
};

export const treatments: Treatment[] = [
  {
    slug: "check-up",
    no: "01",
    name: "Check-up",
    kind: "Preventive",
    short: "A thorough look at teeth, gums and bite — the visit that keeps problems small.",
    intro:
      "Most dental problems are cheaper, quicker and more comfortable to treat when they are caught early. A check-up examines your teeth, gums and bite, with the intraoral camera so you can see what the dentist sees, and ends with clear advice on what — if anything — needs doing.",
    forWhom: [
      "Routine six-monthly visits for the whole family",
      "Sensitivity, bad breath or bleeding gums",
      "Before starting braces, aligners or whitening",
      "A second opinion on a treatment plan",
    ],
    steps: [
      { title: "Examination", body: "Teeth, gums and bite checked, with the intraoral camera on screen." },
      { title: "Findings", body: "What’s healthy and what needs attention — shown, not just described." },
      { title: "Plan", body: "Clear options and priorities, including doing nothing where that’s reasonable." },
    ],
    faqs: [
      { q: "How often should I come for a check-up?", a: "Many people are advised to visit every six months, but the right interval depends on your teeth and gums." },
      { q: "Does a check-up hurt?", a: "No. It’s a painless look and, if needed, a scale-and-polish. Anything more is planned with you first." },
    ],
    image: "/images/clinic/examination.jpg",
  },
  {
    slug: "clear-aligners",
    no: "02",
    name: "Invisalign / Clear Aligners",
    kind: "Orthodontics",
    short: "Near-invisible, removable trays that straighten teeth without metal braces.",
    intro:
      "Clear aligners are a series of thin, custom-made plastic trays. Each set is worn for a short period and nudges the teeth slightly further towards the planned position. Because they come out for eating and brushing, and are hard to notice when worn, they suit adults and teenagers who would rather not wear fixed braces. Dr. Nikita is an orthodontist with hands-on aligner training.",
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
    image: "/images/clinic/treatment-chair.jpg",
  },
  {
    slug: "braces",
    no: "03",
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
    image: "/images/clinic/operatory.jpg",
  },
  {
    slug: "root-canal",
    no: "04",
    name: "Root Canal Treatment",
    kind: "Restorative",
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
    slug: "crowns-veneers",
    no: "05",
    name: "Crowns, Zirconia & Veneers",
    kind: "Restorative",
    short: "Strong, tooth-coloured caps and thin front-facing shells that restore or transform teeth.",
    intro:
      "A crown covers a damaged tooth to restore its shape, strength and appearance; zirconia crowns are metal-free, tooth-coloured and very strong, for both front and back teeth. Veneers are thin shells bonded to the front of the teeth to improve their colour, shape and alignment — a cosmetic choice for the smile line. Align Aesthetic offers Illusion zirconia crowns.",
    forWhom: [
      "Teeth after root canal treatment",
      "Broken, worn or heavily filled teeth",
      "Chipped, stained or slightly uneven front teeth (veneers)",
      "Replacing old metal or discoloured crowns",
    ],
    steps: [
      { title: "Preparation", body: "The tooth is shaped conservatively and a record is taken." },
      { title: "Temporary", body: "A temporary protects the tooth while the final one is made." },
      { title: "Fitting", body: "The final crown or veneer is checked for fit, bite and shade, then bonded." },
    ],
    faqs: [
      { q: "Will a zirconia crown look natural?", a: "Zirconia is tooth-coloured and metal-free, so there is no dark line at the gum. The shade is matched to your neighbouring teeth." },
      { q: "Crown or veneer — which do I need?", a: "A crown covers the whole tooth to restore strength; a veneer is a thin cosmetic shell on the front. The examination decides which suits your tooth." },
    ],
    image: "/images/clinic/reception-tooth.jpg",
  },
  {
    slug: "smile-design",
    no: "06",
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
    slug: "kids-dentistry",
    no: "07",
    name: "Kids’ Dentistry (Pedo)",
    kind: "Preventive",
    short: "Gentle, friendly care that makes children comfortable at the dentist — and keeps their teeth healthy.",
    intro:
      "Paediatric dentistry looks after children’s teeth from the first tooth through to the teenage years. It is as much about the experience as the treatment: a calm, unhurried visit so a child grows up unafraid of the dentist. Care covers check-ups, cleaning, fluoride and sealants to prevent decay, simple fillings for milk teeth, and guidance on habits like thumb-sucking, plus an early orthodontic eye on how the teeth and jaws are developing.",
    forWhom: [
      "A child’s first dental visit",
      "Cavities or toothache in milk teeth",
      "Preventive fluoride and sealants",
      "Thumb-sucking and early bite concerns",
    ],
    steps: [
      { title: "Getting comfortable", body: "A friendly hello and a gentle look — no pressure on the first visit." },
      { title: "Check & prevent", body: "Examination, cleaning and preventive fluoride or sealants as needed." },
      { title: "Treat if needed", body: "Simple, gentle treatment for milk teeth, explained to child and parent." },
      { title: "Growth watch", body: "An orthodontist’s eye on how the teeth and jaws are developing." },
    ],
    faqs: [
      { q: "When should my child first see a dentist?", a: "Around the first birthday, or when the first teeth appear. Early visits are short and friendly, and help spot problems before they hurt." },
      { q: "Do milk teeth really need treatment if they’ll fall out?", a: "Yes — healthy milk teeth guide the adult teeth into place, help eating and speech, and prevent pain and infection." },
    ],
    image: "/images/clinic/camera-on-screen.jpg",
  },
  {
    slug: "dental-implants",
    no: "08",
    name: "Dental Implants",
    kind: "Surgical",
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
    slug: "laser-dentistry",
    no: "09",
    name: "Laser-assisted Dental Surgery",
    kind: "Surgical",
    short: "Precise light energy for gum and soft-tissue procedures — typically with less bleeding and quicker healing.",
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
    slug: "fillings",
    no: "10",
    name: "Fillings",
    kind: "Restorative",
    short: "Tooth-coloured fillings that repair a cavity and stop decay in its tracks.",
    intro:
      "A filling repairs a tooth damaged by decay. The decayed part is removed and the space is filled with a tooth-coloured material that is hardened in place, restoring the tooth’s shape and letting you chew normally again. Caught early, a cavity is a quick, comfortable fix — which is why regular check-ups matter.",
    forWhom: [
      "A cavity found at a check-up",
      "Sensitivity to sweet, hot or cold",
      "A small chip or worn edge",
      "Replacing an old, discoloured filling",
    ],
    steps: [
      { title: "Numbing", body: "The tooth is gently numbed if needed for comfort." },
      { title: "Cleaning", body: "The decay is removed and the tooth is cleaned." },
      { title: "Filling", body: "Tooth-coloured material is placed, shaped and hardened." },
      { title: "Polish", body: "The bite is checked and the filling polished smooth." },
    ],
    faqs: [
      { q: "Are the fillings tooth-coloured?", a: "Yes — tooth-coloured composite is used, so the filling blends in rather than showing as metal." },
      { q: "Will it hurt?", a: "The tooth is numbed if needed, so the procedure is comfortable. Mild sensitivity for a day or two afterwards can happen and settles." },
    ],
    image: "/images/clinic/treatment-chair.jpg",
  },
  {
    slug: "extraction",
    no: "11",
    name: "Extraction",
    kind: "Surgical",
    short: "Gentle removal of a tooth that genuinely cannot be saved, under local anaesthesia.",
    intro:
      "Sometimes a tooth is too damaged, loose or impacted to keep. An extraction removes it gently under local anaesthesia, with clear aftercare so it heals well. Wherever a tooth can be saved instead, that option is always discussed first — and where a tooth is removed, replacing it (with an implant or bridge) can be planned.",
    forWhom: [
      "Severe decay or infection beyond repair",
      "Painful or poorly-placed wisdom teeth",
      "Very loose teeth from gum disease",
      "Milk teeth or teeth removed for orthodontic reasons",
    ],
    steps: [
      { title: "Assessment", body: "An X-ray and examination to confirm removal is the right choice." },
      { title: "Numbing", body: "The area is fully numbed with local anaesthesia." },
      { title: "Removal", body: "The tooth is removed gently, taking care of the surrounding bone and gum." },
      { title: "Aftercare", body: "Clear instructions for comfortable healing, and options to replace the tooth." },
    ],
    faqs: [
      { q: "Will the extraction hurt?", a: "The area is fully numbed, so you feel pressure rather than pain. Any soreness afterwards is managed with simple painkillers." },
      { q: "Should I replace the removed tooth?", a: "Often, yes — a gap can let other teeth drift. Dr. Nikita can plan an implant or bridge where suitable." },
    ],
    image: "/images/technology/extraction-forceps.jpg",
  },
];

export function treatmentBySlug(slug: string) {
  return treatments.find((t) => t.slug === slug);
}
