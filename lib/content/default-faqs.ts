export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
};

export const defaultFaqs: PublicFaq[] = [
  {
    id: "faq-1",
    question: "What time are your services?",
    answer: "Our main worship gathering takes place on the seventh-day Sabbath (Saturday). Sabbath School Bible study begins at 9:00 AM, followed by the Divine Worship Service at 10:30 AM. Midweek prayer meeting and Bible studies meet on Wednesdays at 6:00 PM.",
    category: "Services & Worship",
    displayOrder: 1,
  },
  {
    id: "faq-2",
    question: "Where is the church located?",
    answer: "Our church fellowship is located centrally. Detailed directions, parking assistance, and interactive maps are available on our Contact and Plan Your Visit pages.",
    category: "Location & Visit",
    displayOrder: 2,
  },
  {
    id: "faq-3",
    question: "What should I expect during my first visit?",
    answer: "You can expect a warm, gracious welcome from our hospitality team, uplifting Christ-centered music, communal prayer, and practical verse-by-verse biblical preaching. There is no dress code pressure—come as you are.",
    category: "Location & Visit",
    displayOrder: 3,
  },
  {
    id: "faq-4",
    question: "Is there a children's ministry?",
    answer: "Yes! We offer age-tailored Sabbath School classes for beginners, primary, and juniors every Saturday morning at 9:00 AM. Dedicated, vetted teachers guide children through creative Bible lessons, crafts, and memory verses in a secure and caring environment.",
    category: "Ministries",
    displayOrder: 4,
  },
  {
    id: "faq-5",
    question: "Is there a youth ministry?",
    answer: "Absolutely. Our Youth & Young Adults ministry meets regularly for vibrant fellowship, relevant topical discussions, community outreach, and special retreats designed to deepen their walk with Jesus.",
    category: "Ministries",
    displayOrder: 5,
  },
  {
    id: "faq-6",
    question: "How can I join a ministry?",
    answer: "We believe every believer is blessed with spiritual gifts for service. You can explore our Ministries page, connect with ministry leaders after any worship service, or fill out the ministry inquiry on our Contact page.",
    category: "Ministries",
    displayOrder: 6,
  },
  {
    id: "faq-7",
    question: "How can I request prayer?",
    answer: "You can submit confidential prayer requests anytime through our dedicated online Prayer Request form. Our pastoral staff and intercessory prayer team lift each request to the Lord with discretion and care.",
    category: "Prayer & Care",
    displayOrder: 7,
  },
  {
    id: "faq-8",
    question: "Can I watch sermons online?",
    answer: "Yes, our latest sermons are recorded and made available on our Sermons page, complete with speaker information, scripture references, audio player, and video links.",
    category: "Media & Resources",
    displayOrder: 8,
  },
  {
    id: "faq-9",
    question: "How can I contact the church?",
    answer: "You can reach us through our online contact form, send an email, call our church office during operating hours, or message our official WhatsApp line. All contact details are listed on our Contact page.",
    category: "Contact & Support",
    displayOrder: 9,
  },
  {
    id: "faq-10",
    question: "How can I participate in church events?",
    answer: "Our upcoming conferences, retreats, youth rallies, and community outreach projects are published on our Events page. Most events are free and open to everyone; some special retreats may offer online registration.",
    category: "Events & Community",
    displayOrder: 10,
  },
  {
    id: "faq-11",
    question: "Do you have Bible study meetings?",
    answer: "Yes! We offer Saturday morning Sabbath School classes at 9:00 AM for all age groups, a midweek Wednesday prayer & Bible study meeting at 6:00 PM, and free personal Bible study guides upon request.",
    category: "Services & Worship",
    displayOrder: 11,
  },
  {
    id: "faq-12",
    question: "How can I get directions to the church?",
    answer: "You can visit our Contact page or Plan Your Visit page where an interactive Google Map and turn-by-turn driving, walking, or transit directions are available.",
    category: "Location & Visit",
    displayOrder: 12,
  },
];
