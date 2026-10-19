import type { Ministry } from "@/lib/api/church-api";

export const DEFAULT_MINISTRIES: Ministry[] = [
  {
    id: "default-children",
    name: "Children's Ministry",
    slug: "children",
    description:
      "A joyful, nurturing, and secure environment where children discover the love of Jesus through engaging Bible lessons, interactive Sabbath School, memorable songs, crafts, and family-friendly children's events.\n\nSafety is our highest priority: every teacher and volunteer is background-screened and trained under our strict Child Protection Policy, featuring secure electronic check-in and monitored classrooms.",
    targetAudience: "Infants, toddlers, and elementary children (Ages 0–12)",
    meetingSchedule: "Saturdays / Sundays during Main Services & Midweek Kids Club",
    location: "Children's Wing & Education Center",
    leader: "Children's Ministry Team",
    contactEmail: "children@church.example",
    contactPhone: "+250 788 000 123",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Register Your Child",
    ctaUrl: "/plan-your-visit",
    status: "published",
  },
  {
    id: "default-youth",
    name: "Youth Ministry",
    slug: "youth",
    description:
      "Empowering the next generation to build an authentic faith in Jesus Christ. We offer dynamic youth services, relevant Bible study groups, fun fellowship gatherings, annual camps, retreats, and impactful community outreach activities where young people find belonging and purpose.",
    targetAudience: "Teens, High School & University Students (Ages 13–25)",
    meetingSchedule: "Friday Evenings at 5:30 PM & Youth Sabbath School",
    location: "Youth Center & Fellowship Hall",
    leader: "Youth Leadership Team",
    contactEmail: "youth@church.example",
    contactPhone: "+250 788 000 124",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Connect with Youth",
    ctaUrl: "/contact?topic=Youth+Ministry",
    status: "published",
  },
  {
    id: "default-women",
    name: "Women's Ministry",
    slug: "women",
    description:
      "Nurturing women in their spiritual journey through warm Christian fellowship, in-depth Bible studies, prayer circles, annual women's conferences, life-enriching workshops, and compassionate community outreach. A place where every woman is valued, encouraged, and equipped.",
    targetAudience: "Women of all ages and seasons of life",
    meetingSchedule: "Tuesday Mornings at 10:00 AM & First Saturday of Month at 3:00 PM",
    location: "Fellowship Hall & Fireside Room",
    leader: "Women's Ministry Leadership",
    contactEmail: "women@church.example",
    contactPhone: "+250 788 000 125",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Join Women's Fellowship",
    ctaUrl: "/contact?topic=Women's+Ministry",
    status: "published",
  },
  {
    id: "default-men",
    name: "Men's Ministry",
    slug: "men",
    description:
      "Challenging and equipping men to grow as godly leaders, husbands, fathers, and disciples of Christ. Through monthly men's fellowship breakfasts, morning prayer groups, practical Bible studies, conferences, retreats, and hands-on community service projects, brothers sharpen brothers.",
    targetAudience: "Men, young men, and fathers",
    meetingSchedule: "Saturday Mornings at 7:30 AM & Monthly Breakfast Gathering",
    location: "Church Fellowship Hall & Outdoor Pavilions",
    leader: "Men's Ministry Leadership",
    contactEmail: "men@church.example",
    contactPhone: "+250 788 000 126",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Get Involved",
    ctaUrl: "/contact?topic=Men's+Ministry",
    status: "published",
  },
  {
    id: "default-worship",
    name: "Worship & Music Ministry",
    slug: "worship",
    description:
      "Leading God's people in reverent, joyful, and spirit-filled worship. Our worship team, choir, instrumentalists, and audiovisual technicians use their musical gifts to glorify God, inspire hearts, and cultivate an atmosphere where lives encounter the living Christ.\n\nWeekly rehearsals prepare our teams for worship services, seasonal concerts, and praise celebrations.",
    targetAudience: "Musicians, vocalists, technical crew, and all worshipers",
    meetingSchedule: "Choir Rehearsals Thursday Evenings at 6:30 PM & Sabbath Morning Soundcheck",
    location: "Main Sanctuary & Rehearsal Room",
    leader: "Worship Pastor & Music Directors",
    contactEmail: "worship@church.example",
    contactPhone: "+250 788 000 127",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Audition or Join Tech",
    ctaUrl: "/contact?topic=Worship+Ministry",
    status: "published",
  },
  {
    id: "default-prayer",
    name: "Prayer Ministry",
    slug: "prayer",
    description:
      "The spiritual engine of our church family. We gather for weekly prayer meetings, maintain a continuous intercessory prayer chain for personal requests, host regular prayer vigils, and provide biblically grounded prayer resources for your personal walk with God.\n\nSubmit your confidential prayer requests anytime through our online prayer request form.",
    targetAudience: "All believers, seekers, and anyone carrying burdens",
    meetingSchedule: "Wednesday Midweek Prayer at 6:00 PM & Friday Evening Vigil",
    location: "Prayer Chapel & Online Prayer Gathering",
    leader: "Intercessory Prayer Team",
    contactEmail: "prayer@church.example",
    contactPhone: "+250 788 000 128",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Submit Prayer Request",
    ctaUrl: "/prayer-request",
    status: "published",
  },
  {
    id: "default-outreach",
    name: "Community Care & Outreach",
    slug: "outreach",
    description:
      "Putting faith into active love through compassionate community service. Our outreach initiatives include emergency food and clothing distribution, health clinics, prison visitation, elderly assistance, and neighborhood evangelism.",
    targetAudience: "Local community, vulnerable families, and church volunteers",
    meetingSchedule: "Second & Fourth Sabbath of Each Month at 2:00 PM",
    location: "Community Care Center & Field Sites",
    leader: "Community Care Team",
    contactEmail: "outreach@church.example",
    contactPhone: "+250 788 000 129",
    imageUrl: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=82",
    ctaLabel: "Volunteer with Us",
    ctaUrl: "/contact?topic=Community+Outreach",
    status: "published",
  },
];

export function getDefaultMinistry(slug: string): Ministry | undefined {
  const normalized = slug.toLowerCase().trim();
  return DEFAULT_MINISTRIES.find(
    (m) =>
      m.slug === normalized ||
      (normalized === "community-care" && m.slug === "outreach") ||
      (normalized === "outreach" && m.slug === "outreach")
  );
}
