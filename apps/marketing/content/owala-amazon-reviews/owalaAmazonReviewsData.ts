export type ReviewMediaBase = {
  reviewId: string;
  caption: string;
  description: string;
  tone: string;
  surface: string;
};

export type ReviewImageMedia = ReviewMediaBase & {
  kind: "image";
  src: string;
  thumbSrc: string;
  alt: string;
  width: number;
  height: number;
};

export type ReviewVideoMedia = ReviewMediaBase & {
  kind: "video";
  src: string;
  poster: string;
  alt: string;
  duration: string;
  width: number;
  height: number;
};

export type ReviewMedia = ReviewImageMedia | ReviewVideoMedia;

export type OwalaReview = {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  title: string;
  date: string;
  color: string;
  size: string;
  verified: boolean;
  body: string;
  helpful: number;
  media: ReviewMedia[];
};

type ProductImageAsset = {
  key: string;
  src: string;
  color: string;
  size: string;
};

export const OWALA_TOTAL_REVIEWS = 25_000;
export const OWALA_REVIEW_IMAGE_COUNT = 520;
export const OWALA_REVIEW_VIDEO_COUNT = 110;

const FULLSCREEN_IMAGE_SIZE = 1200;
const TOTAL_REVIEW_MEDIA =
  OWALA_REVIEW_IMAGE_COUNT + OWALA_REVIEW_VIDEO_COUNT;

const PRODUCT_IMAGES: ProductImageAsset[] = [
  {
    key: "denim24",
    color: "Denim",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_Amazon_24oz_Freesip_Denim_SC_copy_300x300.png?v=1768518004",
  },
  {
    key: "denim32",
    color: "Denim",
    size: "32 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_Amazon_32oz_Freesip_Denim_SC_copy_300x300.png?v=1768518021",
  },
  {
    key: "denim40",
    color: "Denim",
    size: "40 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_FreeSip_AMZ_Denim_40oz_SC_copy_300x300.png?v=1768518032",
  },
  {
    key: "beachfront",
    color: "Beachfront",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/Beachfront_FreeSip_24oz_300x300.png?v=1753973401",
  },
  {
    key: "openAir",
    color: "Open Air",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/Open_Air_FreeSip_24oz_300x300.png?v=1753973501",
  },
  {
    key: "terracotta",
    color: "Terracotta Sunset",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_-_FreeSip_24oz_-_Terracotta_Sunset_-_SC_300x300.png?v=1755018099",
  },
  {
    key: "burgundy",
    color: "Burgundy Bay",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_-_FreeSip_24oz_-_Burgandy_Bay_-_SC_300x300.png?v=1758554764",
  },
  {
    key: "marshmallow",
    color: "Shy Marshmallow",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_Web_24oz_Freesip_Shy_Marshmallow_SC_300x300.png?v=1752849665",
  },
  {
    key: "sugarHigh",
    color: "Sugar High",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/Sugar_High_FreeSip_24oz_5f22ef13-2881-4c39-8a2a-916421be90e3_300x300.png?v=1753973213",
  },
  {
    key: "peachy",
    color: "Peachy Keen",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/Peachy_Keen_FreeSip_24oz_3c0f69be-8b2f-4c57-a95e-4bf383795039_300x300.png?v=1753973314",
  },
  {
    key: "nineties",
    color: "90s Kid",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_90s_kid_24oz_Freesip_SC_Template_2ba0cf75-99ee-477c-8da3-4e901362228e_300x300.png?v=1772222445",
  },
  {
    key: "peachMind",
    color: "Peach of Mind",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_Peach_Of_Mind_24oz_Freesip_SC_584b3b72-f2c4-4381-afe2-bd3f94520a61_300x300.png?v=1772222485",
  },
  {
    key: "outBlue",
    color: "Out of the Blue",
    size: "24 Ounces",
    src: "https://checkout.owalalife.com/cdn/shop/files/OW_out_of_the_blue_24oz_Freesip_SC_Template_5ec8d073-6de7-47a0-875e-657d63e11134_300x300.png?v=1772222501",
  },
];

const REVIEW_VIDEOS = {
  leakCheck: {
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    duration: "0:08",
  },
  commute: {
    src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    duration: "1:09",
  },
  gymBag: {
    src: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg",
    duration: "0:16",
  },
  desk: {
    src: "https://cdn.react-motion-gallery.com/slider-html/9150545-hd_1920_1080_24fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/9150545-hd_1920_1080_24fps-0.jpg",
    duration: "0:24",
  },
};

const REVIEW_VIDEO_KEYS = Object.keys(REVIEW_VIDEOS) as Array<
  keyof typeof REVIEW_VIDEOS
>;

const MEDIA_TONES = [
  ["#f2eadc", "#f8f8f4"],
  ["#dde9ee", "#f5f7fb"],
  ["#f1d9dc", "#fff6f1"],
  ["#e9eadf", "#fbfaf4"],
  ["#d9e4d9", "#f6f8f3"],
  ["#eadfd4", "#f9f4ef"],
  ["#e6e1f0", "#f8f6fc"],
  ["#dfe9f6", "#f7fbff"],
] as const;

const REVIEW_AUTHORS = [
  "Joshua",
  "Morgan A from VA",
  "A. Reed",
  "Priya S.",
  "Daniel K.",
  "Melissa",
  "C. Thompson",
  "Sara B.",
  "William H.",
  "Kayla R.",
  "Nina",
  "Evan M.",
  "Hannah P.",
  "Robert",
  "M. Cho",
  "Andrea L.",
  "Jules",
  "Tanya W.",
  "Corey",
  "Lena G.",
  "Iris M.",
  "Noah T.",
  "Camila",
  "Brianna P.",
];

const REVIEW_TITLES = [
  "The water bottle I keep reaching for",
  "Cup holder friendly and functional",
  "Cold all day, lock feels dependable",
  "The sipping options are the trick",
  "Great for desk and gym",
  "A little tall, but worth it",
  "Pretty color and no leaks",
  "Backpack pocket test passed",
  "Keeps ice overnight",
  "Easy to clean if you stay on top of it",
  "Bought one, then bought two more",
  "No straw sticking out",
  "Nice finish, slightly slippery hands",
  "Gift was a hit",
  "Actually leakproof in my tote",
  "Good everyday size",
];

const REVIEW_BODIES = [
  "Works well and has not leaked.",
  "This size fits the holders in my car and does not feel bulky in a tote. I like that the straw is built in, but I can still tip it back for a regular drink when I want more water quickly.",
  "I filled it before work, left it in a warm car for a bit, and still had cold water that evening. The locking loop is the detail that sold me because it makes the bottle feel safe in a backpack.",
  "Being able to drink through the straw or tilt the bottle is much more useful than I thought. I keep it by my laptop and use the straw most of the day, then swig after workouts. The spout cover also helps because I throw this into the same bag as keys, receipts, and snacks, and the drinking area still feels clean when I get where I am going.",
  "Great color, easy to carry, and the lid clicks shut with a satisfying little snap.",
  "The bottle is easy to carry and the lid has not leaked on me. I took off one star because the lid has several parts to rinse, but it has been simple enough when I wash it every night. I use a small brush around the gasket once or twice a week, and that has kept it from picking up any stale smell even after coffee, electrolyte mixes, and long errands in the car.",
  "The shape is easier to grab than my old tumbler, and I like that the drinking area is covered when I am walking outside.",
  [
    "I bought this for a trip and it ended up becoming my daily bottle, which surprised me because I already owned two other insulated bottles that were perfectly fine.",
    "The first real test was a long travel day with a train ride, a flight delay, and a rental car line that moved so slowly I started rationing snacks.",
    "I filled the bottle with ice water before leaving home, tucked it sideways into the backpack pocket, and expected at least a little moisture around the lid by lunchtime.",
    "There was none.",
    "It bumped against a laptop sleeve, a rolled-up jacket, and a bag of chargers for most of the day, but the lock stayed closed and the button never popped open.",
    "The covered spout mattered more than I thought it would because I kept setting the bottle down in airport seating areas, on a hotel desk, and in a sandy cup holder at the beach.",
    "I could open it and drink without feeling like the mouthpiece had been exposed to everything around me.",
    "The straw side is easy when I am walking or driving, and the wider sip side is better after a workout or when I want a bigger drink quickly.",
    "I also appreciate that the handle is solid enough to grab with two fingers when my hands are full.",
    "It is not completely weightless, especially when full, but the shape makes it easier to carry than the straight-sided bottle I used before.",
    "After a week of use, the outside had a couple of tiny marks from being tossed into a tote with keys, but the finish still looked good and the bottle never picked up a metallic taste.",
    "Cleaning takes a little attention because the lid has a few grooves and the straw needs a quick rinse, but it has not been a hassle as long as I wash it at night.",
    "I also noticed that it is quiet to open during meetings, which sounds silly until you have used bottles with loud flip lids.",
    "The silicone base of my old bottle made it wobble in cup holders, but this one sits flat and feels steadier.",
    "The best thing I can say is that I stopped thinking about it.",
    "It kept water cold, did not leak on clothes or papers, and was comfortable enough that I kept reaching for it instead of the bottles I already had.",
  ].join(" "),
  "No leaks so far, and the handle is comfortable enough for short walks.",
  "The lid took me a day to get used to because the button and lock are different from my old bottle. After that, it became second nature. I like that I can drink through the straw while driving, then tilt it back when I want a bigger drink after a workout.",
  [
    "This is bigger than I expected, but in a good way, and after using it for a few weeks I understand why people are so particular about these bottles.",
    "I work from home most days, then run errands or go to the gym in the late afternoon, so I wanted something that could move between a desk, car, and bag without needing much thought.",
    "The size has been the right compromise for me.",
    "It holds enough water that I am not constantly getting up to refill it, but it is still narrow enough to fit in the cup holder in my car and in the side pocket of my backpack.",
    "The lid is the real reason I kept using it.",
    "The button opens smoothly, the lock is easy to check at a glance, and the covered drinking area makes it feel cleaner than the open-straw cup I used before.",
    "I usually drink through the straw while working because I can keep typing or reading without lifting the bottle very high.",
    "When I come back from a walk or finish a workout, I tilt it and drink from the larger opening because that feels faster.",
    "Both options work without swapping lids or carrying an extra straw, which sounds minor but makes the bottle easier to live with.",
    "The insulation has also been strong.",
    "If I add ice in the morning, there is usually still a little left in the evening, and even when the ice melts the water stays cool.",
    "I have left it in the car during errands and come back to water that was still pleasant to drink.",
    "The outside does not sweat on my desk, so I can keep it near notebooks and a keyboard without worrying about rings or damp paper.",
    "There are a few things to know.",
    "The lid has more pieces than a very simple screw-top bottle, so I would not call it effortless to clean.",
    "I rinse the straw daily and use a small brush around the silicone parts every few days.",
    "It is also tall enough that washing it in a shallow sink can be awkward.",
    "I wish the straw brush were included, but that is easy to solve.",
    "Those are small tradeoffs for me because the bottle has been dependable, easy to drink from, and genuinely leak resistant in a bag.",
  ].join(" "),
  "Nice everyday bottle. It is not fancy, it just works.",
];

const MEDIA_CAPTIONS = [
  "Daily desk bottle",
  "Side by side color check",
  "Cup holder check",
  "Lid profile",
  "Gym bag shake test",
  "Size comparison",
  "Morning commute clip",
  "Color match with bag",
  "Clean bottle after a week",
  "Family color lineup",
  "Tote leakproof test",
  "Overnight ice check",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const reviewCopy =
  "It has been easy to carry, the lid feels secure, and the FreeSip spout is useful enough that I use it more often than any other bottle I own.";

function productImageAtSize(src: string, size: number) {
  return src.replace(/_\d+x\d+(?=\.[a-z]+(?:\?|$))/i, `_${size}x${size}`);
}

function toneAt(index: number) {
  return MEDIA_TONES[index % MEDIA_TONES.length]!;
}

function imageAssetAt(index: number) {
  return PRODUCT_IMAGES[index % PRODUCT_IMAGES.length]!;
}

function videoKeyAt(index: number) {
  return REVIEW_VIDEO_KEYS[index % REVIEW_VIDEO_KEYS.length]!;
}

function captionAt(index: number, asset: Pick<ProductImageAsset, "color">) {
  return `${MEDIA_CAPTIONS[index % MEDIA_CAPTIONS.length]} - ${asset.color}`;
}

function reviewImage(
  reviewId: string,
  asset: ProductImageAsset,
  caption: string,
  index: number,
): ReviewImageMedia {
  const tone = toneAt(index);

  return {
    kind: "image",
    src: productImageAtSize(asset.src, FULLSCREEN_IMAGE_SIZE),
    thumbSrc: asset.src,
    alt: `${caption} customer photo`,
    width: FULLSCREEN_IMAGE_SIZE,
    height: FULLSCREEN_IMAGE_SIZE,
    reviewId,
    caption,
    description: reviewCopy,
    tone: tone[0],
    surface: tone[1],
  };
}

function reviewVideo(
  reviewId: string,
  video: keyof typeof REVIEW_VIDEOS,
  caption: string,
  index: number,
): ReviewVideoMedia {
  const tone = toneAt(index);
  const source = REVIEW_VIDEOS[video];

  return {
    kind: "video",
    src: source.src,
    poster: source.poster,
    alt: `${caption} customer video`,
    duration: source.duration,
    width: 1280,
    height: 720,
    reviewId,
    caption,
    description: reviewCopy,
    tone: tone[0],
    surface: tone[1],
  };
}

function reviewMediaCountAt(index: number) {
  if (index < 12) return 9;
  if (index < 36) return 6;
  if (index < 90) return 4;
  if (index < 144) return 2;
  if (index < 198) return 1;
  return 0;
}

function shouldUseVideoMedia(args: {
  slot: number;
  imageCount: number;
  videoCount: number;
}) {
  const remainingSlots = TOTAL_REVIEW_MEDIA - args.slot;
  const remainingVideos = OWALA_REVIEW_VIDEO_COUNT - args.videoCount;

  if (remainingVideos <= 0) return false;
  if (OWALA_REVIEW_IMAGE_COUNT - args.imageCount <= 0) return true;
  if (remainingVideos >= remainingSlots) return true;

  return (args.slot + 1) % 6 === 0;
}

function reviewDateAt(index: number) {
  const day = 28 - (index % 28);
  const month = MONTHS[(4 + Math.floor(index / 28)) % MONTHS.length]!;
  const year = 2026 - (Math.floor(index / 336) % 5);

  return `${month} ${day}, ${year}`;
}

function initials(name: string) {
  return name
    .replace(/from .+$/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function reviewTitleAt(index: number, mediaCount: number) {
  const title = REVIEW_TITLES[index % REVIEW_TITLES.length]!;
  if (mediaCount >= 6) return `${title} with lots of photos`;
  if (mediaCount >= 2) return `${title} after a few weeks`;
  return title;
}

function reviewBodyAt(index: number, mediaCount: number) {
  const body = REVIEW_BODIES[index % REVIEW_BODIES.length]!;

  if (mediaCount > 0) {
    return `${body} I added ${mediaCount} ${mediaCount === 1 ? "media note" : "media notes"} because the color and lid details were easier to show than describe.`;
  }

  return body;
}

function compareReviewsByMediaCount(a: OwalaReview, b: OwalaReview) {
  return (
    b.media.length - a.media.length ||
    b.helpful - a.helpful ||
    a.id.localeCompare(b.id)
  );
}

function createOwalaReviewData() {
  let mediaSlot = 0;
  let imageCount = 0;
  let videoCount = 0;

  const reviews = Array.from({ length: OWALA_TOTAL_REVIEWS }, (_, index) => {
    const id = `review-${String(index + 1).padStart(6, "0")}`;
    const primaryAsset = imageAssetAt(index);
    const mediaCount = reviewMediaCountAt(index);
    const media: ReviewMedia[] = [];

    for (let mediaIndex = 0; mediaIndex < mediaCount; mediaIndex += 1) {
      const useVideo = shouldUseVideoMedia({
        slot: mediaSlot,
        imageCount,
        videoCount,
      });
      const asset = imageAssetAt(index + mediaIndex);
      const caption = captionAt(mediaSlot, asset);

      if (useVideo) {
        media.push(reviewVideo(id, videoKeyAt(videoCount), caption, mediaSlot));
        videoCount += 1;
      } else {
        media.push(reviewImage(id, asset, caption, mediaSlot));
        imageCount += 1;
      }

      mediaSlot += 1;
    }

    const author = REVIEW_AUTHORS[index % REVIEW_AUTHORS.length]!;
    const rating = index % 17 === 0 ? 4 : 5;

    return {
      id,
      author,
      avatar: index % 3 === 1 ? initials(author) : undefined,
      rating,
      title: reviewTitleAt(index, mediaCount),
      date: reviewDateAt(index),
      color: primaryAsset.color,
      size: primaryAsset.size,
      verified: index % 23 !== 0,
      body: reviewBodyAt(index, mediaCount),
      helpful: mediaCount > 0 ? 180 - Math.min(index, 170) : (index * 7) % 19,
      media,
    } satisfies OwalaReview;
  });

  const sortedReviews = [...reviews].sort(compareReviewsByMediaCount);

  return {
    reviews: sortedReviews,
    media: sortedReviews.flatMap((review) => review.media),
    imageCount,
    videoCount,
  };
}

const OWALA_REVIEW_DATA = createOwalaReviewData();

export const OWALA_REVIEWS = OWALA_REVIEW_DATA.reviews;
export const OWALA_REVIEW_MEDIA = OWALA_REVIEW_DATA.media;
export const OWALA_REVIEW_DATA_COUNTS = {
  totalReviews: OWALA_TOTAL_REVIEWS,
  images: OWALA_REVIEW_DATA.imageCount,
  videos: OWALA_REVIEW_DATA.videoCount,
};
