export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "Google I/O 2026",
    image: "/images/event1.png",
    slug: "google-io-2026",
    location: "Mountain View, CA, USA",
    date: "May 20-21, 2026",
    time: "10:00 AM PDT",
  },
  {
    title: "WWDC 2026",
    image: "/images/event2.png",
    slug: "wwdc-2026",
    location: "Cupertino, CA, USA",
    date: "June 8-12, 2026",
    time: "10:00 AM PDT",
  },
  {
    title: "AWS re:Invent 2026",
    image: "/images/event3.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV, USA",
    date: "Nov 30-Dec 4, 2026",
    time: "9:00 AM PST",
  },
  {
    title: "Web Summit 2026",
    image: "/images/event4.png",
    slug: "web-summit-2026",
    location: "Lisbon, Portugal",
    date: "Nov 9-12, 2026",
    time: "9:30 AM WET",
  },
  {
    title: "ETHGlobal New York 2026",
    image: "/images/event5.png",
    slug: "ethglobal-new-york-2026",
    location: "New York City, NY, USA",
    date: "Sep 18-20, 2026",
    time: "8:30 AM EDT",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    image: "/images/event6.png",
    slug: "kubecon-cloudnativecon-na-2026",
    location: "San Diego, CA, USA",
    date: "Nov 16-19, 2026",
    time: "9:00 AM PST",
  },
];
