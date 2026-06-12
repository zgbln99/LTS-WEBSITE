import type { ServiceLocaleContent } from "./types";

export const en: ServiceLocaleContent = {
  national: {
    name: "National Transport",
    slug: "national-transport",
    excerpt:
      "Germany-wide transport with our own fleet. From single parcels to full truckloads, reliable and on schedule.",
    description: [
      "LTS Logistik runs scheduled and direct routes across all of Germany every day. With more than 260 vehicles of our own, from vans to semi-trailers, we cover every shipment size and respond quickly to short-notice requests.",
      "Our locations in Berlin, Magdeburg, Stavenhagen, Hof and other regions keep approach routes short and give you a dedicated contact person close by."
    ],
    benefits: [
      {
        title: "Our own fleet and drivers",
        text: "We dispatch more than 260 of our own vehicles and do not depend on third-party capacity."
      },
      {
        title: "Regional hubs",
        text: "Ten locations across Germany shorten lead times and approach routes."
      },
      {
        title: "Dedicated contacts",
        text: "Your dispatcher knows your shipments and is reachable without a hotline queue."
      }
    ],
    steps: [
      {
        title: "Send your inquiry",
        text: "Share route, cargo and preferred date via our inquiry form or by phone."
      },
      {
        title: "Quote within 2 hours",
        text: "Our dispatch team checks capacity and sends a binding quote within two working hours."
      },
      {
        title: "Pickup and delivery",
        text: "Our driver collects the goods in the agreed time slot and you receive the proof of delivery digitally."
      }
    ],
    faqs: [
      {
        question: "How quickly can you take on a transport?",
        answer:
          "In most regions we can collect on the same or the next working day. For urgent needs our dispatch team checks available vehicles immediately."
      },
      {
        question: "Which shipment sizes do you handle?",
        answer:
          "Everything from single parcels and partial loads to full truckloads. Our fleet includes vans, 12-tonne trucks and semi-trailers."
      }
    ],
    seoTitle: "National Transport across Germany",
    seoDescription:
      "Germany-wide transport with a fleet of over 260 vehicles. Binding time slots, dedicated contacts, quotes within 2 hours. LTS Logistik Berlin."
  },

  international: {
    name: "International Transport",
    slug: "international-transport",
    excerpt:
      "Europe-wide routes with experienced drivers, multilingual dispatch and smooth customs handling.",
    description: [
      "Whether Benelux, Poland, Scandinavia or Southern Europe: LTS Logistik reliably connects Germany with Europe's key economic regions. Our multilingual dispatch team coordinates cross-border transport including all required documents.",
      "For time-critical international shipments we combine direct runs with a network of vetted partners, keeping your supply chain predictable across borders."
    ],
    benefits: [
      {
        title: "Europe-wide network",
        text: "Regular routes to Europe's most important economic regions."
      },
      {
        title: "Multilingual dispatch",
        text: "Our team communicates in German, English, Polish, Turkish and Ukrainian."
      },
      {
        title: "Documents and customs",
        text: "CMR, export documents and customs formalities handled routinely."
      }
    ],
    steps: [
      {
        title: "Define route and cargo",
        text: "Tell us pickup, destination, goods and date. We verify route and requirements."
      },
      {
        title: "Binding offer",
        text: "You receive a fixed price including all tolls and ancillary costs."
      },
      {
        title: "Transport and delivery",
        text: "Dispatch monitors the journey and you receive the signed CMR digitally."
      }
    ],
    faqs: [
      {
        question: "Which countries do you serve regularly?",
        answer:
          "Our focus is on Poland, Czechia, the Benelux countries, Austria, France and Scandinavia. Other destinations on request."
      },
      {
        question: "Do you handle customs clearance?",
        answer:
          "Yes, for non-EU destinations we organise complete customs handling through experienced partners."
      }
    ],
    seoTitle: "International Transport across Europe",
    seoDescription:
      "Europe-wide transport from Germany: direct runs, multilingual dispatch, customs handling. LTS Logistik has been on Europe's roads since 2015."
  },

  express: {
    name: "Express Transport",
    slug: "express-transport",
    excerpt:
      "Direct runs without detours. Pickup within 60 minutes in the Berlin area, same-day delivery.",
    description: [
      "When time is critical, every minute counts. LTS Logistik grew up in the courier and express business and delivers urgent shipments by direct run, without transshipment and without consolidated routing.",
      "In the greater Berlin area we collect your shipment within 60 minutes. Across Germany we run same-day and overnight express with fixed delivery times."
    ],
    benefits: [
      {
        title: "Pickup within 60 minutes",
        text: "In the Berlin/Brandenburg area a vehicle reaches you within one hour."
      },
      {
        title: "Direct run, no transshipment",
        text: "Your shipment stays on the same vehicle from start to destination."
      },
      {
        title: "Available 24/7",
        text: "Express needs do not follow office hours. Neither does our emergency dispatch."
      }
    ],
    steps: [
      {
        title: "Call or inquire",
        text: "Report your express shipment by phone or via the form."
      },
      {
        title: "Immediate dispatch",
        text: "We confirm vehicle and pickup time within minutes."
      },
      {
        title: "Direct delivery",
        text: "The driver heads straight to the recipient and you receive the proof of delivery immediately."
      }
    ],
    faqs: [
      {
        question: "What does an express transport cost?",
        answer:
          "The price depends on distance, vehicle size and time window. You always receive a binding fixed price before booking."
      },
      {
        question: "Do you drive at night and on weekends?",
        answer: "Yes. We run express transports around the clock, including Sundays and public holidays."
      }
    ],
    seoTitle: "Express Transport and Direct Runs",
    seoDescription:
      "Express transport with pickup within 60 minutes in the Berlin area. Same-day and overnight across Germany, direct runs without transshipment. LTS Logistik."
  },

  refrigerated: {
    name: "Refrigerated Transport",
    slug: "refrigerated-transport",
    excerpt:
      "Temperature-controlled logistics for fresh goods across Europe. Our core competence for many years.",
    description: [
      "Europe-wide transport of chilled fresh goods is one of LTS Logistik's core competences. Our refrigerated vehicles maintain documented temperatures from plus 25 to minus 25 degrees Celsius and meet the requirements of food logistics.",
      "From a single pallet to a full reefer trailer load: we move fresh produce, frozen goods and temperature-sensitive cargo with an unbroken cold chain and digital temperature recording."
    ],
    benefits: [
      {
        title: "Unbroken cold chain",
        text: "Continuous temperature control with digital recording and documentation."
      },
      {
        title: "Specialised fleet",
        text: "Refrigerated vans, trucks and trailers with multi-chamber systems."
      },
      {
        title: "Food-grade standards",
        text: "Trained drivers and vehicles meeting HACCP requirements."
      }
    ],
    steps: [
      {
        title: "Define requirements",
        text: "Tell us the goods, temperature range, volume and date."
      },
      {
        title: "Assign vehicle",
        text: "We dispatch the right refrigerated vehicle, with multi-chamber technology if needed."
      },
      {
        title: "Monitored transport",
        text: "The cold chain is monitored throughout and delivered with a temperature report."
      }
    ],
    faqs: [
      {
        question: "Which temperature ranges do you cover?",
        answer:
          "Our vehicles run temperature-controlled from plus 25 to minus 25 degrees Celsius, including multi-chamber operation."
      },
      {
        question: "Do I receive a temperature report?",
        answer:
          "Yes, on request you receive the digital temperature log for every journey."
      }
    ],
    seoTitle: "Refrigerated Transport across Europe",
    seoDescription:
      "Temperature-controlled transport from plus 25 to minus 25 degrees with an unbroken cold chain. Fresh and frozen logistics across Europe. LTS Logistik Berlin."
  },

  forwarding: {
    name: "Freight Forwarding",
    slug: "freight-forwarding",
    excerpt:
      "Complete transport organisation from one source: planning, capacity, documents and execution.",
    description: [
      "As a freight forwarder we organise your entire transport logistics: we plan routes, provide cargo space, handle documents and manage complex supply chains with multiple stops.",
      "You focus on your business while we move your goods, backed by our own fleet and a vetted partner network for peak demand."
    ],
    benefits: [
      {
        title: "Everything from one source",
        text: "Planning, transport, documentation and communication through one contact."
      },
      {
        title: "Our own fleet as backbone",
        text: "We do not just broker, we drive ourselves. That secures quality and availability."
      },
      {
        title: "Scalable capacity",
        text: "Vetted partners extend our capacity during peak periods."
      }
    ],
    steps: [
      {
        title: "Analyse demand",
        text: "We understand your goods flows, volumes and deadlines."
      },
      {
        title: "Concept and offer",
        text: "You receive a logistics concept with clear prices and transit times."
      },
      {
        title: "Ongoing management",
        text: "Our dispatch team manages your routes and reports deviations proactively."
      }
    ],
    faqs: [
      {
        question: "From which volume is a forwarder worthwhile?",
        answer:
          "Even a few shipments per week benefit from bundled planning and better rates. We are happy to calculate it for you."
      },
      {
        question: "Do you work with subcontractors?",
        answer:
          "Our own fleet is the backbone. For peak loads we use long-standing vetted partners who meet our quality standards."
      }
    ],
    seoTitle: "Freight Forwarding Berlin Brandenburg",
    seoDescription:
      "Freight forwarding with our own fleet: transport organisation, cargo space, documents and supply chain management from one source. LTS Logistik, Berlin."
  },

  dedicated: {
    name: "Dedicated Transport",
    slug: "dedicated-transport",
    excerpt:
      "Dedicated vehicles and drivers exclusively for your company, in your branding and on your schedule.",
    description: [
      "With dedicated transport you get fixed vehicles and experienced drivers working exclusively for your routes, on request in your company's branding and fully integrated into your processes.",
      "You gain predictable capacity without fleet ownership costs: we provide vehicle, driver, maintenance and insurance, you control the deployment."
    ],
    benefits: [
      {
        title: "Guaranteed capacity",
        text: "Your vehicles are reserved exclusively for you, independent of market conditions."
      },
      {
        title: "Your branding",
        text: "Vehicles in your corporate design, drivers acting as part of your team."
      },
      {
        title: "No fleet costs",
        text: "Purchase, maintenance, insurance and staffing are on us."
      }
    ],
    steps: [
      {
        title: "Demand analysis",
        text: "We assess routes, volumes and the requirements of your business."
      },
      {
        title: "Fleet concept",
        text: "You receive a concept with vehicle types, staffing and fixed prices."
      },
      {
        title: "Launch and adjustment",
        text: "Vehicles and drivers start within your processes and scale with your needs."
      }
    ],
    faqs: [
      {
        question: "How long are the contract terms?",
        answer:
          "Typical terms start at twelve months. Contracts are designed flexibly and grow with your demand."
      },
      {
        question: "What happens if a vehicle breaks down?",
        answer:
          "We provide a replacement from our fleet of more than 260 vehicles at short notice. Your routes keep running."
      }
    ],
    seoTitle: "Dedicated Transport and Fixed Routes",
    seoDescription:
      "Dedicated vehicles and drivers exclusively for your company: predictable capacity without fleet ownership costs, in your branding on request. LTS Logistik."
  },

  contract: {
    name: "Contract Logistics",
    slug: "contract-logistics",
    excerpt:
      "Long-term logistics partnerships: transport, handling and value-added services tailored to you.",
    description: [
      "In contract logistics we permanently take over defined parts of your supply chain: regular routes, handling, pre- and onward carriage and value-added services, contractually agreed and measurable.",
      "You get fixed capacity, agreed service levels and a partner who understands your processes and improves them continuously."
    ],
    benefits: [
      {
        title: "Contractually secured service",
        text: "Defined service levels, volumes and prices over the full term."
      },
      {
        title: "Process integration",
        text: "We work inside your systems and workflows, not next to them."
      },
      {
        title: "Measurable quality",
        text: "Regular reporting on punctuality, volumes and costs."
      }
    ],
    steps: [
      {
        title: "Supply chain analysis",
        text: "We map goods flows, interfaces and requirements."
      },
      {
        title: "Logistics concept",
        text: "You receive a concept with services, service levels and prices."
      },
      {
        title: "Implementation and operation",
        text: "Structured transition with a test phase, then ongoing operation with KPI reporting."
      }
    ],
    faqs: [
      {
        question: "Which industries do you serve?",
        answer:
          "Our focus is on food and fresh logistics, retail and industry. Contact us with your specific needs."
      },
      {
        question: "How fast can a project start?",
        answer:
          "Depending on complexity, between four weeks and three months from contract signing."
      }
    ],
    seoTitle: "Contract Logistics Partnerships",
    seoDescription:
      "Contract logistics with fixed capacity and agreed service levels: transport, handling and value-added services as a long-term partnership. LTS Logistik."
  },

  disposal: {
    name: "Waste Disposal and Container Service",
    slug: "waste-disposal",
    excerpt:
      "Professional disposal logistics in Berlin: waste collection vehicles, skip loaders and roll-off tippers.",
    description: [
      "LTS Logistik provides professional disposal services in and around Berlin with its own special fleet: waste collection vehicles, skip loaders and roll-off tippers for commerce, construction and industry.",
      "We provide containers in all common sizes, collect on schedule and ensure proper disposal through certified recycling partners."
    ],
    benefits: [
      {
        title: "Our own special vehicles",
        text: "Waste collection vehicles, skip loaders and roll-off tippers from our own fleet."
      },
      {
        title: "All container sizes",
        text: "From compact skips to large roll-off containers."
      },
      {
        title: "Certified disposal",
        text: "Disposal through certified partners with complete documentation."
      }
    ],
    steps: [
      {
        title: "Report your needs",
        text: "Tell us waste type, volume and site location."
      },
      {
        title: "Container delivery",
        text: "We deliver the right container at your preferred date."
      },
      {
        title: "Collection and proof",
        text: "One-off or recurring collection with full disposal documentation."
      }
    ],
    faqs: [
      {
        question: "Which area do you cover?",
        answer: "We offer disposal services throughout Berlin and the surrounding region."
      },
      {
        question: "How fast can a container be delivered?",
        answer:
          "Usually within 24 to 48 hours, often on the same day for urgent needs."
      }
    ],
    seoTitle: "Waste Disposal and Container Service Berlin",
    seoDescription:
      "Disposal logistics in Berlin: waste collection vehicles, skip loaders, roll-off tippers and containers in all sizes. On-schedule delivery and collection. LTS Logistik."
  }
};
